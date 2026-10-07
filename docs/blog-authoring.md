# Technical blog and publishing queue

The family site remains Create React App. `/willow` defaults to Blog and reads the published-only `/blog/posts.json`; standalone `/blog/<slug>/`, archive `/blog/`, and RSS `/blog/feed.xml` stay stable. Article pages use plain HTML/CSS without client scripts or analytics. Existing host is IONOS with GitHub Actions → SFTP deployment.

## Authoring and exact approval

Each article has `billock-org/blog/posts/<slug>.json` plus its HTML fragment. Metadata supplies `slug`, `title`, `summary`, original `date`, optional `originalPublished`/`originalUpdated`, and `publication`. The template supplies heading, Willow Billock byline, original date and navigation. This repository is **public**: do not commit private notes or unapproved sensitive drafts just because the site build excludes them.

Start new metadata with:

```json
"publication": {
  "state": "draft",
  "publishAt": "2026-12-08T10:00:00-06:00",
  "timezone": "America/Chicago"
}
```

States are `draft`, `review`, and `approved`. A past target never releases draft/review content. `publishAt: null` means immediate release after approved deployment. The historical article/RSS date is independent of this new release target. Old `published: true` flags fail closed rather than bypass approval.

Review exact prose, claims, scripts/embeds, private information, assets and citations. Write semantic HTML with paragraphs, h2/h3, lists, pre/code and descriptive links. Only articles with actual user approval should reach `approved` through the reviewed PR process. After exact content and schedule review, set state to `review`, then from `billock-org` run:

```
npm run blog:approve -- <slug>
```

This records `approvedSha256`, binding exact HTML, public metadata, original timestamps, target, timezone and holding behavior. Changes invalidate approval and stop deployment until reviewed and approved again. The command records a decision; it does not establish user authorization. Review its diff before merging. Invalid approval attempts restore the original file.

## Companion publication privacy

LinkedIn companions require separate review of the exact final artifact and explicit publication authorization. Review each channel independently for private information, including text, assets, alt text and linked previews. Keep private or unapproved drafts outside this public repository. An approved blog release never authorizes a LinkedIn post.

## Chicago time

Targets require full ISO timestamps with the explicit offset matching **America/Chicago** at that instant. CDT uses `-05:00`, CST uses `-06:00`; nonexistent spring times and wrong offsets are rejected. Choose the offset explicitly during the repeated fall hour. Date-only/UTC-only targets and other timezone names are rejected.

Agile targets **October 8, 2026, 10:00 AM CDT (15:00 UTC)**. Metrics is already approved for immediate publication. The queue migration does not rewrite either body.

## Queue status and preview

```
npm run blog:queue
npm run blog:queue -- --live
npm run blog:preview
npm run blog:preview -- 2026-10-08T15:00:00Z
npm run test:blog
npm run build
```

Status distinguishes draft/review, approved scheduled, and due. Due means eligible for the next deployment, not proof it is live. `--live` checks every public file and labels eligible entries published only if intended output actually matches. Targets display Chicago time.

Preview writes to ignored `preview/blog/`, outside deployment `build/`. Future previews include only approved scheduled content, never unapproved drafts. Serve with `python3 -m http.server 8764 --bind 127.0.0.1 --directory preview` and open `/blog/`. It is not uploaded. CRA’s development server does not generate static blog pages.

Production uses the actual build clock. Future bodies, summaries, RSS items, manifest entries and internal article links are omitted by generation, not hidden client-side. Internal references render as the same plain text until their target becomes public, then restore automatically.

## Durable worker and recovery

`.github/workflows/deploy.yml` processes the whole queue on master pushes, manual dispatch and a shared `2-59/5 * * * *` UTC schedule. There is one recurring worker, not one delayed job per article. It checks current master, serializes production uploads, and reuses the same IONOS host/SFTP secrets with read-only GitHub repository permissions.

The lightweight Node check generates intended output and compares every live file hash: article/holding pages, archive, RSS, manifest, CSS and release-state marker. Matching recurring/manual workers skip npm install, React build and SFTP. Pushes still deploy the family application. Due changes or missing/partial output trigger build/upload/full verification. A marker-only successful upload cannot conceal stale article files. If a readable prior public marker records paths missing from the new output, the worker fails closed before uploading: restore a reviewed holding page rather than silently leaving stale SFTP content. Missing/unreadable markers cannot establish unknown historical paths; keep previously public routes explicitly held and verify them, as this migration does. Next ticks retry failures, are idempotent, and recover overdue items by current time without changing Git or storing per-post timers.

The public `release-state.json` contains only hashes/paths of current public output; no future queue contents, titles or dates. Actions summaries show approved queue status and live-match results. Source queue is durable in reviewed Git metadata; deployment success is separately verified.

[GitHub schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) can be delayed/dropped under load or disabled after 60 days of public-repository inactivity. Release time is approximate. If overdue, inspect Actions and manually run **Build & Deploy** to retry the same queue. No new account, credential, DNS, paid service or host scheduler is introduced.

## Holding pages and rollback

Agile’s previously public URL has `holding: true` while waiting for its approved target. Only exact approved metadata may emit holding pages; draft/review holding requests fail closed. Holding overwrites the existing static `index.html`, uses `noindex`, and stays out of archive/RSS/manifest. At target time the original body automatically replaces it. Source/history remain.

Removing a generated article alone is unsafe because remote deletion is not established by the SFTP action. Withhold previously public content using a reviewed future target and holding flag, reapprove the exact schedule change, and verify both `/blog/<slug>/` and `/blog/<slug>/index.html`. Retain withdrawal evidence privately; never purge source or remote files.

Keep the existing delayed Agile automation until native deployment and worker verification complete. To roll back this queue release, revert its entire PR (metadata plus generator/workflow together), preserving the previous Metrics-first/Agile-held state. Inspect actual URLs and Actions; a partial upload is not a successful release.
