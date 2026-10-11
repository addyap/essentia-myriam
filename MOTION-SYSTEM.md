# Essentia motion direction — Le temps suspendu

Motion should feel like a quiet breath: a deliberate arrival, a continuous gesture, then stillness. The handwritten figure → MDB → dimensional gold pivot is the signature moment. Everything else supports reading and booking.

This document specifies the next implementation; it does not claim that every behavior below is already shipped. Preserve the compact hero and exact logo gold #FCC200.

## Shared timing and easing

| Token | Value | Use |
|---|---|---|
| response | 100ms | Press feedback, immediate state acknowledgement |
| fast | 140ms | Small icons and validation appearance |
| control | 220ms | Buttons, links, tabs |
| panel | 320ms | Mobile menu and disclosure panels |
| reveal | 600ms | Section heading, grouped content |
| image | 800ms | Image arrival |
| handoff | 900ms | Matched SVG → 3D crossfade |
| out | cubic-bezier(.22,1,.36,1) | Entrances and settling |
| in-out | cubic-bezier(.45,0,.55,1) | Gentle balanced transitions |
| exit | cubic-bezier(.4,0,1,1) | Short panel exits |

Avoid springs, overshoot and elastic effects. Limit stagger to 60ms between siblings, with a maximum accumulated delay of 180ms.

## Initial arrival and loading

Render the heading, content and functional links immediately. Never put the logo animation in front of access to the site. Keep the forest image container and SVG logo dimensions reserved to prevent layout shifts.

From first paint:

- Background: opacity only, 800ms, no more than 1.02 → 1 scale.
- Kicker: 100ms delay, 500ms arrival, translateY 8px → 0.
- Headline: 160ms delay, 600ms arrival, translateY 12px → 0. Animate the complete heading as one element; keep its natural line wrapping in every language.
- Supporting text: 220ms delay, 550ms arrival, translateY 8px → 0.
- CTA group: 240ms delay, 450ms arrival, translateY 6px → 0. Links remain usable throughout.
- Draw the logo with the existing continuous figure-to-letters sequence, approximately 7.3 seconds. No separate second introduction for MDB.

Load the 3D code after first paint while the handwriting runs. Keep the SVG visible if the model is late or WebGL is unavailable. No spinner or artificial progress indicator for decorative assets.

## Signature logo handoff

Use explicit states: drawing → waiting-for-model (only if needed) → handoff → pivot → settled. Reduced motion goes directly to static SVG.

1. At the final pen stroke, retain the completed silhouette in the exact same position and dimensions.
2. Reveal a front-facing, stationary 3D mesh with matching camera framing and #FCC200 front material. Fade the completed SVG out as the canvas fades in, over 900ms.
3. Start the pivot clock only after both drawing completion and model readiness. Reserve the first 900ms for the crossfade, then ramp movement gently over the next 1.9 seconds.
4. Keep the existing 24-second pivot: three slow left/right cycles, approximately ±41° yaw, with pitch limited to roughly 6°. Settle at about 4° yaw and −2.6° pitch.
5. Maintain a constant front-face colour. Light and reflection affect the bevel and sides; avoid colour cycling or a bright flash at takeover.
6. Pause freezes the animation clock. Replay resets drawing, readiness and pivot timing. Pause/replay controls must remain reachable on touch and keyboard, outside any faded decorative wrapper.
7. Do not replay automatically on scroll. Offscreen and hidden-tab time does not consume the animation. Stop rendering after settling unless pointer interaction requires a frame.

Gate pointer tilt until the handoff completes. Fade its influence in over 250ms to avoid a jump when the pointer is already over the logo. Maximum additional yaw ±8°, pitch ±4°. On pointer leave, settle over approximately 400ms. Touch devices use the timed pivot alone.

## Scroll and section rhythm

Keep native scrolling. The homepage does not need pinned sections: the hero is compact and the primary task is discovering the service and booking. Do not expand it to make room for an animation. Sticky navigation is sufficient; it must not capture scroll input.

Reveal section headings and their supporting introduction as one group. Reveal cards as a second group, with at most three stagger steps. Trigger once when approximately 15% is visible, with a 32px bottom inset. Already visible content at hydration stays visible. Never hide an entire long section behind a single intersection threshold.

Heading groups: opacity 0 → 1 and translateY 14px → 0 over 600ms. Cards: 10px over 500ms. Body paragraphs do not receive independent stagger or per-word animation. Returning to a section does not replay it.

Transitions between sections come from the existing background colours, spacing and one-time entrances. No animated curtains, full-screen wipes or scroll-driven text disappearance.

## Images and parallax

Portrait and editorial images enter once with opacity and scale 1.025 → 1 over 800ms, inside a clipped container. Keep aspect ratios reserved. If an image fails, preserve its box and any meaningful alternative text.

Desktop fine-pointer hero parallax: background maximum 6px, crest maximum 10px. Smooth using a time-based response, approximately 160ms, rather than a fixed lerp per frame. No additional scroll parallax on the headline or CTA. Disable parallax on touch, reduced motion and when the hero is outside the viewport.

