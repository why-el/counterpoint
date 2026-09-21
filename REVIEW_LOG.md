# Review evidence
Evidence is in `evidence/`. Reviews use actual browser renders and interactions; automation does not establish audience enjoyment. Publication is recorded separately below.

## Gate 1 — single route (pre-multiplication)
Environment: Chromium 153.0.8010.12 / Playwright 1.63, Ubuntu 24.04, SwiftShader; fixed 960×720 and 1280×900 viewports. Source: initial prototype (recorded in first git commit).
Evidence: evidence/prototype/warm.png (defective merge), revised.png (correction), rim.png (lighting alternative), three-quarter.png, front.png, reverse.png; t-23.7 through t-40.51 impact, catch, rest, lift and launch boundary frames.
Observed defects: mixed indexed/unindexed geometry prevented fixed rails and supports from appearing; overly bright fill flattened stone; front view overlapped wheel and descending track; wheel braces obscured the marble at the crest. Corrected merge normalization, lowered fill, selected three-quarter camera, queued forward pocket placement for full assembly. Reduced shadow map from 2048 to 1024 because software capture was expensive.
Visual observations: continuous double rails form a clear open arch; ivory marble is separable from brass; ball meets the plate at t=24 and rebounds onto the catch; rest transitions are concealed inside the magazine. Reverse camera remains coherent. Flat stone and wheel surface finish still need refinement in full-machine review. No claim about audience response.
Numerical checks: 9 tests passed, including route endpoints and negative time. Screenshot automation retried sequentially after concurrent renderer load caused timeouts. Gate accepted for multiplying this route, with materials and lift visibility carried into refinement.

## Full-machine corrections
Source 391c3f9 established the complete controls; browser interaction passed with zero page errors. Evidence: chromium-interaction.json and full-first.png / full-refined.png.

Visual/mechanical defects corrected: overlapping porcelain keys; intersecting fanned tracks; unsupported floating release bars. Keys now occupy distinct slots, track planes are separated by 0.26 units, and visible brass tines below the plates follow strike deflection. Lifting bars are enclosed between two open wheel faces. Current clearance scan: evidence/rail-clearance.txt (minimum 0.199, required 0.112); core suite includes this regression check and wheel pocket synchronization.

Interaction defect: the range input called pause(), which rewrote its value before seeking. Capture the requested input value first. Keyboard Home → End → Home now moves transport 0 → 48 → 0. Preserve a focused range's phrase bounds while seeking.

Rendering refinement on ef915b0: select software low tier before initial rendering, use a diffuse studio floor, avoid duplicate pointer-event draws, and complete software frames to prevent a GPU backlog. Paused UI no longer rewrites the clock repeatedly. Pixel density is 0.8 on the known software renderer. Earlier callback averages were not GPU presentation benchmarks and are not used as achieved device FPS.

Follow-up defect: removing eager rendering left a stale camera transform for immediate raycasting after reset. Update camera matrices before projection/picking. Actual pointer re-test (evidence/pointer-retest.json): time 22 → 21.269763839855365, camera remains [0.675, 0.95, 13.5], pointer capture releases, scrub ends paused. The complete Chromium control scenario subsequently passed on 7599099.

Testing constraints: other unrelated browser workloads share this 2-vCPU / 3.8 GiB machine. Initial combined touch/viewport runs timed out, and interrupted runs are not counted as passes. Workers remain sequential. No physical phone tests or ordinary hardware benchmarks have occurred.

## Browser/audio/resilience results through 218f2b2
- Chromium 153: complete real-control scenario passed; responsive, keyboard, reduced-motion and 390px touch scenario passed. 320×720, 390×844, 844×390 and 1440×1000 captures saved. These are browser emulations, not physical phones.
- Resource stability initially appeared to grow from 59 to 61 geometries. Inspection found lazy upload of independently allocated marble geometry, not unbounded allocation. Spheres, bands, porcelain plates and pin pairs now share geometry. Repeated resize/reset/seek test passes with stable geometry and texture counts.
- Chromium resilience now passes: offline interaction after loading, oversized hash fallback, WebGL loss, illustrated fallback, restored graphics held paused, and explicitly unsupported WebGL.
- Audio analysis: 1,058,400 samples (24 seconds), peak 0.0603243, RMS 0.00581638, maximum adjacent-sample change 0.00589246, exact silent tail. At least one actual real-time event is verified, with unique generation/event IDs and no scheduling while scrubbing. Context suspension pauses transport. See audio-analysis.json and audio-scheduled.json. Musical/timbral listening remains unverified; the tools do not provide perceptual listening.
- Headless WebKit passed the complete 3D interaction scenario (54.7 seconds). Headless Firefox did not expose WebGL; its illustrated fallback passed, explicitly annotated as unverified 3D coverage. Headed Firefox on a virtual X display subsequently passed 3D interaction on d809529; its audio output remains unverified as described below.
- Score review caught permanently absent parts in the sparse variation. All eight enabled voices now appear within a two-turn phrase in every variation, with distinct densities 14 / 12 / 8 strikes per 48 seconds. Core suite: 12 passes.


