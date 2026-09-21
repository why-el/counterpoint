# Review evidence
Reviews pending. No acceptance claims yet. Evidence in evidence/.

## Gate 1 — single route (pre-multiplication)
Environment: Chromium 149 / Playwright 1.63, Ubuntu 24.04, SwiftShader; fixed 960×720 and 1280×900 viewports. Source: initial prototype (recorded in first git commit).
Evidence: evidence/prototype/warm.png (defective merge), revised.png (correction), rim.png (lighting alternative), three-quarter.png, front.png, reverse.png; t-23.7 through t-40.51 impact, catch, rest, lift and launch boundary frames.
Observed defects: mixed indexed/unindexed geometry prevented fixed rails and supports from appearing; overly bright fill flattened stone; front view overlapped wheel and descending track; wheel braces obscured the marble at the crest. Corrected merge normalization, lowered fill, selected three-quarter camera, queued forward pocket placement for full assembly. Reduced shadow map from 2048 to 1024 because software capture was expensive.
Visual observations: continuous double rails form a clear open arch; ivory marble is separable from brass; ball meets the plate at t=24 and rebounds onto the catch; rest transitions are concealed inside the magazine. Reverse camera remains coherent. Flat stone and wheel surface finish still need refinement in full-machine review. No claim about audience response.
Numerical checks: 9 tests passed, including route endpoints and negative time. Screenshot automation retried sequentially after concurrent renderer load caused timeouts. Gate accepted for multiplying this route, with materials and lift visibility carried into refinement.
