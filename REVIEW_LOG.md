# Test results

Reviews ran on 2026-09-21 with Playwright 1.63, Node 22.19, Chromium, Firefox, and WebKit on Linux. Graphics used software rendering. Screenshots were inspected by the builder; there was no independent usability or listening review.

Version 1.0.1 (`dba9519`) passed 12 core tests, three audio regressions, Chromium interaction/layout checks, and WebKit controls. Two consecutive checks of the published build passed: [first](evidence/audio-fix/live-1.json), [second](evidence/audio-fix/live-2.json). [All ten deployed files matched the build](evidence/audio-fix/live-integrity.json).

## Review record

| Review | Checked, corrected, and retested | Evidence |
| --- | --- | --- |
| Composition | `a5ffeae` tested one complete route and camera/light alternatives. Overlapping plates and crossing tracks were corrected in `391c3f9`; `d809529` checked front/rear views, contact frames, and playback. Side views still overlap lanes; distant rails alias at low quality. | [Prototype](evidence/prototype/), [before](evidence/full-first.png), [after](evidence/full-refined.png), [final views](evidence/final-visual/), [recording](public/counterpoint.webm) |
| Mechanics | `391c3f9`–`d809529` sampled launch, strike, catch, return, loop boundaries, and negative time. Rail clearance and route continuity passed. Edits preserve moving balls. Plate flex is represented by a rigid tilt; the return is mechanically driven. | [Clearance](evidence/rail-clearance.txt), [core tests](evidence/audio-fix/core-tests.log), [contact frames](evidence/final-visual/) |
| First use | `7599099`–`d809529` exercised controls in fresh browser contexts. Fixed slider seeks and stale camera transforms during picking. Retests covered wheel dragging, pointer cancellation, note taps, orbit, pinch, reset, and sharing. No uncoached human discovery test. | [Pointer retest](evidence/pointer-retest.json), [interaction results](evidence/chromium-touch-audio-final.json) |
| Time and sound | `dba9519` passed repeatable seeks, revision handling, suspension, and duplicate-note checks. Increased gain and extended scheduling after a 2.5-second rendering stall dropped a note. Stall and cancellation retests passed. Recorded live output peaked at 0.181 without clipping. | [Audio regressions](evidence/audio-fix/audio-regressions/browser-results.json), [arrangements](evidence/audio-fix/arrangements.json), [live recording analysis](evidence/audio-fix/live-after.json) |
| Browsers and accessibility | `c7c18ac` checked Chromium, Firefox 3D, and WebKit; `dba9519` retested Chromium and WebKit. Keyboard controls, reduced motion, touch emulation, and 320–1440px layouts passed. Firefox audio output was unavailable. | [Firefox](evidence/firefox-headed-results.json), [Chromium](evidence/audio-fix/chromium-initial/browser-results.json), [WebKit](evidence/audio-fix/webkit-static/browser-results.json), [layouts](evidence/audio-fix/copy/) |
| Performance and resilience | `d809529` measured 88/51 draw calls at high/low quality and stable geometry counts during repeated interaction. Frame stalls prevent a hardware performance conclusion. `c7c18ac` fixed a blank canvas after paused resizing. `dba9519` passed malformed URLs, offline interaction after loading, context loss/restoration, and fallback checks. | [Measurements](evidence/visual-performance.json), [resize retest](evidence/chromium-paused-resize-regression.json), [resilience retest](evidence/audio-fix/resilience-static/browser-results.json) |
| Release | `dba9519` passed a clean install, type check, build, and two live checks. Tested controls, shared links, refresh, audio activation, desktop/mobile rendering, and console/network errors. Metadata matched before and after both checks. | [Clean build](evidence/audio-fix/clean-build.log), [first check](evidence/audio-fix/live-1.json), [second check](evidence/audio-fix/live-2.json), [release archive](https://github.com/why-el/counterpoint/releases/tag/v1.0.1) |

Failed runs remain in the evidence. A development reload interrupted [one resilience run](evidence/audio-fix/chromium-initial/); the static-build retest passed. An [initial live check](evidence/audio-fix/live-initial/) assumed Home always sought zero. Reading the slider's current minimum fixed the test, and both final checks were repeated.

Physical phones, hardware frame rates, perceptual listening, screen-reader output, and multi-hour stability remain unverified. Hidden-tab restoration used a simulated visibility event. Fresh offline navigation is unsupported. Browser emulation and waveform analysis do not cover those gaps.

## Run the checks

```sh
npm ci
npm test
npm run build
npx playwright install chromium firefox webkit
npm run dev -- --port 5174 --strictPort
```

With the development server running, use another terminal:

```sh
npm run test:browser
```

Browser system libraries may also be required. The audio fixtures run locally in Chromium. To check a deployed build, set `COUNTERPOINT_URL` to its URL. Development hooks accept `?test=1&t=21&quality=low` for a paused, repeatable frame; `single=1` shows one route.
