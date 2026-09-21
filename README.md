# Counterpoint

[Open Counterpoint](https://why-el.github.io/counterpoint/) · [Still image](https://wael.khobalatte.com/counterpoint/still.jpg) · [Browser recording](https://wael.khobalatte.com/counterpoint/counterpoint.webm)

Counterpoint is a 3D music box with eight porcelain resonators, brass tracks, and a reversible flywheel. Marble strikes play synthesized notes after you press Sound. Drag the wheel backward to rewind, release it to pause, or turn it forward to resume. Tap a resonator or use Notes to change the arrangement. Moving marbles finish their routes.

The GitHub Pages address redirects to the existing custom domain, `wael.khobalatte.com`.

## Build

Requires Node 22.12 or newer:

```sh
npm ci
npm test
npm run build
```

`dist/` contains the static site. Use `npm run dev` during development or `npm run preview` to serve the build. Relative asset URLs support a GitHub Pages project directory. Geometry, textures, interface assets, and sounds are generated locally; the application needs no API server or external assets at runtime.

## Browser tests

Start the development server on the test port:

```sh
npm run dev -- --port 5174 --strictPort
```

In another terminal:

```sh
npx playwright install chromium firefox webkit
npm run test:browser
```

Operating-system browser libraries may also be required. `COUNTERPOINT_URL=https://why-el.github.io/counterpoint/ npm run test:browser` runs the application tests against a published build. The audio fixture tests run only against the local development server. They record the output after the compressor, check a 2.5-second main-thread stall, and verify cancellation of queued notes.

To record audio from the running application:

```sh
node scripts/audio-output-probe.mjs http://localhost:5174/ local-output
```

The recording and numerical report are written to `evidence/audio-fix/`. This checks the browser's generated signal; it cannot verify the listener's speakers or listening experience.

Test hooks are enabled in development or with `?test=1`. Add `t=21` to pause at an exact time, `quality=low` or `quality=high` to select rendering quality, and `single=1` to show the original single route. These hooks have no visible developer panel.

## Controls

Drag empty space to rotate the view; pinch or scroll to zoom. With the canvas focused, arrow keys rotate, + / − zoom, Home resets, and Space toggles playback. Sound, Play/Pause, the time slider, Notes, Reset, and Share are native HTML controls.

Reverse and manual scrubbing are silent. Reduced-motion visitors start paused. Returning from a hidden tab requires Play, which prevents missed notes from playing as a burst.

Stillwater, Interlace, and Afterglow use D3, A3, D4, E4, F4, A4, C5, and E5, with porcelain, tine, and bell timbres. The arrangements contain 14, 12, and 8 strikes per 48-second phrase.

## Time and score changes

One signed transport time determines the score, marble positions, lifting pockets, and resonator movement. Enabling sound switches the transport to the audio clock while preserving its position. Audio uses the same event list and schedules up to one 24-second machine cycle ahead. Pause, seek, edit, context suspension, and hidden-tab transitions cancel the outgoing audio bus.

Edits activate on the next three-second boundary. Each marble uses the score from the start of its lift, 13.5 seconds before impact, so an outgoing note can still sound during that interval. Session revisions remain available for scrubbing; editing a past instant replaces later edits. The slider spans 48 seconds, and the wheel can cross phrase boundaries.

Shared URLs include the selected arrangement, validated seed, and bounded camera state. They omit edit history, sound permission, and transport position. A shared link starts with sound off.

## Releases and evidence

`release.json` records the source revision, package version, and build time. Build after committing the source to avoid a self-referential revision. Release archives retain the published files; rebuilding the same source changes the build timestamp.

The [v1.0.0 archive](https://github.com/why-el/counterpoint/releases/tag/v1.0.0) retains the first published build, source `c7c18ac`. Version 1.0.1 raises output gain by about 5 dB, protects scheduled notes from rendering stalls, and revises interface and documentation text. The [v1.0.1 release](https://github.com/why-el/counterpoint/releases/tag/v1.0.1) retains the updated build. See [STATUS.md](STATUS.md) for deployment details and [REVIEW_LOG.md](REVIEW_LOG.md) for tests, defects, corrections, and coverage limits.

On this server, Firefox 3D tests require a virtual display:

```sh
COUNTERPOINT_HEADED=1 COUNTERPOINT_NO_AUDIO=1 xvfb-run -a npx playwright test --project=firefox -g 'real controls'
```

That command checks Firefox's audio-startup failure message because the server has no working Firefox audio sink. It does not verify Firefox audio output.

Physical phones, ordinary hardware GPU performance, screen-reader listening, musical listening, and multi-hour operation remain unverified. Browser emulation and waveform analysis cover narrower behavior. The seven review scopes and their evidence are recorded in the review log.

[DECISIONS.md](DECISIONS.md) records implementation choices; [COSTS.md](COSTS.md) separates observed purchases from unknown charges. Three.js uses the MIT license, and bundled dependencies retain their licenses. No commercial recordings or third-party models are used.

References checked during implementation: [Three.js renderer](https://threejs.org/docs/pages/WebGLRenderer.html), [instancing](https://threejs.org/docs/pages/InstancedMesh.html), [physical materials](https://threejs.org/docs/pages/MeshPhysicalMaterial.html), [Web Audio](https://www.w3.org/TR/webaudio/), [audio activation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [audio scheduling](https://web.dev/articles/audio-scheduling), [Playwright emulation](https://playwright.dev/docs/emulation), and [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
