import { defineConfig } from 'tinacms';

// Keep in sync with lib/icons.js — this is the exact set of icon names the site
// knows how to render. A select field (not free text) means Myriam can only pick
// a name that actually exists, so a picture never silently breaks.
const ICON_OPTIONS = [
  'book', 'briefcase', 'compass', 'ear', 'globe', 'heart', 'leaf', 'mail', 'mic',
  'phone', 'pin', 'play', 'shield', 'spark', 'target', 'user', 'users', 'whatsapp',
];

const iconField = (name, label) => ({
  type: 'string',
  name,
  label,
  options: ICON_OPTIONS,
});

const text = (name, label) => ({ type: 'string', name, label });
const longText = (name, label) => ({ type: 'string', name, label, ui: { component: 'textarea' } });
const stringList = (name, label) => ({ type: 'string', name, label, list: true });

// {icon, title, description} card — the shape repeats across home/about/coaching/rh.
const iconCard = (name, label) => ({
  type: 'object',
  name,
  label,
  list: true,
  ui: { itemProps: (item) => ({ label: item?.t }) },
  fields: [iconField('ic', 'Icône'), text('t', 'Titre'), longText('d', 'Description')],
});

export default defineConfig({
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GITHUB_HEAD_REF ||
    process.env.HEAD ||
    'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'content',
        label: 'Contenu du site',
        path: 'content/global',
        format: 'json',
        // 4 documents exist on disk (fr/en/it/es — one per language the site can
        // support), but only French is switched on right now (lib/config.js
        // ENABLED_LANGS); en/it/es aren't reachable from the live site while
        // that's the case. `match` hides them from this list entirely so there's
        // no way to accidentally edit a language nobody can see — remove it (and
        // update ENABLED_LANGS) once translations resume.
        match: { include: 'fr' },
        // Creating a 5th or deleting fr.json would desync the site from real
        // content, so both actions are disabled — editing what exists is all
        // that's needed.
        ui: {
          allowedActions: { create: false, delete: false },
          // Opens the real homepage in Tina's live-preview iframe when this
          // document is edited. Content is one shared document for the whole
          // site (see Providers.js), so from there Myriam can click through
          // the site's own nav to any page and it stays live.
          router: () => '/',
        },
        fields: [
          {
            type: 'object',
            name: 'brand',
            label: 'Marque',
            fields: [
              {
                type: 'object', name: 'essentia', label: 'Essentia',
                fields: [text('name', 'Nom'), text('sub', 'Sous-titre'), text('byline', 'Signature ("de …")')],
              },
              {
                type: 'object', name: 'aletheias', label: 'Aletheias',
                fields: [text('name', 'Nom'), text('sub', 'Sous-titre')],
              },
            ],
          },
          {
            type: 'object',
            name: 'ui',
            label: 'Textes d’interface',
            fields: [
              text('language', 'Langue'), text('book', 'Bouton "Prendre rendez-vous"'),
              text('discover', 'Bouton "Découvrir"'), text('send', 'Bouton "Envoyer"'),
              text('menu', 'Menu (mobile)'), longText('formUnavailable', 'Message formulaire non connecté'),
              longText('legalFrenchOnly', 'Message page légale FR uniquement'),
            ],
          },
          {
            type: 'object',
            name: 'nav',
            label: 'Menu de navigation',
            fields: [
              text('home', 'Accueil'), text('about', 'À propos'), text('coaching', 'Accompagnement'),
              text('rh', 'Conseil RH'), text('resources', 'Ressources'), text('contact', 'Contact'),
            ],
          },
          {
            type: 'object',
            name: 'footer',
            label: 'Pied de page',
            fields: [
              text('explore', 'Titre "Explorer"'), text('contact', 'Titre "Contact"'), text('legal', 'Titre "Informations"'),
              text('legalNotice', 'Lien mentions légales'), text('privacy', 'Lien confidentialité'),
              text('rgpd', 'Lien RGPD'), text('ethics', 'Lien charte éthique'),
              longText('blurb', 'Texte de présentation'), text('tagline', 'Signature en script'),
              text('rights', 'Copyright (garder {year} et {name})'),
            ],
          },
          {
            type: 'object',
            name: 'home',
            label: 'Page d’accueil',
            fields: [
              text('heroKicker', 'Hero — mot d’accroche ("Bienvenue")'),
              {
                ...stringList('heroTitle', 'Hero — titre (3 parties : début / mot en italique / fin — ne pas ajouter ni supprimer de ligne)'),
              },
              longText('heroSub', 'Hero — texte'),
              text('heroCta1', 'Hero — bouton principal'), text('heroCta2', 'Hero — bouton secondaire'),
              text('introEyebrow', 'Intro — mot d’accroche'), text('introTitle', 'Intro — titre'),
              longText('introBody', 'Intro — texte'),
              text('pillarsEyebrow', 'Piliers — mot d’accroche'),
              iconCard('pillars', 'Piliers (3 cartes)'),
              text('forEyebrow', 'Public — mot d’accroche'), text('forTitle', 'Public — titre'),
              iconCard('forWho', 'Public visé (3 cartes)'),
              text('testiEyebrow', 'Témoignages — mot d’accroche'), text('testiTitle', 'Témoignages — titre'),
              {
                type: 'object', name: 'testi', label: 'Témoignages', list: true,
                ui: { itemProps: (item) => ({ label: item?.w }) },
                fields: [longText('q', 'Citation'), text('w', 'Auteur')],
              },
              text('bandTitle', 'Bandeau final — titre'), longText('bandText', 'Bandeau final — texte'),
              text('bandBtn', 'Bandeau final — bouton'),
            ],
          },
          {
            type: 'object',
            name: 'about',
            label: 'Page À propos',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              text('photoCaption', 'Légende de la photo'),
              longText('p1', 'Paragraphe 1'), longText('p2', 'Paragraphe 2'),
              text('journeyTitle', 'Titre "Parcours"'), longText('journeyBody', 'Texte "Parcours"'),
              text('valuesTitle', 'Titre "Valeurs"'), text('valuesSub', 'Sous-titre "Valeurs"'),
              iconCard('values', 'Valeurs (4 cartes)'),
              text('whyTitle', 'Titre "Pourquoi moi"'), longText('whyBody', 'Texte "Pourquoi moi"'),
              text('langsTitle', 'Titre "4 langues"'),
            ],
          },
          {
            type: 'object',
            name: 'coaching',
            label: 'Page Accompagnement',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              text('listTitle', 'Titre de la liste'),
              iconCard('items', 'Types d’accompagnement (6 cartes)'),
              text('methodsEyebrow', 'Méthodes — mot d’accroche'), text('methodsTitle', 'Méthodes — titre'),
              longText('methodsSub', 'Méthodes — sous-titre'),
              stringList('methods', 'Méthodes (liste de badges)'),
              text('pricingEyebrow', 'Tarifs — mot d’accroche'), text('pricingTitle', 'Tarifs — titre'),
              longText('pricingSub', 'Tarifs — sous-titre'),
              {
                type: 'object', name: 'prices', label: 'Formules tarifaires', list: true,
                ui: { itemProps: (item) => ({ label: item?.t }) },
                fields: [
                  text('t', 'Nom de la formule'), text('amt', 'Prix (ex: 90€ ou Offert)'), text('per', 'Unité (ex: la séance)'),
                  stringList('feat', 'Points inclus'),
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'rh',
            label: 'Page Conseil RH',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              iconCard('items', 'Prestations (4 cartes)'),
              text('approachTitle', 'Titre "Expertise"'), longText('approachBody', 'Texte "Expertise"'),
              text('ctaTitle', 'Bandeau final — titre'), text('ctaBtn', 'Bandeau final — bouton'),
            ],
          },
          {
            type: 'object',
            name: 'booking',
            label: 'Page Prendre rendez-vous',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              text('fName', 'Champ "Nom"'), text('fEmail', 'Champ "Email"'), text('fType', 'Champ "Type"'), text('fMsg', 'Champ "Message"'),
              stringList('opt', 'Types d’accompagnement (menu déroulant)'),
              text('send', 'Bouton envoyer'),
              text('calTitle', 'Calendrier — titre'), longText('calNote', 'Calendrier — note'),
              text('payNote', 'Note paiement'), text('coordsTitle', 'Titre "Me contacter"'),
              stringList('weekdays', 'Initiales des jours (L M M J V S D)'),
              text('address', 'Adresse / lieu des consultations'), longText('waGreeting', 'Message WhatsApp pré-rempli'),
            ],
          },
          {
            type: 'object',
            name: 'resources',
            label: 'Page Ressources',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              stringList('tabs', 'Onglets de filtre'),
              {
                type: 'object', name: 'items', label: 'Articles / vidéos / podcasts', list: true,
                ui: { itemProps: (item) => ({ label: item?.t }) },
                fields: [
                  { type: 'string', name: 'cat', label: 'Catégorie', options: ['Blog', 'Vlog', 'Podcast'] },
                  iconField('ic', 'Icône'), text('t', 'Titre'), longText('d', 'Description'),
                ],
              },
              text('newsTitle', 'Newsletter — titre'), longText('newsSub', 'Newsletter — sous-titre'),
              text('newsBtn', 'Newsletter — bouton'), text('newsPlace', 'Newsletter — placeholder email'),
            ],
          },
          {
            type: 'object',
            name: 'contact',
            label: 'Page Contact',
            fields: [
              text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('lead', 'Chapô'),
              text('fName', 'Champ "Nom"'), text('fEmail', 'Champ "Email"'), text('fSubject', 'Champ "Sujet"'),
              text('fMsg', 'Champ "Message"'), text('send', 'Bouton envoyer'),
              text('infoTitle', 'Titre "Coordonnées"'), text('hoursTitle', 'Titre "Disponibilités"'),
              text('hours', 'Horaires'), text('whatsapp', 'Libellé lien WhatsApp'),
            ],
          },
          {
            type: 'object',
            name: 'notFound',
            label: 'Page 404',
            fields: [text('eyebrow', 'Mot d’accroche'), text('title', 'Titre'), longText('text', 'Texte'), text('backBtn', 'Bouton retour')],
          },
        ],
      },
    ],
  },
});
