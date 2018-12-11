import isEmpty from 'lodash.isempty';
import isPlainObject from 'lodash.isplainobject';
import transform from 'lodash.transform';

/**
 * - Removes empty objects, strings, arrays
 * - Remove null, undefined values
 * - Trims strings
 */
export default function cleanupFormData(data) {
  return transform(data, (result, originalValue, key) => {
    let value = originalValue;

    if (Array.isArray(value) || isPlainObject(value)) {
      value = cleanupFormData(value);
    }

    if (isPlainObject(value) && isEmpty(value)) {
      return;
    }

    if (Array.isArray(value) && !value.length) {
      return;
    }

    if (value === null) {
      return;
    }

    if (value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      value = value.trim();
      if (value === '') {
        return;
      }
    }

    if (Array.isArray(result)) {
      return result.push(value); // eslint-disable-line consistent-return
    }

    result[key] = value;
  });
}
