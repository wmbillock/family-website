const fs = require('node:fs');
const path = require('node:path');
const {buildBlog} = require('./build-blog.cjs');
const {loadQueue,displayTarget,approvalHash,hash,outputState} = require('./publication-queue.cjs');
const postsDirectory = path.join(__dirname,'../blog/posts');

async function verifyLive(output, base = 'https://billock.org/blog/', request = fetch) {
  const state = outputState(output);
  const expected = {...state.files,'release-state.json':hash(fs.readFileSync(path.join(output,'release-state.json')))};
  const differences=[];
  let retired=[];
  try {
    const response=await request(new URL('release-state.json',base),{method:'GET',redirect:'error',credentials:'omit',signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
    if(response.ok) {
      const previous=await response.json();
      if(previous.version===1 && previous.files && typeof previous.files==='object') retired=Object.keys(previous.files).filter(file=>!Object.hasOwn(state.files,file));
    }
  } catch { /* Initial installation or incomplete marker: compare intended files below. */ }

  // Compare every intended public file, not only a marker which could upload before a failure.
  for (const [file,checksum] of Object.entries(expected)) {
    try {
      const url=new URL(file,base);url.searchParams.set('queue',checksum.slice(0,12));
      const response=await request(url,{method:'GET',redirect:'error',credentials:'omit',signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
      if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== checksum) differences.push(file);
    } catch { differences.push(file); }
  }
  return {matches:differences.length===0 && retired.length===0,differences,retired,digest:state.digest};
}
function status(directory, now=new Date()) {
  return loadQueue(directory,now).map(post=>({slug:post.slug,title:post.title,state:post.queueStatus,target:displayTarget(post.publication?.publishAt),eligible:post.eligible}));
}
async function main(args) {
  const command=args[0] || 'status';
  if (command==='status') {
    const queue=status(postsDirectory);
    if(args[1]==='--live') {
      const output=path.join(__dirname,'../.queue-work/blog');buildBlog(output,postsDirectory);
      const live=await verifyLive(output);
      for(const post of queue) if(post.eligible && live.matches) post.state='published';
      console.log(`Live output: ${live.matches ? 'verified' : 'pending deployment or repair'}`);
    }
    console.table(queue);
    console.log('Times are America/Chicago. Due means eligible for the next verified deployment, not proof it is live.');
  } else if (command==='preview') {
    if(args[1] && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(args[1])) throw Error('Preview instant must include an explicit offset or Z');
    const at=args[1] ? new Date(args[1]) : new Date();
    if (!Number.isFinite(at.getTime())) throw Error('Preview requires a valid explicit timestamp');
    const output=path.join(__dirname,'../preview/blog');
    buildBlog(output,postsDirectory,at);console.log(`Preview at ${at.toISOString()}: ${output} (outside deployment build/)`);
  } else if (command==='approve') {
    const slug=args[1];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw Error('approve requires a slug');
    const file=path.join(postsDirectory,`${slug}.json`),original=fs.readFileSync(file,'utf8'),post=JSON.parse(original);
    if (!post.publication || !['draft','review'].includes(post.publication.state)) throw Error('Set publication.state to review and review the exact content/schedule before approval');
    post.publication.state='approved';delete post.published;
    post.publication.approvedSha256=approvalHash(post,fs.readFileSync(path.join(postsDirectory,`${slug}.html`),'utf8'));
    fs.writeFileSync(file,JSON.stringify(post,null,2)+'\n');
    // Validate before accepting the new metadata; rollback on invalid input.
    try {loadQueue(postsDirectory);} catch(error) {fs.writeFileSync(file,original);throw error;}
    console.log(`Recorded exact approval for ${slug}. Review the diff/preview and merge through the existing PR gate.`);
  } else if (command==='check') {
    const output=path.join(__dirname,'../.queue-work/blog');
    const now=new Date();buildBlog(output,postsDirectory,now);
    const result=await verifyLive(output);
    if(result.retired.length) throw Error('Previously deployed paths cannot be silently removed through SFTP. Restore a reviewed holding page or reconcile retained output: '+result.retired.join(', '));
    const activityMatches=await require('./verify-activity.cjs').check();
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,`deploy=${!result.matches || !activityMatches}\n`);
    const queue=status(postsDirectory,now);
    if (process.env.GITHUB_STEP_SUMMARY) {
      const approved=queue.filter(post=>['due','scheduled'].includes(post.state));
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Publication queue\n\nChecked ${now.toISOString()}. Times: America/Chicago.\n\n${approved.map(post=>`- ${post.slug}: ${post.state}; ${post.target}`).join('\n')}\n\n${queue.length-approved.length} draft/review items excluded.\n\nLive output ${result.matches?'matches':'needs deployment or repair'}.\n`);
    }
    console.log(JSON.stringify({checkedAt:now.toISOString(),queue:queue.filter(post=>['due','scheduled'].includes(post.state)),...result},null,2));
  } else if (command==='verify') {
    const result=await verifyLive(path.join(__dirname,'../build/blog'));
    console.log(JSON.stringify(result,null,2));if(!result.matches) throw Error('Deployed blog differs from build; next queue tick will retry');
    await require('./verify-activity.cjs').verify();
  } else throw Error('Commands: status, preview [ISO instant], approve <slug>, check, verify');
}
if(require.main===module) main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={verifyLive,status};
