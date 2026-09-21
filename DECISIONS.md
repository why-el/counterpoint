# Decisions

## Build and assets

Use TypeScript, Vite, Three.js with WebGL2, and Web Audio. The static build matches the requested GitHub Pages deployment. Dependencies were pinned after checking package versions and official documentation on 2026-09-21. Geometry, material textures, and audio are generated locally.

The machine has an open flywheel at the side, curved double rails, porcelain plates, and an engraved stone base. A warm key light and cooler rim light separate the materials. The original fanned tracks intersected; eight parallel vertical track planes, 0.26 units apart, replaced them. The sampled minimum distance to a neighboring rail is 0.199, exceeding the required ball-plus-rail radius of 0.112.

## Motion and score

Analytical paths define lift, rail travel, free drop, rebound, return, and concealed rest. Wheel pocket angles follow the same clock and align with the 1.5-second release grid. This is driven choreography; it makes no claim of rigid-body physical accuracy.

Score revisions activate on three-second boundaries. Each marble retains the score from the start of its lift, 13.5 seconds before impact. A disabled note therefore finishes any active routes. Pending feedback appears immediately. Session rewind retains revisions; shared URLs contain the desired arrangement without its editing history.

## Audio

Audio starts after an explicit Sound action. Modal sine synthesis supplies three timbres. Reverse is silent, and a suspended audio context pauses playback. Firefox activation has a five-second timeout so an unavailable audio device cannot leave the control stuck.

Version 1.0.1 changes master gain from 0.45 to 0.8, about 5 dB before compression. Offline analysis now includes the same compressor as live playback. The previous 140 ms scheduling horizon could miss a strike during a long rendering stall. Scheduling one 24-second machine cycle ahead bounds the queue to the strikes within that interval. Native Web Audio executes them while rendering blocks JavaScript. Edits and transport actions cancel the queued bus and schedule the revised events immediately. Stalls beyond that horizon can still skip notes; missed history is never replayed as a burst.

## Input and rendering

Pinch zoom cancels the initial single-finger action. HTML and keyboard controls provide alternatives to direct manipulation. Camera matrices update before picking, and the resize observer requests a redraw even while paused.

Known software renderers start at low quality with pixel density 0.8. Camera gestures request a frame instead of rendering on each pointer event. Software rendering completes submitted GPU work to prevent a growing queue; hardware rendering retains the asynchronous path. Frame measurements include stalls of one second or longer.

## Testing and publication

No connected Browser plugin session was available. Tests use the project's installed Playwright engines. Chromium uses SwiftShader on this server. Firefox needs an Xvfb display for WebGL, and its independent AudioContext cannot resume without a functioning audio sink. The audio fixture records generated output for numerical checks. Device performance and perceptual listening remain unverified.

Publish only the isolated `/counterpoint/` directory in `why-el/why-el.github.io`. Preserve the site root, CNAME, Pages configuration, and unrelated files. The existing custom domain redirects the Pages alias. Counterpoint upgrades its own HTTP custom-domain URL to HTTPS without changing the site's global setting. Source lives in `why-el/counterpoint`.

Use the `avoid-ai-tropes` writing skill for interface text, documentation, release notes, and project responses. Keep control labels specific, preserve evidence and technical qualifications, and leave exact historical logs unchanged.
