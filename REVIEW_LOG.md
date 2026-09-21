# Review log

Evidence paths below are relative to `evidence/`, unless stated otherwise. Tests record observable behavior. They do not establish audience enjoyment or musical quality.

## Environment

Reviews ran on Ubuntu 24.04 x86_64, two shared vCPUs, 3.8 GiB RAM, Node 22.19.0, and Playwright 1.63.0. Chromium 153 uses ANGLE/SwiftShader. Firefox 155 needs an Xvfb display for WebGL. WebKit is the Linux Playwright engine; its masked “Apple GPU” string does not identify physical Apple hardware. Browser workers run sequentially to limit contention.

The builder inspected the captures. No independent human usability panel or reviewer agent participated. Browser scenarios start in fresh contexts. Physical phones, ordinary hardware GPU performance, screen-reader listening, perceptual musical listening, Firefox audio output on this server, and multi-hour operation remain unverified.

## First gate: one complete route

Source: `a5ffeae`, before routes were multiplied. Chromium captured 960×720 and 1280×900 views with alternative lighting and camera positions. `prototype/` contains `warm.png`, `revised.png`, `rim.png`, `three-quarter.png`, `front.png`, `reverse.png`, and sampled frames from t=23.7 through t=40.51.

Mixed indexed and unindexed geometry hid the rails and supports. Merge normalization restored them. Bright fill flattened the stone, so fill intensity was reduced. The front view overlapped the wheel and descending track; the three-quarter view separated them. Wheel braces obscured the marble near the crest, which required forward pocket placement in the full assembly. Shadow resolution fell from 2048 to 1024 because software capture was slow.

The revised images show continuous double rails, a marble meeting the plate at t=24, a rebound onto the catch, and a concealed rest transition inside the magazine. The reverse view retains the route. Nine endpoint, continuity, and negative-time tests passed. The route was then multiplied, with stone finish and lift visibility still requiring refinement. Parallel captures had timed out under renderer contention; sequential retests supplied the accepted evidence.

## 1. Visual composition

Sources: `a5ffeae` route gate, `391c3f9` full assembly, and `d809529` final camera captures. Actions included comparing lighting, viewing front/three-quarter/rear angles, inspecting muted playback, sampling a full route, and recording continuous operation. Evidence: `prototype/`, `full-first.png`, `full-refined.png`, `final-visual/`, and `public/counterpoint.webm`.

The first full assembly had overlapping porcelain plates, intersecting fanned tracks, and unsupported release bars. Separate plate slots and parallel track planes replaced those overlaps. Lifting bars now sit between two open wheel faces. The chosen angle separates the flywheel from the rail arch and exposes the plates on the right. Brass has narrow warm reflections; ivory has broader highlights. Rear views retain supports, return paths, and the magazine.

Distant rails alias at low software quality, and the side profile overlaps parallel lanes. These remain visible limits. The final front/rear, contact, and loop frames were inspected directly. The version 1.0.0 80-second recording includes playback, wheel rewind, paused camera rotation, and resumed motion. It removes the first 20 seconds of development-server startup from the retained 100.32-second capture in `recordings/`. The empty sixth tile in `video-frames/` is contact-sheet padding.

## 2. Mechanical cause and effect

Sources: `391c3f9` geometry correction, `7211cbc` shared components, and `d809529` review. Checks sampled positive and negative route boundaries, approach/contact/rebound/return frames, neighboring rail clearance, and wheel pocket alignment. Evidence: `rail-clearance.txt`, core tests, `prototype/t-*.png`, and `final-visual/time-*.png`.

The corrected track planes are 0.26 units apart. The minimum sampled marble-center distance to a neighboring rail is 0.199; the required distance is 0.112. Routes join at launch, impact, catch, magazine, and lift boundaries. Active routes retain their enabling score after edits. A plate remains active until its last marble strikes, and its tine deflects from the same strike time used by audio. Twelve core tests passed.

The machine uses analytical acceleration and rebound, motor-driven return against gravity, rigid plate tilt to represent flex, and stationary marbles concealed inside the magazine. Rolling markings are illustrative. No force or rigid-body contact solver is implemented.

## 3. First-use interaction

