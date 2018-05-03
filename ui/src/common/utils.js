export function forceArray(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

export function castPropToNumber(prop) {
  return prop !== undefined ? Number(prop) : undefined;
}
