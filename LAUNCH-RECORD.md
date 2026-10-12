# Launch details and verification record

Every bracketed value is a placeholder, not an approved fact or a successful test. Replace it with evidence and a date; leave untested checks marked pending. The severity-ranked requirements remain in LAUNCH-AUDIT.md.

## Business and content approval

| Item | Value / evidence |
|---|---|
| Legal status | [TO COMPLETE] |
| Professional address | [TO COMPLETE] |
| SIRET | [TO COMPLETE] |
| Owner approving legal disclosures | [NAME / DATE] |
| Qualifications, training providers and dates | [TO COMPLETE / EVIDENCE] |
| Applicable professional titles and registrations | [TO CONFIRM / EVIDENCE] |
| Experience and therapeutic claims approved | [CLAIMS / EVIDENCE / APPROVER / DATE] |
| First conversation duration and format | [TO CONFIRM] |
| Practice location / video arrangements | [TO CONFIRM] |
| Fees and payment terms | [TO CONFIRM — DO NOT ASSUME FREE] |
| Cancellation / rescheduling terms | [TO CONFIRM] |
| Appointment confirmation process | [TO CONFIRM] |
| Privacy purposes / legal bases | [PER PROCESSING ACTIVITY] |
| Retention periods | [PER DATA CATEGORY] |
| Processors, recipients and international transfers | [PROVIDERS / GUARANTEES] |
| Hosting logs and retention | [CONFIGURATION / PERIOD / EVIDENCE] |
| Photo, portrait and logo rights | [RIGHTSHOLDER / LICENCE / PERMISSION] |
| Translations approved | [FR / EN / IT / ES REVIEWERS AND DATES] |
| Resources launch decision | [PUBLISH REAL CONTENT / DEFER NAVIGATION ENTRY] |

Public placeholder locations: legal and privacy details in `content/launch-placeholders.json`; qualifications and appointment details in `content/global/{fr,en,it,es}.json` under `launchDetails`. Replace each placeholder in all relevant languages when approved. Remove the “details to be completed” notice when a whole block is confirmed, rather than displaying approved facts under a draft label.

## Browser and accessibility evidence

| Check | Result / evidence |
|---|---|
| Safari / iOS | [PENDING: DEVICE / OS / VERSION / RESULT / DATE] |
| Chrome / Android, low-powered device | [PENDING: DEVICE / OS / VERSION / RESULT / DATE] |
| Desktop Chrome and Edge | [PENDING: VERSION / JOURNEYS / RESULT / DATE] |
| Firefox | [PENDING: VERSION / RESULT / DATE] |
| Desktop Safari | [PENDING: VERSION / RESULT / DATE] |
| VoiceOver / Safari | [PENDING: JOURNEYS / FINDINGS / DATE] |
| NVDA / Firefox | [PENDING: JOURNEYS / FINDINGS / DATE] |
| Actual browser zoom at 200% | [PENDING: BROWSER / VIEWPORT / RESULT] |
| Keyboard-only navigation | [PENDING: FULL JOURNEY / FOCUS / ESCAPE / DATE] |
| Reduced motion before load and during animation | [PENDING: OS / BROWSER / RESULT] |
| No JavaScript and no WebGL | [PENDING: FALLBACK / NAVIGATION / CONTACT RESULT] |
| Slow/offline language download | [PENDING: BROWSER / RECOVERY RESULT] |
| Mobile safe areas / landscape / floating CTA | [PENDING: DEVICES / RESULT] |

## Performance, conversion and deployment evidence

| Check | Result / evidence |
|---|---|
| Production URL and deployed commit | [URL / SHA] |
| Vercel deployment | [DEPLOYMENT ID / READY STATUS / DATE] |
| TLS, apex/www redirects, route and asset checks | [PENDING: RESULTS / DATE] |
| Mobile cold-cache Lighthouse | [PENDING: REPORT / THROTTLING / DATE] |
| Field p75 LCP / INP / CLS | [PENDING: DATA WINDOW / SAMPLE / VALUES — NO INVENTED SCORES] |
| 3D GPU and main-thread profile | [PENDING: DEVICE / TRACE / RESULT] |
| Responsive images / font loading | [PENDING: NETWORK TRACE / RESULT] |
| Authorized email / phone / WhatsApp delivery | [PENDING: CHANNEL / RECEIPT CONFIRMED / DATE] |
| Error recovery / missing images | [PENDING: SCENARIO / RESULT] |
| Analytics provider and account owner | [TO DECIDE — NONE INSTALLED] |
| CTA event names and payloads | [TO DEFINE — EXCLUDE PERSONAL DATA] |
| Analytics consent/privacy review | [PENDING: CONFIGURATION / APPROVER] |
| Error-monitoring provider / alert recipient | [TO DECIDE] |
| Canonical / metadata / JSON-LD live validation | [PENDING: URL / RESULT] |
| Search Console sitemap submission | [PENDING: OWNER / DATE / RESULT] |
| Multilingual SEO decision | [SHARED FRENCH URLS / FUTURE LOCALE ROUTES] |
| Previous known-good deployment / rollback | [DEPLOYMENT ID / SHA / PROCEDURE] |
| Final release approval | [OWNER / DATE / REMAINING EXCEPTIONS] |


## Passe de finition — 12 octobre 2026

- Retrait des tarifs/durées non confirmés et de la promesse de paiement en ligne dans les quatre langues. Aucun paiement n’est implémenté.
- Rendez-vous : étapes explicites de prise de contact, demande des conditions et confirmation humaine ; aucun créneau réservé automatiquement.
- Ressources sans contenu publié : retrait des liens de navigation/footer et du sitemap, page conservée pour les anciens liens avec état de préparation honnête et directive noindex.
- Accès rapide WhatsApp replacé dans le footer plutôt qu’en superposition fixe ; contacts directs conservés sur les pages dédiées.
- Lien d’évitement et invitation à défiler traduits dans les quatre langues ; correction de la description erronée de l’encodage des contacts.
- Logo mobile, tracé et pivot 3D conservés ; aucune régression intentionnelle de l’identité visuelle.
- Questionnaire propriétaire : MYRIAM-LAUNCH-QUESTIONS.md. Identité, qualifications, conditions et pratiques de données restent à confirmer ; encarts explicites conservés, aucune conformité prétendue.
- Contrôles : vérification syntaxe/contenu et 18 tests automatisés réussis. Tests matériels iPhone/Android, Safari/Firefox, lecteur d’écran et mesure terrain des performances restent à réaliser.
- Référencement multilingue par URL non implémenté : français indexable, changement de langue côté client. Une extension des marchés cibles doit précéder cette migration.

- Vérification complémentaire : build de production réussi (avertissement existant de dépréciation React 18), page rendez-vous FR/EN vérifiée dans Chromium, accueil à 375 px sans débordement horizontal, lien d’évitement traduit et aucun contact flottant superposé.
