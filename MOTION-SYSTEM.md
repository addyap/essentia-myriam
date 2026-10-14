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

Load the 3D code once the handwriting completes (see the 14 October 2026 note below). Keep the SVG visible if the model is late or WebGL is unavailable. No spinner or artificial progress indicator for decorative assets.

## Signature logo handoff

Use explicit states: drawing → waiting-for-model (only if needed) → handoff → pivot → settled. Reduced motion goes directly to static SVG.

1. At the final pen stroke, retain the completed silhouette in the exact same position and dimensions.
2. Reveal a front-facing, stationary 3D mesh with matching camera framing and #FCC200 front material. Fade the completed SVG out as the canvas fades in, over 900ms.
3. Start the pivot clock only after both drawing completion and model readiness. Reserve the first 900ms for the crossfade, then ramp movement gently over the next 1.9 seconds.
4. Keep the existing 24-second pivot: three slow left/right cycles, approximately ±60° yaw, with pitch limited to roughly 6°. Settle at about 4° yaw and −2.6° pitch.
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

## Implementation status

Implemented shared route-aware reveals, heading/intro timing, portrait entrances, bounded card staggering, control timing, reduced-motion overrides, finite decorative motion, time-based hero parallax, synchronized 900ms logo handoff, pointer ramp, handwriting/pivot pause controls outside the mobile watermark, offscreen/hidden-tab suspension, and mobile keyboard menu handling. The hero remains compact and the front-face gold remains #FCC200. Native navigation and scroll remain intact. Placeholder forms retain their honest unavailable messaging.

Validation: production build passes; desktop and 390px mobile layouts inspected; mobile overflow, WebGL takeover and Escape dismissal checked. Reduced-motion runtime changes, slow-connection fallback and real-device frame-rate profiling still need dedicated interactive verification.

## Final cleanup and regression verification

Consolidated hero base rules, responsive overrides and reduced-motion rules; removed obsolete handwriting keyframes, hidden dust markup and unused looping effects. Widened the three slow pivots to approximately ±60° while keeping the 24-second duration and #FCC200 front face. Fixed a reduced-motion/pen-completion race.

`npm run test:motion` runs nine deterministic component-effect checks: late model readiness, failed model/replay fallback, initial and live reduced motion, interrupted handwriting, crossfade timing, wider yaw and settling, pause/resume rendering, and WebGL initialization failure. These host/GPU mocks test lifecycle logic, not physical rendering quality. Production build passed. Browser checks verified 390px layout, menu focus after opening, Escape focus restoration, pause state feedback and 44px controls, plus no horizontal overflow at 640×422 (the reflow size corresponding to a 1280×844 viewport at 200% zoom). Actual browser zoom and physical-phone performance were not measured.

Vercel confirmed production deployment dpl_7c4bvA7rH4fczm4sNmMEA5cZcWLE is READY for bf9abbb3919966200c3dc68ab558b21af77ab075 and assigned to www.essentiademdb.com. This confirmation precedes the latest cleanup/pivot commit, which needs a separate push to deploy.

### Mobile logo visibility refinement

At widths up to 900px, the crest now occupies its own centred row above the hero copy at full opacity, rather than a faded watermark behind text. Responsive width is 120–150px; compact padding and a 16px row gap keep the primary CTA reachable. Handwriting, 3D takeover, pause/replay, and reduced-motion static fallback retain their existing behaviour. Verified at 390×844 and 320×700; at 390px the primary CTA ends around 635px from the viewport top.

### Forest video background

The home hero now layers a local, muted 9.92-second Pexels forest clip over the existing responsive poster image. Source and licence are recorded in `public/videos/credits.json`. The 1280×720 H.264 file is 2,104,972 bytes, has no audio track and uses fast-start metadata. A darkened, desaturated grade preserves text and gold-logo contrast. Image rendering never waits for video readiness.

`HeroVideo` attaches its source only after hydration when reduced motion and browser data saving are off. Successful playback reveals the video; rejected autoplay or media errors retain the poster. IntersectionObserver and document visibility pause hidden playback. A translated, keyboard-accessible pause/resume button controls the background separately from the logo. With JavaScript disabled, the original image remains and no video source is attached. No third-party player or video request is embedded.

Verification: 16 regression tests pass, including four video lifecycle tests. Production build passes; in-app Chromium confirms muted playback, pause/resume and 390px mobile reflow with the primary CTA ending around 635px. Physical Safari/iOS autoplay and battery/network behaviour remain release-device checks.

### Mobile video delivery

On initial viewports at or below 600px, `HeroVideo` selects `forest-sunlight-mobile.mp4`: 480×854 portrait crop, H.264, 20fps, no audio, fast-start, 697,411 bytes (about 67% less than the desktop payload). Selection is stable for the component lifetime, so orientation changes and pause/resume do not fetch a second rendition. Larger screens keep the 1280×720 desktop file. Network Information API `slow-2g`/`2g` connections use the poster, alongside Save-Data and reduced-motion preferences; browsers without that API still work normally. Media failure releases the source and retains the poster.

Verified initial 390px load requests the mobile file, plays muted, responds to pause and has no horizontal overflow; the primary CTA ends near 635px. Tests cover mobile source selection, retention on resume, slow-link fallback and a <1MB mobile asset budget. This does not substitute for physical iPhone/Android or field performance testing.

### Logo legibility adjustment

