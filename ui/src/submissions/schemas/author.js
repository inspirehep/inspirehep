import { string, object, array, number, boolean } from 'yup';

import {
  arxivCategoryValues,
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
      .label('Public Email')
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
      .label('Website')
  ),
  blog: string().url(),
  linkedin: string(),
  twitter: string(),
  arxiv_categories: array().of(string().oneOf(arxivCategoryValues)),
  positions: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      institution: string()
        .required()
        .label('Institution name'),
      rank: string().oneOf(rankValues),
      start_date: yearSchema,
      end_date: yearSchema,
      current: boolean(),
    })
  ),
  project_membership: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      name: string()
        .required()
        .label('Experiment name'),
      start_date: yearSchema,
      end_date: yearSchema,
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
