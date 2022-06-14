// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import isEmpty from 'lodash.isempty';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import isPlainObject from 'lodash.isplainobject';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import transform from 'lodash.transform';

/**
 * - Removes empty objects, strings, arrays
 * - Remove null, undefined values
 * - Trims strings
 */
export default function cleanupFormData(data: any) {
  return transform(data, (result: any, originalValue: any, key: any) => {
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
