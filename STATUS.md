# Status: 2026-09-21

Step 3 of 3 complete. Counterpoint 1.0.1 is published and verified.

Live URL: https://why-el.github.io/counterpoint/
Canonical URL: https://wael.khobalatte.com/counterpoint/
Source: https://github.com/why-el/counterpoint
Released application source: `dba9519a10151a5ad5b14699fca2ab5241d00d5d`
Pages deployment: `3f2b8d72227746a54c3b11eba8acdd9e3e865dc3`
Build time: 2026-09-21T19:40:07.966Z

The default output gain increased from 0.45 to 0.8, about 5 dB before compression. Audio now schedules one machine cycle ahead so rendering stalls do not erase upcoming notes. The `avoid-ai-tropes` skill was applied to interface text, metadata, dialogs, status messages, documentation, project guidance, and release notes. A new 60-second browser recording uses the revised text.

Verified: clean checkout installation, type checking, build, and 12 core tests; three audio regressions covering rendering stalls, cancellation, and every arrangement; Chromium controls, layouts, touch, suspension, and resilience; WebKit controls; two consecutive production checks on the same application revision; and a recording tapped from the live application's compressor output. The live recording has peak 0.180995 and RMS 0.018355. All ten published files match the clean build. Pages configuration and unrelated files are unchanged.

The interrupted development-server test and the production test's incorrect Home-key assumption are retained with their corrections in REVIEW_LOG.md and `evidence/audio-fix/`. Later test and documentation commits leave the released application code unchanged.

Artifacts: `dist/` matches the published build. The static archive is `.clean-check/audio-release/counterpoint-1.0.1-static.tar.gz`; SHA-256 `a5a7c5c4b92a2d3023a652fdfbe1d5a5f8048b7f1aafba01772739e386b6a449`. The GitHub v1.0.1 release retains the archive. The still is `public/still.jpg`; the recording is `public/counterpoint.webm`.

Unverified: physical phones, ordinary hardware GPU performance, perceptual musical listening, Firefox audio output on this server, screen-reader listening, and multi-hour operation. Firefox 3D and its audio-failure handling were checked for v1.0.0. This update's browser runs used Chromium and WebKit on a shared server with software rendering.

No new paid resources or purchases were created. Existing VM, model, and tool charges are unknown; see COSTS.md. Local development and preview servers are stopped. No background work is continuing.

Next action: open the live URL with `?v=1.0.1`, press Sound, and listen for ten seconds. To build locally: `git checkout v1.0.1`, `npm ci`, `npm test`, `npm run build`.