Sources: `391c3f9` controls, `7599099` picking correction, and `d809529` touch changes. Fresh contexts exercised projected resonator taps, empty-space orbit, reset, flywheel dragging, keyboard seeks, Notes/About, sharing, and reopening. Evidence: `chromium-controls-results.json`, `pointer-retest.json`, `chromium-touch-audio-final.json`, `firefox-headed-results.json`, engine interaction reports, and `visual-performance.json`.

The time slider originally called pause before reading its value, which reset the requested time. Reading the value first fixed it. Keyboard Home → End → Home now produces 0 → 48 → 0. Focused sliders retain their phrase bounds during seeks.

Deferring rendering exposed stale camera transforms when picking immediately after reset. Projection and raycasting now update camera matrices. In the pointer retest, time moved from 22 to 21.269763839855365 while the camera remained [0.675, 0.95, 13.5]; pointer capture ended and playback stayed paused. The complete Chromium scenario then passed on `7599099`.

Pinch cancels the initial single-finger action and changes camera distance without toggling a note. Mouse release outside the canvas and Escape both end scrubbing. Native controls provide labels and keyboard access. No uncoached human discovery study was conducted, so these results establish control behavior rather than ease of discovery.

## 4. Time and sound

Sources: `7211cbc` scheduling checks, `218f2b2` score correction, and `d809529` bounded audio activation. Tests covered exact-time replay, negative and large times, event lookup across ten turns, edits with active routes, silent scrubbing, audio activation from a click, context suspension, and offline waveform rendering. Evidence: core tests, `audio-analysis.json`, `audio-scheduled.json`, `composition.wav`, and `chromium-touch-audio-final.json`.

The sparse arrangement originally omitted some enabled notes. Each variation now includes all eight pitches within 48 seconds, at densities of 14, 12, and 8 strikes. Initial offline analysis of 1,058,400 samples gave peak 0.0603243, RMS 0.00581638, maximum adjacent-sample change 0.00589246, and a silent tail. Those historical values used the original lower gain and a render path that bypassed the live compressor; they did not prove audible output from the running application.

Chromium and WebKit contexts reached the running state. Scheduling IDs were unique within each generation, and scrubbing added none. Suspension paused the transport. Firefox's independent plain AudioContext remained suspended too; `firefox-audio-environment.json` records the environment failure. A five-second application timeout now exposes a retry. Three rootless audio-runtime setup attempts failed on missing libraries, and setup stopped without changing system services.

### Version 1.0.1 audio correction

The user confirmed sound in Chrome but reported low volume. A recording tapped the application's actual compressor output: `audio-fix/before.json` records peak 0.1036701 and RMS 0.0114475. This demonstrates generated audio in that test environment, without identifying the cause of every earlier report of silence.

A separate reproducible test blocked JavaScript for 2.5 seconds across the note at transport t=21. With the old 140 ms horizon, the recorded output was effectively silent: peak 2.10848e-34. Scheduling one 24-second machine cycle ahead lets Web Audio execute the note during the stall. The corrected test recorded peak 0.127463 and RMS 0.0224915. Disabling sound before the stall still cancelled the queued notes, yielding peak 2.10848e-34. Evidence: `audio-fix/stall-before.*`, `stall-after.*`, and `cancel-after.*`; automated regressions use `tests/audio-harness.html`.

Master gain increased from 0.45 to 0.8, approximately 5 dB before compression. Offline rendering now uses the live compressor settings. Play, Sound, and score edits schedule immediately, before another rendering frame can block their timer. The horizon and queued notes remain bounded. A stall longer than one cycle can still omit elapsed notes.

The generated recordings support waveform inspection. Perceptual listening remains unverified. All three arrangements passed analysis through the live gain and compressor: peak 0.182271–0.183484, RMS 0.013069–0.017790, and maximum adjacent-sample change below 0.01938. See `audio-fix/arrangements.json`. The two recorded-output regressions and the three-arrangement analysis passed in 18.9 seconds.

Chromium passed playback, rewind, sharing, keyboard controls, 320–1440px layouts, touch/pinch, waveform analysis, scheduling, and suspension checks. The first resilience run was interrupted by Vite reloading after a source comment edit while graphics were lost; its navigation error and screenshot are retained in `audio-fix/chromium-initial/`. The test was rerun against a static preview with no hot reload and passed in 4.1 minutes. No runtime change was needed. Reports are in `audio-fix/audio-regressions/` and `audio-fix/resilience-static/`.

