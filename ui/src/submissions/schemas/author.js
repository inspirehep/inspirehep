import { string, object, mixed, array, number } from 'yup';

import {
  fieldOfResearchValues,
  degreeTypeValues,
  maxYear,
  minYear,
} from './constants';

const yearSchema = number()
  .min(minYear)
  .max(maxYear);

const authorSchema = object().shape({
  full_name: string().required(),
  email: string().email(),
  field_of_research: array().of(mixed().oneOf(fieldOfResearchValues)),
  degree_type: mixed().oneOf(degreeTypeValues),
  start_year: yearSchema,
});

export default authorSchema;
