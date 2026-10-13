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
export function makeCmsConfig(definitions, french, legalDetails, siteId, demo = false) {
  const groups = { pages: ['home', 'about', 'coaching', 'rh', 'booking', 'contact', 'resources'], shared: ['brand', 'nav', 'footer', 'launchDetails', 'legalDetails'], labels: ['ui', 'notFound'] };
  return {
    load_config_file: false,
    backend: demo ? { name: 'essentia-demo' } : { name: 'git-gateway', repo: 'addyap/essentia-myriam', branch: 'main', auth_type: 'pkce', base_url: 'https://auth.decapbridge.com', auth_endpoint: `/sites/${siteId}/pkce`, auth_token_endpoint: `/sites/${siteId}/token`, gateway_url: 'https://gateway.decapbridge.com' },
    auth: { email_claim: 'email', first_name_claim: 'first_name', last_name_claim: 'last_name', avatar_url_claim: 'avatar_url' },
    locale: 'fr', publish_mode: demo ? 'simple' : 'editorial_workflow',
    site_url: 'https://www.essentiademdb.com', display_url: 'https://www.essentiademdb.com', logo_url: '/favicon.png',
    media_folder: 'public/uploads', public_folder: '/uploads',
    collections: Object.entries(groups).map(([name, keys]) => ({ name, label: { pages: 'Pages du site', shared: 'Informations partagées', labels: 'Libellés et accessibilité' }[name], delete: false,
      files: keys.map(key => ({ name: key, label: definitions[key].label, file: key === 'legalDetails' ? 'content/launch-placeholders.json' : `content/fr/${key}.json`, format: 'json',
        fields: Object.entries(definitions[key].fields).map(([field, definition]) => decapField(field, definition, (key === 'legalDetails' ? legalDetails : french[key])?.[field])),
      })),
    })),
  };
}