Use one requestAnimationFrame coordinator for pointer/scroll updates. Read geometry at most once per frame, then write transforms. Avoid animated blur, large moving shadows, layout properties or full-screen canvas effects. Let the rays become still after arrival; remove looping dust and repeated CTA glints.

## Controls and feedback

| Interaction | Behavior |
|---|---|
| Primary CTA | 2px rise on fine-pointer hover, arrow moves 3px, 220ms; press scale .98 in 100ms |
| Secondary link | Underline grows from left in 220ms; keyboard focus receives an immediate visible outline |
| Service card | Interactive cards only: rise 3px, border emphasis, 220ms; no hover motion on plain informational cards |
| Navigation | Active-page indicator persists; hover underline uses 180ms; no bouncing header logo |
| Mobile menu | Panel opacity + translateY −8px → 0, 320ms; exit 180ms; move focus into panel, close with Escape and return focus |
| Resource tabs | Active state responds immediately; filtered content fades in over 160ms without moving focus or resetting scroll |
| Language switch | Keep old content until the selected locale loads, then switch atomically; no page-wide fade or delayed navigation |
| Form focus | Border/colour transition 140ms; focus outline itself is immediate |
| Form errors | Inline message appears in 140ms; no shake; identify error in text and connect it to the field |
| Real form submission | Acknowledge immediately, disable repeat submission, show honest pending state; announce success only after confirmed success |
| WhatsApp contact | Fixed stable affordance, 2px hover rise; no pulsing or unsolicited bouncing |

Never show a success animation for the current placeholder forms. Wire real submission behavior before adding completion feedback. Respect disabled states, pointer cancellation and rapid repeated taps.

## Page navigation

Use normal Next.js navigation. Do not delay a click to play an exit animation. On the destination, reveal only the main heading group over 280ms with a 6px offset. Keep navigation/footer stable where the layout supports it. Browser back/forward restoration should not trigger a page-wide entrance or reset scroll. Preserve existing framework focus behavior and make the destination heading available immediately to assistive technology.

## Implementation primitives

These tokens can replace duplicated durations incrementally; existing selectors must be reconciled rather than layering more competing overrides.

```css
:root {
  --motion-response: 100ms;
  --motion-fast: 140ms;
  --motion-control: 220ms;
  --motion-panel: 320ms;
  --motion-reveal: 600ms;
  --motion-image: 800ms;
  --motion-handoff: 900ms;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: cubic-bezier(.45, 0, .55, 1);
}
.motion-reveal {
  transition: opacity var(--motion-reveal) var(--ease-out),
              transform var(--motion-reveal) var(--ease-out);
}
.motion-reveal.motion-pending {
  opacity: 0;
  transform: translateY(14px);
}
@media (prefers-reduced-motion: reduce) {
  .motion-reveal, .motion-reveal.motion-pending {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Use elapsed time for pointer smoothing and cap resumed frame deltas:

```js
const dt = Math.min(now - previousTime, 50);
const blend = 1 - Math.exp(-dt / 160);
currentX += (targetX - currentX) * blend;
currentY += (targetY - currentY) * blend;
```

Keep model readiness separate from drawing completion. Start the handoff clock when both become true, not when the 3D import starts or when the last pen stroke alone finishes. This also handles slow connections without restarting the renderer.

## Accessibility and performance acceptance

- Reduced motion: immediate complete SVG, no handwriting, WebGL, tilt, parallax, scaling, smooth scroll or spatial reveals. Preserve visible focus and immediate state feedback.
- React to preference changes while the page is open; cancel pending animation frames and restore visible content.
- All meaningful content remains visible with JavaScript disabled. Only add reveal-pending states after enhancement initializes successfully.
- No decorative motion traps focus, consumes touch gestures or delays a CTA.
- Pause controls remain usable at mobile widths and 200% zoom.
- Cap canvas DPR at 1.5; disconnect observers and dispose mesh/material/context resources on unmount.
- Aim for 60fps on representative devices; investigate long main-thread tasks above 50ms during the logo transition. Prefer a static fallback when WebGL setup fails.
- Verify fresh load, replay, late model load, failed model load, pause/resume, hidden tab, offscreen return, route changes and live reduced-motion changes.
- Test 390px phone, tablet, desktop, keyboard-only and 200% zoom. Visual verification remains required; a successful build alone does not establish motion quality.

## Implementation priorities

1. Finish logo handoff synchronization, including matching the 900ms clock and pointer influence ramp.
2. Consolidate hero CSS; retain the compact height and remove redundant animation definitions.
3. Mount the reveal coordinator in the shared layout so all routes receive consistent behavior; clean up on route change.
4. Standardize interactive controls and menu focus behavior.
5. Verify motion, interruptions, accessibility and device performance before release.

Code-review assessment: 6/10 provisionally. Clear triggers and a recognizable signature exist, but feedback timing is inconsistent, repeat/interruption behavior needs explicit coordination, and mobile motion controls are not reliably discoverable. Shared timing tokens, the handoff state machine and controls outside the watermark layer address those gaps. This is a design review, not a completed interactive accessibility audit.
