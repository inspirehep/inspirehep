/* eslint-disable import/prefer-default-export */

export function forceArray(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}
