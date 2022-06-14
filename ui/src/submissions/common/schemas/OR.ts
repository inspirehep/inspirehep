// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { mixed } from 'yup';

export default function OR(schemas: $TSFixMe, validationMessage: $TSFixMe) {
  return mixed().test('OR[schemas]', validationMessage, async (value: $TSFixMe) => {
    const areSchemasValid = await Promise.all(
      schemas.map((schema: $TSFixMe) => schema.isValid(value))
    );
    return areSchemasValid.some(isValid => isValid);
  });
}
