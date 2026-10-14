export function decapField(name, definition, value) {
  const base = { name, label: definition.label || name, required: Boolean(definition.required) };
  if (definition.type === 'ignored') return { ...base, widget: 'hidden', default: value };
  if (definition.type === 'text') return { ...base, widget: definition.multiline ? 'text' : 'string', default: value };
  if (definition.type === 'array') return { ...base, widget: 'list', allow_add: false, min: definition.length, max: definition.length,
    ...(definition.element.type === 'object' && definition.element.fields.t ? {summary:'{{fields.t}}'} : {}),
    hint: definition.hero ? 'Trois parties : texte avant le mot doré, mot doré, suite éventuelle. Conservez les espaces. La troisième partie peut rester vide.' : 'Modifiez les textes sans changer le nombre d’éléments.',
    ...(definition.element.type === 'object' ? { fields: Object.entries(definition.element.fields).map(([key, child]) => decapField(key, child, value?.[0]?.[key])) } : { field: decapField('text', definition.element, '') }),
  };
  return { ...base, widget: 'object', collapsed: true, fields: Object.entries(definition.fields).map(([key, child]) => decapField(key, child, value?.[key])) };
}
// Blog articles: one JSON file per article in content/blog, written by Myriam.
// The body toolbar offers only what lib/markdown.js renders.
export const BLOG_FOLDER = 'content/blog';
export const BLOG_COLLECTION = {
  name: 'posts', label: 'Blog', label_singular: 'article', description: 'Rédigez, prévisualisez puis publiez vos articles. Un article publié apparaît sur la page « Blog & podcast » après le déploiement du site.',
  folder: BLOG_FOLDER, extension: 'json', format: 'json', create: true, delete: true,
  slug: '{{slug}}', identifier_field: 'title', summary: '{{title}} · {{date}}', sortable_fields: ['date', 'title'], preview_path: 'blog/{{slug}}',
  fields: [
    { name: 'title', label: 'Titre', widget: 'string', hint: 'L’adresse de l’article est créée à partir du titre lors du premier enregistrement.' },
    { name: 'date', label: 'Date de publication', widget: 'datetime', default: '{{now}}', format: 'YYYY-MM-DD', date_format: 'DD/MM/YYYY', time_format: false, picker_utc: true },
    { name: 'summary', label: 'Résumé', widget: 'text', required: false, hint: 'Deux ou trois phrases affichées sous le titre et dans la liste des articles.' },
    { name: 'image', label: 'Image de couverture', widget: 'image', required: false, choose_url: false, hint: 'Facultatif. Une photo horizontale de 1600 pixels de large au minimum, au format JPG ou WebP.' },
    { name: 'imageAlt', label: 'Description de l’image', widget: 'string', required: false, hint: 'Décrivez la photo en une phrase pour les personnes qui ne la voient pas.' },
    { name: 'body', label: 'Texte de l’article', widget: 'markdown', buttons: ['bold', 'italic', 'link', 'heading-two', 'heading-three', 'quote', 'bulleted-list', 'numbered-list'], editor_components: ['image'], modes: ['rich_text'], hint: 'Utilisez les intertitres pour structurer l’article ; le titre principal est déjà affiché au-dessus.' },
  ],
};

export function makeCmsConfig(definitions, french, legalDetails, siteId, demo = false) {
  const groups = { pages: ['home', 'about', 'coaching', 'rh', 'booking', 'contact', 'resources', 'blog', 'podcast'], shared: ['brand', 'nav', 'footer', 'launchDetails', 'legalDetails'], labels: ['ui', 'notFound'] };
  return {
    load_config_file: false,
    backend: demo ? { name: 'essentia-demo' } : { name: 'git-gateway', repo: 'addyap/essentia-myriam', branch: 'main', auth_type: 'pkce', base_url: 'https://auth.decapbridge.com', auth_endpoint: `/sites/${siteId}/pkce`, auth_token_endpoint: `/sites/${siteId}/token`, gateway_url: 'https://gateway.decapbridge.com' },
    auth: { email_claim: 'email', first_name_claim: 'first_name', last_name_claim: 'last_name', avatar_url_claim: 'avatar_url' },
    locale: 'fr', publish_mode: demo ? 'simple' : 'editorial_workflow',
    site_url: 'https://www.essentiademdb.com', display_url: 'https://www.essentiademdb.com', logo: { src: '/cms/logo.svg', show_in_header: false },
    media_folder: 'public/uploads', public_folder: '/uploads',
    // Article addresses come from their titles: "L’été à Paris" becomes l-ete-a-paris.
    slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
    collections: [BLOG_COLLECTION, ...Object.entries(groups).map(([name, keys]) => ({ name, label: { pages: 'Pages du site', shared: 'Informations partagées', labels: 'Libellés et accessibilité' }[name], delete: false,
      files: keys.map(key => ({ name: key, label: definitions[key].label, file: key === 'legalDetails' ? 'content/launch-placeholders.json' : `content/fr/${key}.json`, format: 'json',
        fields: Object.entries(definitions[key].fields).map(([field, definition]) => decapField(field, definition, (key === 'legalDetails' ? legalDetails : french[key])?.[field])),
      })),
    }))],
  };
}
