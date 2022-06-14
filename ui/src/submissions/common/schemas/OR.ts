// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { mixed } from 'yup';

export default function OR(schemas: any, validationMessage: any) {
  return mixed().test('OR[schemas]', validationMessage, async (value: any) => {
    const areSchemasValid = await Promise.all(
      schemas.map((schema: any) => schema.isValid(value))
    );
    return areSchemasValid.some(isValid => isValid);
  });
}
