import { string, object, mixed, array, number } from 'yup';

import {
  fieldOfResearchValues,
  maxYear,
  minYear,
  rankValues,
} from './constants';

const yearSchema = number()
  .min(minYear)
  .max(maxYear);

const authorSchema = object().shape({
  display_name: string().required(),
  email: string().email(),
  field_of_research: array().of(mixed().oneOf(fieldOfResearchValues)),
  websites: array().of(string().url()),
  institution_history: array().of(
    object().shape({
      institution: string().required(),
      rank: mixed().oneOf(rankValues),
      start_year: yearSchema,
      end_year: yearSchema,
    })
  ),
});

export default authorSchema;
