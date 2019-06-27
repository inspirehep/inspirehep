import { mixed } from 'yup';

export default function OR(schemas, validationMessage) {
  return mixed().test('OR[schemas]', validationMessage, async value => {
    const areSchemasValid = await Promise.all(
      schemas.map(schema => schema.isValid(value))
    );
    return areSchemasValid.some(isValid => isValid);
  });
}
