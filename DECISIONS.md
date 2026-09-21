# Design notes

TypeScript, Three.js, and Web Audio run entirely in the browser. Vite bundles the site. Geometry, textures, and sounds are generated in code.

One transport time determines the wheel, balls, plate movement, and notes. Calculated paths make rewinding repeatable. Motion is choreographed; there is no physics simulation.

Each track carries one pitch. A route takes 24 seconds, including six seconds hidden inside the return housing. The three patterns play 14, 12, or 8 notes per 48 seconds, so some routes rest.

Edits take effect on a three-second boundary. Balls keep the score from when their lift began, 13.5 seconds before impact. Scrubbing retains session edits; editing the past replaces later edits. Shared links omit that history.

Audio starts on request and stays silent during scrubbing. Notes are scheduled 24 seconds ahead; transport changes cancel the queue. Longer stalls can still miss notes. Version 1.0.1 raises the gain by about 5 dB.

Repeated parts share geometry. A lower quality setting reduces rendering cost. Buttons and a time slider provide alternatives to dragging the sculpture.
