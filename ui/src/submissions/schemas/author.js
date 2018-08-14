import { string, object, array, number, boolean } from 'yup';

import {
  fieldOfResearchValues,
  maxYear,
  minYear,
  rankValues,
  authorStatusValues,
  degreeTypeValues,
} from './constants';
import { emptyObjectOrShapeOf, orcid } from './customSchemas';

const yearSchema = number()
  .min(minYear)
  .max(maxYear)
  .label('Year');

const arrayWithNullDefault = array().default([null]);
const arrayWithEmptyObjectDefault = array().default([{}]);

const authorSchema = object().shape({
  given_name: string()
    .required()
    .label('Given Name'),
  family_name: string(),
  display_name: string()
    .required()
    .label('Display Name'),
  native_name: string(),
  public_emails: arrayWithNullDefault.of(
    string()
      .nullable()
      .email()
  ),
  status: string()
    .oneOf(authorStatusValues)
    .required()
    .default(authorStatusValues[0]),
  orcid: orcid(),
  websites: arrayWithNullDefault.of(
    string()
      .nullable()
      .url()
  ),
  blog: string().url(),
  linkedin: string(),
  twitter: string(),
  field_of_research: array().of(string().oneOf(fieldOfResearchValues)),
  institution_history: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      institution: string()
        .required()
        .label('Institution name'),
      rank: string().oneOf(rankValues),
      start_year: yearSchema,
      end_year: yearSchema,
      current: boolean(),
    })
  ),
  experiment_history: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      experiment: string()
        .required()
        .label('Experiment name'),
      start_year: yearSchema,
      end_year: yearSchema,
      current: boolean(),
    })
  ),
  advisors: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      name: string()
        .required()
        .label('Advisor name'),
      degree_type: string().oneOf(degreeTypeValues),
    })
  ),
  comments: string(),
});

export default authorSchema;
