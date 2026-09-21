# Decisions
- Static Vite + TypeScript + Three.js; no application framework or Sites scaffold because the explicit brief requests a lightweight static GitHub Pages artifact.
- Pinned current compatible packages after checking npm registry and official Three/Web Audio/Playwright/GitHub docs, 2026-09-21.
- Original procedural geometry and material textures; no external asset licenses or runtime hotlinks.
- Side-mounted open flywheel, downward looping twin rails, porcelain lamellae, circular engraved dark stone plinth. Studio with restrained warm key and cool rim.
- Each ball follows an analytical lift, rail, free drop, rebound, return, and concealed rest cycle. The wheel rotates in the same clock; pocket angles align with 1.5-second release grid.
- Publish an isolated /counterpoint directory to existing Pages without changing CNAME or site root content. Source repository will be separate.
- Score revisions activate on a three-second boundary. Each marble latches its score when its lift begins (13.5 seconds before impact), so toggles drain existing flights instead of removing them. Pending feedback is immediate; outgoing echoes can last 13.5 seconds. Session rewind retains revisions; shared URLs capture only the desired arrangement.
- Sound: explicit gesture only, modal sine synthesis (porcelain / tine / soft bell), three timbres, conservative gain, bounded 140 ms lookahead; silent reverse. An interrupted audio context pauses the instrument instead of catching up.
- No connected Browser plugin instance was available after setup and discovery. Playwright's installed browser engines are the available testing surface. Chromium uses SwiftShader on this server; this is not a device or hardware-GPU benchmark.
- Review correction: the initial fan looked attractive but crossed neighboring lanes. The manufactured barrel form uses eight separate vertical track planes, 0.26 units apart. Sampled minimum center-to-neighbor-rail distance is 0.199, against ball-plus-rail radius 0.112. This preserves the silhouette while making clearance explicit.
- Software-renderer startup selects the inexpensive tier before any draw. Camera gestures invalidate one animation frame instead of drawing on every pointer event. Software rendering completes each submitted frame to avoid an unbounded GPU queue; these server measurements are consequently distinct from browser callback rates. Hardware rendering retains its normal asynchronous pipeline.

- Touch supports pinch zoom with cancellation of the initial tap or wheel action. All direct operations retain native HTML/keyboard alternatives.
- The existing Pages alias redirects through the user's custom domain. Only Counterpoint's own page upgrades its custom-domain HTTP URL to HTTPS; global Pages, CNAME, and unrelated project settings remain unchanged.
- Firefox 3D is tested in an Xvfb window because this server's headless Firefox cannot expose WebGL. Its independent plain AudioContext cannot resume without a functioning audio sink. Report that coverage gap and provide a bounded user-facing retry instead of installing system audio services.
- High-cost software rendering is documented honestly. Keep the completed-frame timing samples, including stalls, rather than interpreting filtered animation callbacks as achieved presentation FPS.
