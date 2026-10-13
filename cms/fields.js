import { fields } from '@keystatic/core';
// Keystatic normally omits empty text values. This site deliberately uses empty
// strings (not null/missing values), including the third part of its hero title.
export function textField(options) {
  const field = fields.text(options);
  return { ...field, serialize(value) { return { value }; } };
}