## Seven review scopes — candidate through d809529

Common environment: Ubuntu 24.04 x86_64, 2 shared vCPUs, 3.8 GiB RAM, Node 22.19.0, Playwright 1.63.0. Browser workers run sequentially. Chromium 153 uses ANGLE/SwiftShader, not a hardware GPU. Firefox 155 runs in Xvfb for 3D. WebKit is the available Linux Playwright engine; a masked renderer string saying “Apple GPU” is not evidence of Apple hardware. The builder inspected renders; no independent human usability panel or fresh reviewer agent was available. Each scenario starts a fresh browser context.

### 1. Visual composition

Source: a5ffeae single-route gate, 391c3f9 full-machine refinement, d809529 final camera captures. Actions: compare lighting alternatives and front, three-quarter and rear views; inspect first frame muted; sample the complete route and record continuous playback. Evidence: `prototype/`, `full-first.png`, `full-refined.png`, `final-visual/`, and `public/counterpoint.webm`.

Observed and corrected: missing rails from a geometry merge; flat material lighting; overlapping keys; a visually attractive but intersecting fan. The chosen barrel silhouette keeps the flywheel separated from the descending rail arch and exposes ivory keys at the right. Narrow warm reflections distinguish brass from the broad ivory highlights. The dark plinth remains readable without bloom. Rear views retain supports, return paths and the magazine. Small distant rails alias under software low quality, and the side profile intentionally overlaps parallel lanes. Those are visible limitations, not evidence of physical manufacturing accuracy. No claim that test counts establish mesmerizing motion.

### 2. Mechanical cause and effect

Source: 391c3f9 geometry correction, 7211cbc shared components, d809529 review. Actions: sample every route boundary at positive/negative time, inspect approach/contact/rebound/return images, scan neighboring rails, compare wheel pocket angles to lifted marbles. Evidence: `rail-clearance.txt`, core trajectory/clearance/pocket tests, `prototype/t-*.png`, `final-visual/time-*.png`.

Fixes/retest: separate track planes replaced crossed lanes; minimum sampled neighboring rail clearance 0.199 exceeds 0.112 required center distance. Marble trajectories join at launch, impact, catch, magazine and lift boundaries. Existing flights retain their enabling score through edits; an outgoing plate does not park until its final ball has struck. Visible tines and plates deflect from the same strike age as the sound. Twelve core tests pass. Artistic approximations: analytical acceleration/rebound, motor-driven return against gravity, rigid plate tilt representing flex, no force simulation, and concealed stationary marbles inside the magazine. Fine rolling markings are illustrative; angular velocity is not a rigid-body contact solver.

### 3. First-use interaction

Source: 7599099 picking fix; d809529 touch refinement. Actions: use the scene and native controls in fresh contexts, tap a real projected resonator, orbit empty space, reset, drag the physical wheel, seek with Home/End, open Notes/About, share and reopen. Evidence: `chromium-controls-results.json`, `pointer-retest.json`, `chromium-touch-audio-final.json`, `firefox-headed-results.json`, engine interaction reports, and `visual-performance.json` interrupted-gesture checks.

Defects/fixes: range input previously overwrote its requested time during pause; fixed value capture and focused phrase bounds. Deferred rendering left a stale camera matrix during immediate picking after reset; projection/raycast now updates it. Both real-control scenarios pass. Pinch cancels the initial single-finger action and changes only camera distance; tested with native Chromium touch events. Native labels and a small on-scene hint expose the controls without a tutorial. No uncoached human discovery study was conducted, so ease of discovery remains a qualitative limitation rather than a passed human test.

### 4. Time and sound

Source: 7211cbc scheduler verification; 218f2b2 all-voice variations; d809529 bounded activation. Actions: deterministic exact-time replay, negative and large times, partitioned event lookup across ten turns, score edits with latched flights, reverse/seek without events, real user-gesture AudioContext start, context suspension, and offline waveform rendering. Evidence: core tests, `audio-analysis.json`, `audio-scheduled.json`, `composition.wav`, `chromium-touch-audio-final.json`.

Fixes/retest: sparse arrangement previously omitted some enabled notes permanently; all three now include all eight pitches in a 48-second phrase, with 14/12/8 strikes. Numerical audio checks show no clipping (peak 0.0603243), RMS 0.00581638, maximum adjacent-sample change 0.00589246 and a silent tail. Real-time scheduling emits actual unique generation/event IDs. Pausing/seeking cancels future sound; restoration does not replay a backlog. Chromium and WebKit audio contexts reach running. Firefox's plain independent AudioContext also remains suspended on this VM; a five-second application timeout now reports failure and allows retry. See `firefox-audio-environment.json`. Three private audio-runtime setup attempts failed on missing libraries; setup stopped without altering system services. Firefox audible output and musical/timbral perceptual listening are **unverified**. The generated WAV is evidence for numerical inspection, not a claim that it was heard. Multi-hour soak testing is unverified.