Following feedback that the logo turns too obliquely, yaw amplitude is now 0.35 radians (about 20°), with a hard ±0.42-radian cap (24°) including pointer movement. Pointer influence is halved and the resting yaw is 0.05 radians (about 3°). The 24-second rhythm, handwriting handoff and exact gold face colour remain unchanged. The motion regression test now checks a visible two-sided pivot bounded below 25° and the new rest angle.

## Shared section signatures — 12 October 2026

Page headers, legal headings, all content sections and CTA banners now use `SectionLogo`, sharing the homepage's continuous handwriting → gold 3D pivot through `HeroCrest`. Gold remains #FCC200 and the established shallow pivot stays unchanged.

A static server-rendered preview reserves the drawing/control space. Each signature mounts its motion engine once on entering the viewport (15% intersection); unopened sections do not initialize WebGL. Each instance has local translated replay/pause controls, independent from the homepage portal. Existing offscreen/hidden-tab suspension and reduced-motion static fallback remain active. Inner signatures add no video. Header navigation logo stays a stable orientation landmark.

Validation: 20 passing tests, including viewport gating and local pause propagation; production build and route checker pass. At 320 px, the four service sections each have a signature without horizontal overflow; legal-page controls also fit. Physical-device rendering and battery use remain unmeasured.

### Hero-only logo placement
The handwriting-to-gold-pivot animation belongs only in the homepage hero and each inner-page PageHeader. Content sections have no repeated logo signatures. Existing CTA band marks remain static.

### Fuller readable pivot
Hero logos use a 0.48 radian excursion with a hard yaw cap of 0.52 radians (29.8 degrees), including pointer input. The 24-second sequence, small vertical tilt, gold colour and handwriting handoff remain unchanged.

### Distinct hero films and prominent logos
Each main page has its own Pexels video: home forest sunlight; About sunrise valley; Accompaniment golden sea; HR misty lake; Resources sunlit leaves; Contact quiet shore; Booking mountain clouds. Four new clips have matching WebP stills, silent 10-second H.264 desktop/mobile files, and mobile payloads below 1 MB. Source and creator credits are in public/videos/credits.json.

Logo replay/pause controls have been removed at the user's request. Hero signatures are 190 px desktop, 140 px tablet and 112 px phone; quiet legal headers stay compact. The homepage crest is enlarged modestly. Reduced-motion, offscreen suspension, finite pivot duration and SVG failure fallback remain. Video pause controls are retained separately.

### Longer dimensional pivot
The shared hero logo now makes three return trips over 32 seconds after the unchanged 900ms handwriting handoff. A softened sine curve holds each turn longer, with a 0.50-radian excursion and the existing hard 0.52-radian yaw cap, including pointer input. Pitch adds depth but is capped at 0.20 radians. Gold remains #FCC200; reduced-motion, offscreen suspension and static fallbacks remain unchanged. This supersedes the older pivot timing and angle specifications above.

### Golden clay material
The shared WebGL logo retains its SVG contours, extrusion, handwriting handoff and bounded 32-second pivot. Its #FCC200 pigment now uses a rough non-metallic clay material, a deterministic 128px procedural bump texture and neutral side/fill lighting. The texture is generated in memory, mipmapped and disposed with the renderer; no new runtime image download is introduced. Reduced-motion and failure fallbacks retain the original SVG. The studio concept image is in design/logo-clay-studio.png and is not loaded by the website. This supersedes the older unlit-front-face material specification.

### Visible dimensional edges
The model now extrudes 40 SVG units backwards from its unchanged front plane, with deeper bevel shading and lower ambient fill. It settles at 0.18 radians (10.3 degrees) yaw so sidewalls remain visible after the finite pivot. The hard 0.52-radian maximum, gold pigment, silhouette and handwriting sequence remain unchanged.

### Matte rendering cost
Clay now uses direct side/fill/ambient lighting without constructing or convolving a room reflection map. The 128px texture, mobile pixel-ratio cap, offscreen/tab suspension and stop-after-settle lifecycle remain. Tests explicitly confirm zero idle renders once settled. Device frame-rate and GPU-memory measurements remain to be completed on physical phones.

### Restore exact front-face gold
The front face uses an unlit #FCC200 material again so side lighting cannot mute the brand colour. Clay microtexture and directional shading remain on the extruded sides and bevels. Depth, pivot limits and the handwritten takeover are unchanged.

### Persistent relief at rest
After pivoting, the hero model settles at 0.26 radians yaw (14.9 degrees) and −0.10 radians pitch (−5.7 degrees). The added yaw eases in only during the final tenth of the sequence, retaining the existing two-sided excursions and 30-degree hard cap. SVG fallbacks have a small physical layer offset so the static logo retains visible depth even without WebGL. Brand gold is unchanged.

## Smoothness pass — 14 October 2026

Profiling in headless Chromium (1440×900, CPU slowed 4×) showed steady 60fps everywhere except one 180–270ms main-thread block while three.js was evaluated and the renderer initialised, about 0.4–0.7s into the page. That fell during the handwriting and made the pen stall on every page.

- `HeroCrest` now mounts `GoldLogo3D` only when the drawing completes. The finished SVG holds until the model is ready (the existing waiting-for-model state), so the block happens while nothing is being drawn. Pages left within the first seven seconds no longer load WebGL at all.
- `LogoMarkDraw` sets dash lengths once and, per frame, writes only the stroke being drawn and its nib instead of all ten masked strokes.
- `MotionSystem` re-scans for reveal targets at most once per animation frame when content changes.

After the change, the same profile shows no long frames during the handwriting. three.js is about 740KB across two chunks; importing only the classes the logo uses produced a larger bundle, so the full import remains.

