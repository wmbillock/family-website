const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const timezone = 'America/Chicago';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function validateTarget(value, zone = timezone) {
  if (zone !== timezone) throw Error(`Publication timezone must be ${timezone}`);
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(value) || !Number.isFinite(Date.parse(value))) throw Error('publishAt requires an ISO timestamp with explicit Chicago offset');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: zone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(part => [part.type, part.value]));
  const local = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  if (local !== value.slice(0,19)) throw Error('publishAt offset or wall time does not match America/Chicago (including daylight saving time)');
  return Date.parse(value);
}

function approvalHash(post, html) {
  return hash(JSON.stringify({slug:post.slug,title:post.title,summary:post.summary,date:post.date,originalPublished:post.originalPublished || null,originalUpdated:post.originalUpdated || null,publishAt:post.publication?.publishAt || null,timezone:post.publication?.timezone || timezone,holding:Boolean(post.holding),html}));
}

function validateMetadata(post, name) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || '') || name !== `${post.slug}.json`) throw Error(`Invalid slug: ${name}`);
  const date = new Date(`${post.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date || '') || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== post.date) throw Error(`Invalid date: ${name}`);
  if (typeof post.title !== 'string' || !post.title || typeof post.summary !== 'string' || !post.summary) throw Error(`Missing title or summary: ${name}`);
  if (post.originalPublished && (typeof post.originalPublished !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(post.originalPublished) || !Number.isFinite(Date.parse(post.originalPublished)) || post.originalPublished.slice(0,10) !== post.date)) throw Error(`Invalid original publication timestamp: ${name}`);
}

function loadQueue(directory, now = new Date()) {
  const instant = new Date(now).getTime();
  if (!Number.isFinite(instant)) throw Error('Invalid queue clock');
  return fs.readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => {
    const post = JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
    const publication = post.publication || {state:'draft'};
    if (!['draft','review','approved'].includes(publication.state)) throw Error(`Invalid publication state: ${name}`);
    if (post.published === true) throw Error(`Legacy published flag requires explicit queue approval: ${name}`);
    if(post.holding === true && publication.state !== 'approved') throw Error(`Holding pages require exact approved content: ${name}`);
    const target = validateTarget(publication.publishAt, publication.timezone || timezone);
    // Drafts and review copies never become public just because their date passes.
    if (publication.state !== 'approved') return {...post,queueStatus:publication.state,eligible:false};
    validateMetadata(post,name);
    const html = fs.readFileSync(path.join(directory,`${post.slug}.html`),'utf8');
    if (!html.trim()) throw Error(`Empty article: ${name}`);
    if (!/^[a-f0-9]{64}$/.test(publication.approvedSha256 || '') || publication.approvedSha256 !== approvalHash(post,html)) throw Error(`Approval no longer matches content or schedule: ${name}`);
    const eligible = target === null || target <= instant;
    return {...post,html,eligible,queueStatus:eligible ? 'due' : 'scheduled',target};
  });
}

function displayTarget(value) {
  return value ? new Intl.DateTimeFormat('en-US',{timeZone:timezone,dateStyle:'medium',timeStyle:'long'}).format(new Date(value)) : 'Immediate on deployment';
}

function outputState(output) {
  const files = {};
  function walk(directory) {
    for (const name of fs.readdirSync(directory).sort()) {
      const file = path.join(directory,name);
      if (fs.statSync(file).isDirectory()) walk(file);
      else if (name !== 'release-state.json') files[path.relative(output,file).split(path.sep).join('/')] = hash(fs.readFileSync(file));
    }
  }
  walk(output);
  return {version:1,digest:hash(JSON.stringify(files)),files};
}
module.exports = {timezone,hash,validateTarget,approvalHash,validateMetadata,loadQueue,displayTarget,outputState};
