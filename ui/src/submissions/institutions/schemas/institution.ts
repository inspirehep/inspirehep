// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string, object } from 'yup';

const institutionSchema = object().shape({
  identifier: string().required().label('Name of institution'),
});

export default institutionSchema;