## 5. Browser, touch, and accessibility

Sources: `7599099` through `d809529`, followed by the `c7c18ac` resize correction. Checks covered Chromium, WebKit, headed Firefox, headless Firefox fallback, keyboard focus and order, canvas keyboard controls, reduced motion, native note/time controls, touch taps, and pinch. Viewports were 320×720, 390×844, 844×390, and 1440×1000. Evidence: `cross-engine-headless-results.json`, `firefox-headed-results.json`, `chromium-touch-audio-final.json`, and `viewport-*.png`.

Controls remained within the recorded viewport bounds. Reduced motion started paused, and no AudioContext existed before Sound. Buttons exposed names and pressed states. Headless Firefox displayed the local fallback image when WebGL was unavailable; headed Firefox passed 3D interaction. WebKit passed the complete control scenario in 54.7 seconds.

Combined touch/viewport tests initially timed out on the shared VM. Those runs remain failures; later sequential retests passed. Touch and viewport emulation do not establish behavior on physical phones. Operating-system magnification and screen-reader listening were not tested.

## 6. Performance and resilience

Sources: `ef915b0` software rendering, `7211cbc` shared geometry, `d809529` measurements, and `c7c18ac` resize correction. Tests covered quality tiers, draw/resource counts, heap samples, twelve resize/reset/seek cycles, loaded-page offline interaction, malformed and oversized shared state, WebGL loss/restoration, and unavailable graphics. Evidence: `visual-performance.json`, `chromium-resilience-audio-results.json`, and core state-validation tests.

The software path now selects low quality before its first draw, removes redundant event-driven draws, uses a diffuse floor, and waits for submitted GPU work to prevent a growing queue. Shared spheres, bands, plates, and pin pairs removed lazy resource growth from 59 to 61 geometries. Repeated interaction retained 25 uploaded geometries and stable texture counts.

On `d809529`, high quality used 88 draw calls and 228,924 triangles; low quality used 51 and 117,264. Collected JS heap changed from 12,203,672 to 12,308,356 bytes during the short review. Unfiltered RAF intervals averaged 277 ms and 1,672 ms respectively, including tier transitions and VM stalls. These samples do not establish steady-state performance or a long-term leak result. The old diagnostic omitted intervals of at least one second and misleadingly reported roughly 17 ms means. The final implementation retains those intervals. Ordinary hardware targets of 60 fps, or 30 fps at lower quality, remain unverified.

Offline interaction works after loading. Fresh offline navigation is unsupported because there is no service worker. Invalid shared state uses bounded defaults. WebGL loss pauses playback and displays the still; restoration stays paused. Headless Chromium did not hide its background tab, so hidden-tab coverage used a dispatched visibility event and is recorded as simulated.

The first production check on `7ef8248` returned green, but screenshot inspection found an empty paused canvas at 390px. `release-7ef8248-first.json` is rejected evidence. The ResizeObserver had cleared the drawing buffer after the window-resize dirty flag was consumed. It now requests another draw. The revised regression resizes without seeking or manually forcing a draw and rejects an empty canvas. It passed in 44.7 seconds at all four widths, with unchanged paused time. The 320px capture shows the machine above its controls. Evidence: `chromium-paused-resize-regression.json`.

## 7. Clean build and publication

Version 1.0.0 source: `c7c18ac8f56718f6cecf71421b5fe3c68a5f9582`. Pages deployment: `7c570fd558ef23b3ab7a6aba65c5f15f0742ca7a`. A fresh clone passed `npm ci`, all 12 core tests, TypeScript checking, and Vite build at 2026-09-21T05:58:15.058Z. All ten live files matched the clean artifact. Evidence: `clean-build.log`, `release-manifest.json`, `pages-build.json`, and `live-asset-integrity.json`. The 614 kB raw / 156 kB gzip Three.js bundle retains Vite's 500 kB advisory.

