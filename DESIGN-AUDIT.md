# Essentia creative-direction audit

Reviewed the homepage in a browser, shared components, all route structures, content in four languages, and existing motion lifecycle checks. This is a design/code review, not a claim to have tested every device or verified professional qualifications.

The strongest asset is Myriam's distinctive drawn monogram. The forest atmosphere, Didot typography, existing portrait, and exact gold #FCC200 already provide a recognizable starting point. The original experience weakened immediately below the hero through an unrelated blue palette, repetitive cards, script labels, and unfinished conversion paths.

Direction: **a personal practice presented as a quiet editorial journey**. Forest ink, warm paper and deliberate gold; one expressive logo sequence; readable content, a real person, and obvious contact options. Keep the leitmotif and extended 3D pivot.

## Priorities ranked by impact

| Rank | Finding and consequence | Exact change | Impact / priority | Status |
|---|---|---|---|---|
| 1 | Booking calendar displayed invented free dates and inactive controls; forms only announced their disconnection after visitors entered personal information. This undermined trust at the key conversion moment. | Replace the fake calendar and unconnected forms with existing direct WhatsApp, email and telephone links. Explain that the appointment is agreed directly. Do not manufacture availability or a submission backend. | Critical conversion / P0 | Implemented on booking and contact routes, translated in all four languages. Phone URI normalization also corrected. |
| 2 | Header, cards and subpages used pale blue while the hero used gold and forest. One site appeared to have two identities. | Use #FCC200 for signature gold, #26382E forest ink, #FAF6EF ivory, and #765916 bronze for small text. Keep bright gold off light-background body text. Retain the exact logo front-face colour. | Very high visual / P1 | Implemented through shared tokens and button states. |
| 3 | Homepage had no human presence; the portrait was buried on About. A personal practice looked like a generic wellness template. | Introduce Myriam immediately after the hero using the existing portrait, an asymmetric two-column composition, readable introduction, signature and About link. | Very high storytelling / P1 | Implemented, responsive to a single-column layout. |
| 4 | Two consecutive three-card grids repeated the same icon-tile/title/body recipe. | First group becomes numbered editorial columns on warm paper. Audience group becomes horizontal numbered rows with different column proportions. Use hairline rules instead of floating rounded panels. | High composition / P1 | Implemented on homepage. |
| 5 | Sticky two-tier masthead consumed roughly 165px at the inspected desktop size, with wide tracking, oversized language pills and a full repeated brand sentence. | Reduce desktop brand/logo dimensions, row padding and language-control chrome. Preserve the user's full brand lockup and mobile touch targets. Keep the two-tier structure so navigation remains stable. | High hierarchy / P1 | Implemented. Longer-term masthead restructuring is optional, not necessary to ship this pass. |
| 6 | Script kickers, italic serif paragraphs and large letter-spacing competed for attention. Type roles were unclear. | Keep GFS Didot for display headings, Mulish for explanatory copy, and Parisienne for the brand and personal signature. Convert section kickers to quiet uppercase sans-serif; make leads normal, readable body type. | High readability / P1 | Implemented. Existing Didot preference preserved. |
| 7 | Empty testimonial section promised client evidence but contained none. | Reframe its existing philosophical headline as a visual interlude, with a truthful translated philosophy label and darker forest image treatment. Do not invent quotes. | High credibility / P1 | Implemented. Real testimonials remain a content dependency. |
| 8 | Subpage titles were uniformly centred over washed-out photographs with thick text halos. | Left-align headers, constrain heading/lead measure, retain image detail on the right and remove text glow. Increase the mobile scrim where text covers the image. | Medium-high visual / P1 | Implemented in shared PageHeader and CSS. |
| 9 | Heavy button glow, decorative corner frame and rounded surfaces competed with the logo. | Reduce hero button shadow, remove the decorative frame visually, use restrained corner radii and keep the existing photo, gold face and pivot unchanged. | Medium visual / P2 | Implemented. |
| 10 | Resource cards looked clickable but had no destinations; newsletter form had no subscription service. | Label the current resource previews “coming soon” in every locale, retain honest noninteractive styling, and remove the nonfunctional signup. Restore only when real resources/subscription integration exist. | High usability / P1 | Implemented. Publishing real articles/audio/video is a content dependency. |
| 11 | Form/navigation state colour and phone link formatting needed scrutiny. | Ensure the small nav CTA uses dark text on gold, expose language selected state with aria-pressed, and strip the optional French trunk prefix from international telephone links. | Medium accessibility / P1 | Implemented. |
| 12 | Footer, contact panels and service sections did not share the hero's depth and atmosphere. | Use a darker forest footer/CTA band with warm text. Give contact a clear primary action and an understated practical-information column. Avoid large decorative shadows. | Medium consistency / P2 | Implemented. |

