# The first WebKit nightly: what failed and what was done

TODO item "CI: a layout-shift canary, and act on the first WebKit nightly" (second half). Run: `e2e-webkit.yml` #1 on main at #308, 2026-11-04, `webkit-phone-412-id`, 3 shards. 139 passed, 5 failed (each also on retry).

| Test | Failure | What was done |
| --- | --- | --- |
| a dense Kelurahan map keeps the frame rate | `newCDPSession`: CDP is Chromium-only | Skipped outside Chromium. The test throttles the CPU through CDP; there is no WebKit way. Chromium still runs it on every PR. |
| wheel and pinch zoom in whole steps | `mouse.wheel` is not supported in mobile WebKit; the pinch uses CDP | Skipped outside Chromium, as above. |
| yearly report card is legible, pauses and dismisses | `#modal .card.report-card` never appears | New TODO item: may be a real WebKit bug in the yearly report. |
| Lomba: the mini-games play through to the prizes | `#lomba-mash` is detached from the DOM on every tap, so 40 taps time out | New TODO item: the tap game re-renders its button each tap; WebKit's click waits for a stable element. |
| walkers, particles and night keep the frame rate | 46 fps with effects off, 26 busy (bar set in Chromium) | New TODO item: CI's WebKit renders in software, so the Chromium bars may not apply; decide a WebKit bar or skip with a reason. |

The skips are for missing test APIs, not to hide a failure: the behaviour is still covered in Chromium on every PR. The three real failures are TODO items, which meets the item's "done when".

## Frame-rate test decision

Skip `walkers, particles and night keep the frame rate` in WebKit. The nightly runs Playwright WebKit in a Linux container where rendering is software-based; its 46 fps idle / 26 fps busy result is not a useful proxy for iPhone Safari performance, and the Chromium threshold is not calibrated for that environment. Keep the relative FPS regression check in Chromium, where the existing PR CI runs it. This avoids treating a known renderer/environment mismatch as a product regression. Revisit if the WebKit job moves to a hardware-accelerated runner or gains a representative device baseline.