The entry URL is https://why-el.github.io/counterpoint/ and its existing custom domain is https://wael.khobalatte.com/counterpoint/ . Only `counterpoint/` changed from site baseline `82ebae4` to the deployment. Root files, CNAME, Pages branch, and global HTTPS settings match `pages-configuration-before.json` and `pages-configuration-after.json`.

Two consecutive production checks passed on that candidate: 06:04:49–06:05:56 UTC with reduced motion, then 06:06:22–06:07:44 UTC with ordinary motion. Both checked startup, playback, keyboard seek, notes, audio activation, camera/reset, wheel scrub, sharing, refresh, desktop/mobile rendering, network responses, console errors, and matching release metadata before and after. Their desktop/mobile captures were inspected. Evidence: `live-1.json`, `live-2.json`, PNGs, and process logs.

An earlier attempt ended with an unexpected browser closure while clicking Notes. Its cause is unknown. It was rejected and retained in `live-interrupted-attempt.json`; the full two-check sequence restarted with lifecycle logging.

The v1.0.0 GitHub release retains the exact static archive, SHA-256 `5209d26a7fa5cf64a178658b91cdc7aae1ba56af90d703381ed341f41e7e6d7b`. Its tag identifies the source above. Later evidence-only commits do not change that build. Deployment runs independently of the development VM.

Version 1.0.1 changes audio scheduling, gain, and maintained prose. WebKit passed the real-control scenario in 54.7 seconds on the static build; see `audio-fix/webkit-static/`. Help and Notes were captured at 960px and 320px, inspected directly, and checked for horizontal overflow. The instructions, close control, and source link fit at 320px. Evidence: `audio-fix/copy/`. The browser recording was refreshed with a 60-second excerpt of playback and wheel interaction to match the revised text. The complete capture and clip metadata remain in `audio-fix/copy/`. Production results follow below. The `avoid-ai-tropes` skill was read with its full reference catalogue; interface text, metadata, dialogs, status messages, documentation, and release notes use the revised style. Historical raw logs and exact evidence remain unchanged.


The first 1.0.1 production check passed; the second exposed a test error under slow startup. The test assumed the time slider's Home position was always zero. By then transport had entered the next phrase, whose minimum was 48 seconds, and the application correctly sought to 48. The smoke test now reads the slider's phrase minimum. It also checks autoplay after shared navigation and refresh, then pauses before inspecting the scene. Application code and deployed revision are unchanged. The rejected pair is retained in `audio-fix/live-initial/`; the final pair was restarted after this correction.


### Version 1.0.1 production results

Application source `dba9519a10151a5ad5b14699fca2ab5241d00d5d`, Pages commit `3f2b8d72227746a54c3b11eba8acdd9e3e865dc3`, built 2026-09-21T19:40:07.966Z from a clean clone. Installation, all 12 core tests, TypeScript checking, and the static build passed. All ten live files match the clean artifact. The existing CNAME, Pages branch, global HTTPS setting, and unrelated project files are unchanged. Evidence: `audio-fix/clean-build.log`, `release-record.json`, `live-integrity.json`, `pages-before.json`, `pages-after.json`, and `deployment-scope.json`.

Two consecutive Chromium checks passed on this release: 2026-09-21T19:50:00.517Z to 2026-09-21T19:51:34.841Z, then 2026-09-21T19:51:35.536Z to 2026-09-21T19:53:29.804Z. Both checked release metadata before and after, startup, controls, note edits, audio activation, sharing, refresh, wheel scrubbing, desktop/mobile rendering, and console/network errors. The first used reduced motion and the second ordinary motion. Both final desktop/mobile image pairs were inspected. Reports and captures are `audio-fix/live-1*` and `live-2*`.

A separate live recording used an explicit Sound click and captured the application's compressor output. Peak was 0.180995, RMS 0.018355, with no page errors or duplicate scheduling IDs within a generation. See `audio-fix/live-after.json` and `.webm`. This checks generated output; perceptual listening remains unverified. The retained archive's SHA-256 is `a5a7c5c4b92a2d3023a652fdfbe1d5a5f8048b7f1aafba01772739e386b6a449`. Test and documentation corrections after the source commit do not change the published application.

The server was under heavy shared load during verification; `audio-fix/verification-environment.json` records the environment. No hardware performance claim follows from these runs. Existing coverage limits listed above remain unchanged.
