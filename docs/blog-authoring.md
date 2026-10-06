# Technical blog

The family site remains a Create React App application. `npm run build` builds it first, then generates a separate static blog into `billock-org/build/blog/`. The blog has no client JavaScript, custom fonts, analytics, or external requests. `/blog/` is the index; `/blog/feed.xml` is RSS; articles use `/blog/<slug>/`. The family menu uses a normal anchor so the browser loads the static page.

## Write a post

Create two files in `billock-org/blog/posts/`: `<slug>.json` and `<slug>.html`. Use a permanent, lowercase, hyphen-separated slug. Metadata fields are `slug`, `title`, `summary`, `date` (YYYY-MM-DD), and `published` (boolean). Start with `published: false`. Only explicit `published: true` enters the build, index, or feed. Keep private notes outside this repository; drafts are absent from the site build but would still enter Git if committed.

Write the HTML body as an article fragment: paragraphs, h2/h3 headings, lists, pre/code, and descriptive links. The template supplies the page's h1, author, date, and navigation. Escape code examples as HTML; use alt text on images and a `.table-scroll` wrapper for wide tables. Body HTML is trusted author input, so review it for scripts, embeds, private information, and unintended external requests before publishing. Metadata is escaped automatically. Place only approved public assets in `public/blog-assets/` and link them by absolute path.

No articles are included at launch. Test fixtures exist only in temporary directories and are deleted after tests.

## Verify and preview

From `billock-org`:

```
npm ci
npm run test:blog
CI=true npm test -- --watchAll=false --runInBand
npm run build
python3 -m http.server 8764 --bind 127.0.0.1 --directory build
```

Open http://127.0.0.1:8764/blog/. The CRA development server does not run the static blog generator; use the production-build preview. The local Python server handles real files and directories but does not emulate Apache's existing SPA rewrites for family deep links.

The HTML is searchable by browser Find and crawlers. A separate search interface is deferred until actual posts warrant it. RSS includes article summaries, stable links, and dates. Do not change published slugs casually; a moved URL needs an explicit redirect on the existing host.

## Publication gate and deployment

Review the exact build before any Git publication or deployment. Existing `.github/workflows/deploy.yml` deploys automatically on pushes to `master`: Node 20, `npm ci`, `npm run build`, then the existing SFTP action uploads `billock-org/build/` to `./billock/` on the configured IONOS host using existing repository secrets. Publishing to master is therefore a production action.

After explicit approval of this result and Git publication:

1. Re-fetch origin and compare the approved base and changes with current master. Reconcile any new family-site changes in a separate reviewed diff.
2. Publish the reviewed branch/PR only with authorization. Run the same build/tests using Node 20 as CI does, and review the resulting `/blog/` and family navigation.
3. Merge the approved diff into master using the existing workflow. Do not introduce credentials, DNS changes, accounts, or hosting services.
4. Verify the Actions run and request https://billock.org/, https://billock.org/blog/, https://billock.org/blog/style.css, and https://billock.org/blog/feed.xml. Check mobile layout and every newly published post's canonical URL.

Remote deletion is not established by the SFTP workflow. Deleting local generated output does not prove an old remote post is removed. For later retractions or rollback, explicitly inspect and remove/replace only the affected remote blog files after approval. Reverting the source and deploying restores the family bundle, but may leave `/blog/` files on the server. Existing Apache fallback sends nonexistent paths (including unknown blog slugs) to the family application; no global rewrite behavior is changed by this addition.
