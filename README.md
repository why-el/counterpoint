# Counterpoint

An impossible mechanical music box. Eight porcelain voices, brass tracks, a reversible flywheel, and a stone plinth. Silent until you switch sound on.

The instrument is a deterministic automaton, not a rigid-body simulation. Its score drives marble trajectories, lifting pockets, resonator deflection, and browser-synthesized sound. Turn the flywheel backward to hold an instant; turn forward to release it. Tap a porcelain resonator, or use **Notes**, to change the arrangement. Existing flights finish before a voice rests.

[Open the instrument](https://why-el.github.io/counterpoint/) · [Still](https://wael.khobalatte.com/counterpoint/still.jpg) · [Browser recording](https://wael.khobalatte.com/counterpoint/counterpoint.webm)

The GitHub Pages address uses the existing site’s custom domain, `wael.khobalatte.com`.

## Build

Node 22.12 or newer:

```sh
npm ci
npm run dev
npm test
npm run build
```

`dist/` is entirely static. `npm run preview` serves that exact build. Relative asset URLs allow deployment under a GitHub Pages project directory. No API server, fonts, audio samples, tracking, external textures, or runtime network calls are required.

## Browser verification

```sh
npx playwright install chromium firefox webkit
npm run test:browser
```

Use `COUNTERPOINT_URL=https://…/counterpoint/ npm run test:browser` to exercise the published artifact. Browser availability and operating-system libraries vary. The verification log distinguishes actual interaction passes, unavailable graphics, emulation, and unverified physical hardware.

Test hooks are available in development or with `?test=1`. Add `t=21` for an exact held instant, `quality=low` or `quality=high` for a fixed quality tier, and `single=1` for the original one-route gate. Normal visitors see no developer panel. `release.json` records the source revision and build time; the static artifact is built after the source commit, so metadata does not create a self-referential commit requirement.

## Playing

Drag empty space to orbit; pinch or scroll to zoom. Focus the sculpture and use the arrow keys, + / −, and Home for the keyboard equivalents. **Pause**, the time control, **Notes**, **Sound**, **Reset**, and **Share** are native HTML controls. Wheel reverse is deliberately silent. A forward release resumes playback; a backward release holds time. Reduced-motion visitors start paused. Returning from a hidden tab also holds time, with no audio backlog.

The three arrangements are Stillwater, Interlace, and Afterglow. Pitches are D3, A3, D4, E4, F4, A4, C5, and E5. Original modal synthesis provides porcelain, tine, and soft bell timbres. A 24-second machine turn and alternating phrase density leave intentional rests.

## Time and revision contract

All actors derive from one signed transport time. Enabling audio rebases that transport onto the audio clock without a visual jump. Scheduling uses the same analytical event list with a bounded 140 ms lookahead. Pause, seek, edit, suspension, and visibility transitions cancel the outgoing audio bus.

Edits latch on the next three-second grid boundary. A marble remembers the score at the beginning of its lift, 13.5 seconds before impact; launched marbles always complete their journey. Thus an outgoing voice may leave a final echo. The current session retains score revisions for scrubbing; an edit from a past instant replaces later edits. The visible time control spans a 48-second phrase, and the wheel can cross its boundaries. Shared URLs contain the desired arrangement, bounded seed, and bounded camera, not edit history, sound permission, or transport position.

## Pinned release

Published source: [`c7c18ac`](https://github.com/why-el/counterpoint/commit/c7c18ac8f56718f6cecf71421b5fe3c68a5f9582). The [v1.0.0 release](https://github.com/why-el/counterpoint/releases/tag/v1.0.0) retains the exact static archive. To reproduce the source build, check out `v1.0.0` before the commands above. Build timestamps differ when rebuilding; the retained archive is the published artifact.

Two consecutive production browser checks passed on this source revision, with identical release metadata before and after each. The reports and desktop/mobile captures are in `evidence/live-1*` and `evidence/live-2*`. The initial paused-resize failure and its correction are retained in the review log.

On this Linux server, the additional Firefox 3D check used `COUNTERPOINT_HEADED=1 COUNTERPOINT_NO_AUDIO=1 xvfb-run -a npx playwright test --project=firefox -g 'real controls'`. That mode explicitly verifies the unavailable-audio message; it does not claim Firefox audible output works in the server environment.

## Review and limitations

See [REVIEW_LOG.md](REVIEW_LOG.md), [STATUS.md](STATUS.md), [DECISIONS.md](DECISIONS.md), and [COSTS.md](COSTS.md). Actual captures and machine-readable reports are in [evidence/](evidence/). Numerical audio analysis does not establish musical or timbral listening quality. Software-rendered browser runs are not phone or laptop performance results.

All geometry, material textures, synthesis, and interface assets are generated locally. Three.js uses the MIT license; other bundled dependencies retain their package licenses. No commercial recordings or third-party models are used.

Official references checked during implementation: [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html), [instancing](https://threejs.org/docs/pages/InstancedMesh.html), [physical materials](https://threejs.org/docs/pages/MeshPhysicalMaterial.html), [Web Audio](https://www.w3.org/TR/webaudio/), [audio activation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [Playwright emulation](https://playwright.dev/docs/emulation), and [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