## Dimension-by-dimension assessment

**Typography:** Didot is distinctive but must be reserved for short, legible headings. No new font downloads were added. Script now signals a personal signature rather than labelling every section. Very long translations still require browser checks; avoid fixed-height heading boxes.

**Spacing and hierarchy:** Compact hero retained. The masthead is lighter, intro measure is constrained, and service/audience content has contrasting rhythms. Anchor scroll offsets account for sticky navigation. Section whitespace is useful when it separates a new idea, not when it surrounds empty components.

**Imagery:** The existing portrait now establishes trust. Existing forest imagery remains cohesive. The secondary stock-style scenes are less distinctive than bespoke photography; a future commissioned portrait/environment series would improve ownership. Do not replace them with unrelated cinematic imagery or fabricate credentials.

**Colour and depth:** Gold is an accent and action colour, forest is the structural ink, ivory is the reading surface. Dark bronze supplies readable labels on paper. Bright gold remains exact on both logos. Depth comes from photograph grading, actual logo extrusion and occasional dark sections rather than stacked drop shadows.

**Animation/transitions:** Preserve the continuous handwriting, matched 900ms takeover and three 24-second pivots at approximately ±60°. Existing once-only reveals, pause/replay, reduced-motion overrides and offscreen suspension remain. No extra pinning, scroll hijacking or per-letter body-copy animation was introduced. The logo is sufficiently expressive without a second competing visual performance.

**Micro-interactions:** Existing 44px controls and visible focus remain. Numbered content is informational, not a fake link. Direct contact actions use real destinations; nothing is sent during testing. Language selection now exposes its active state. Real hover responses remain small and predictable.

**Storytelling:** The homepage now progresses from the brand's promise to the person, the work, the audiences, a philosophical pause, and the invitation to contact. Remaining copy includes broad phrases such as personal transformation and growth; a later editorial pass should replace some with concrete situations and explain the first appointment using verified facts.

**Responsiveness:** Founder grid and contact columns stack; audience descriptions sit beneath their titles on mobile. Existing language and menu controls retain adequate touch sizes. Physical phones, assistive technology and actual 200% browser zoom remain distinct from resized browser verification.

**Overall polish:** The largest improvement is consistency and honesty: no blue/gold identity split, no empty testimonial promise, no fake availability and no false signup path. More effects would add less value than real content and verified service information.

The browser language check also exposed outdated English, Italian and Spanish brand promises. Their hero titles and brand subtitles now carry translations of the approved French leitmotif.

## Remaining content and integration dependencies

- Publish real resources before converting preview cards into links.
- Collect approved testimonials and permission to publish them before adding social proof.
- Complete and verify legal/business identification where the existing legal pages still contain placeholders; do not invent those details.
- If online scheduling or forms return, connect a real provider/backend, expose true availability, provide privacy information and verify delivery. Direct contact now provides a usable interim journey.
- Audit each translated page with a native-language reviewer; this pass adds matching interface copy across all locales but does not certify the older translations.
- Physical-device GPU/frame-rate and screen-reader testing still require those environments. Build success and host-mocked motion tests do not substitute for them.

## Validation record

Nine existing motion regression checks passed after the changes. Production build passed. Browser visual and responsive checks are recorded in the final task response; these do not establish a full WCAG audit or real-device performance certification.

Browser verification: desktop homepage, 390px founder/audience stacking, appointment page in French and English, correct mailto/WhatsApp/international telephone destinations, and absence of horizontal overflow. Desktop masthead measured approximately 143px (previously 165px), compact hero approximately 512px at the inspected 1280px viewport. No messages were sent.

## Inner-page identity — 12 October 2026

All ten inner routes now share a prominent #FCC200 monogram, independent of the header logo. Service/contact/booking/resource headers use compact dark photographic compositions with ivory type and gold details. About uses the same introduction before its portrait and biography. Legal pages use a smaller monogram on ivory, readable line lengths and separated sections; 404 also carries the monogram.

Service and values grids now use the homepage's numbered editorial treatment. Contact information, appointment steps and pending owner details follow the same spacing and border language. Pending information remains explicitly labelled; this pass changes presentation, not business claims. Homepage motion remains unchanged. Inner-page marks are static SVG, with no additional WebGL, video or repeated drawing wait.

Verified: production build, 18 tests, translation parity, 11-route HTTP checker, server-rendered monograms on all ten inner routes, desktop/mobile service header, mobile legal layout and About at 320 px without horizontal overflow. Physical-device and screen-reader checks remain separate launch requirements.
