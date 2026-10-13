import { config, fields, singleton } from '@keystatic/core';
import definitions from './cms/schema.json';
import { textField } from './cms/fields';

// Never expose filesystem editing on a deployed instance, including Vercel previews.
const local = process.env.NODE_ENV === 'development' && !process.env.VERCEL && process.env.NEXT_PUBLIC_KEYSTATIC_LOCAL === 'true';
const pageRoutes = { home: '/', about: '/a-propos', coaching: '/accompagnement', rh: '/conseil-rh', booking: '/rendez-vous', resources: '/ressources', contact: '/contact' };
function field(definition) {
  if (definition.type === 'ignored') return fields.ignored();
  if (definition.type === 'text') return textField({ label: definition.label, multiline: definition.multiline, validation: { isRequired: definition.required, length: { max: 12000 } } });
  if (definition.type === 'array') return fields.array(field(definition.element), {
    label: definition.label,
    description: definition.hero ? 'Trois parties : texte avant le mot doré, mot doré, puis suite éventuelle. Les espaces et retours à la ligne sont conservés.' : 'Modifiez les textes existants. Le nombre d’éléments reste fixe pour préserver la mise en page.',
    validation: { length: { min: definition.length, max: definition.length } },
    itemLabel: props => typeof props.value === 'string' ? props.value.slice(0, 70) || 'Texte' : props.fields.t?.value || props.fields.label?.value || 'Élément',
  });
  return fields.object(Object.fromEntries(Object.entries(definition.fields).map(([key, value]) => [key, field(value)])), { label: definition.label });
}
const singletons = Object.fromEntries(Object.entries(definitions).map(([key, definition]) => [key, singleton({
  label: definition.label,
  path: key === 'legalDetails' ? 'content/launch-placeholders' : `content/fr/${key}`,
  format: { data: 'json' },
  schema: Object.fromEntries(Object.entries(definition.fields).map(([name, value]) => [name, field(value)])),
  previewUrl: `/cms-preview?branch={branch}&page=${key in pageRoutes ? key : 'home'}`,
})]));
export default config({
  locale: 'fr-FR',
  storage: local ? { kind: 'local' } : { kind: 'github', repo: 'addyap/essentia-myriam' },
  ui: { brand: { name: 'Essentia · Édition française' }, navigation: {
    'Pages du site': ['home', 'about', 'coaching', 'rh', 'booking', 'contact', 'resources'],
    'Informations partagées': ['brand', 'nav', 'footer', 'launchDetails', 'legalDetails'],
    'Libellés et accessibilité': ['ui', 'notFound'],
  } },
  singletons,
});
