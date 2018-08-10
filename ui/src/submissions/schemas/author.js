import { string, object, array, number } from 'yup';

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
  field_of_research: array().of(string().oneOf(fieldOfResearchValues)),
  websites: array().of(
    string()
      .nullable()
      .url()
  ),
  institution_history: array().of(
    object()
      .nullable()
      .shape({
        institution: string().required(),
        rank: string().oneOf(rankValues),
        start_year: yearSchema,
        end_year: yearSchema,
      })
  ),
  comments: string(),
});

export default authorSchema;
