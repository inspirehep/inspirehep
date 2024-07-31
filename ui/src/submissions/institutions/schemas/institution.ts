import { string, object } from 'yup';

const institutionSchema = object().shape({
  identifier: string().required().label('Name of institution'),
});

export default institutionSchema;