### 5. Browser, touch and accessibility

Source: 7599099–d809529. Actions: Chromium, WebKit and headed Firefox real controls; headless Firefox fallback; 320×720, 390×844, 844×390, 1440×1000 viewport captures; reduced motion; focus outline and keyboard order; canvas keyboard orbit/zoom/reset; native note/time controls; touch tapping and two-finger pinch. Evidence: `cross-engine-headless-results.json`, `firefox-headed-results.json`, `chromium-touch-audio-final.json`, `viewport-*.png`.

Results: no horizontal overflow or clipped dock controls at the recorded widths; reduced motion starts held with explicit Play; Sound does not create a context before a gesture; names and pressed states are exposed. Headed Firefox 3D interaction passes; headless Firefox's unavailable WebGL correctly shows a local still and explanation. Initial combined tests timed out under shared software-renderer load and are retained as failures, not counted as successes. Later focused retests pass. These are browser/device emulations, **not physical iPhone or Android tests**. Screen-reader listening and operating-system magnification were not tested.

### 6. Performance and resilience

Source: ef915b0 software path, 7211cbc shared geometry, d809529 capture. Actions: software-renderer timing in both quality tiers, draw/resource counts, garbage-collected JS heap comparison, repeated resize/reset/seek, offline interaction after loading, oversized/malformed URL state, WebGL loss/restoration and unavailable graphics. Evidence: `visual-performance.json`, `chromium-resilience-audio-results.json`, core state-validation tests.

Fixes/retest: select low quality before first draw on known software renderers, remove redundant event-driven renders, use a diffuse floor and local contact shadow, and finish software GPU work to prevent a queued-frame backlog. Shared marble/stripe/plate/pin geometry corrected lazy resource-count growth. Twelve resize/reset/seek cycles keep geometry and texture counts stable; offline interaction continues; malformed state falls back to a bounded default. Lost graphics pauses and shows the actual sculpture still; restored graphics stays paused. Hidden-tab testing records whether the browser actually hid the tab; if not, the report explicitly labels a dispatched visibility event as simulated. Callback timing on this contended software VM is **not** a laptop/phone benchmark. The 60fps hardware and 30fps lower-tier targets remain unverified on ordinary hardware. No service worker: offline interaction works after loading, but a fresh offline navigation is not promised.

### 7. Clean build and published release

Pending final candidate commit, clean checkout build, isolated Pages publication, matching live release metadata and two consecutive production smoke checks. Existing Pages master/root/CNAME must be preserved. This section will be completed with exact source/deployment revisions and live evidence after publication; localhost checks alone are not release acceptance.


Final capture observations: selected/front/rear and contact/loop frames were inspected directly. The continuous browser recording contains running, wheel rewind, held-camera orbit and resumed playback; the published 80-second excerpt removes only the first 20 seconds of development-server startup. The original 100.32-second capture is retained in evidence/recordings. A sampled frame sheet is in evidence/video-frames; its empty sixth tile is padding, not a blank frame in the application.

Timing evidence on d809529: high tier submitted 88 draw calls / 228,924 triangles; low tier 51 / 117,264. Both retained 25 uploaded geometries. Collected JS heap changed from 12,203,672 to 12,308,356 bytes over the short review, not a multi-hour leak claim. Unfiltered RAF intervals averaged 277 ms during the high-tier sample and 1,672 ms during the low-tier sample, including shader/tier transitions and VM stalls; these short samples do not establish comparative steady-state performance. The old diagnostic erroneously omitted intervals >=1 second (thus printed misleading ~17 ms means). The final candidate now includes those stalls and reevaluates adaptive quality after the initial sample window. The independent unfiltered timing report is retained unchanged. No 30/60 fps result is claimed for this software VM. Hidden-tab state was simulated because headless Chromium did not natively hide its background tab; the real handler held time and restored paused. Mouse release outside the canvas and Escape cancellation both ended scrubbing safely.


Production correction after the first deployment (7ef8248 / Pages 5edf18d): the first automated production scenario returned green, but inspecting its 390px screenshot revealed an empty sculpture area. This result is explicitly rejected in `release-7ef8248-first.json`. The ResizeObserver cleared the WebGL drawing buffer after the earlier window-resize dirty flag had already been consumed. The observer now invalidates the scene after resizing, so a held scene receives another draw. The responsive test no longer seeks after each resize (which had masked the defect), and both responsive and production checks reject an empty canvas capture. New source/build and two fresh consecutive production checks are required; the prior green result does not count.

Resize correction retest: the strengthened Chromium viewport/touch scenario passed in 44.7 seconds, with unchanged paused time and nonblank canvas captures at all four sizes. The 320px capture was inspected directly: the full machine is framed above the controls. Evidence: `chromium-paused-resize-regression.json` and updated `viewport-*.png`. This new regression explicitly checks rendering after resize without seeking or otherwise forcing a draw.
