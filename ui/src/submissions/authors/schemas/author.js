import { string, object, array, boolean } from 'yup';

import {
  arxivCategoryValues,
  rankValues,
  authorStatusValues,
} from './constants';
import { degreeTypeValues } from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import orcid from '../../common/schemas/orcid';
import year from '../../common/schemas/year';

const yearSchema = year().label('Year');

const arrayWithNullDefault = array().default([null]);
const arrayWithEmptyObjectDefault = array().default([{}]);

const authorSchema = object().shape({
  given_name: string()
    .trim()
    .required()
    .label('Given Names'),
  family_name: string()
    .trim()
    .required()
    .label('Family Name'),
  display_name: string()
    .trim()
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
        .trim()
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
        .trim()
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
        .trim()
        .required()
        .label('Advisor name'),
      degree_type: string().oneOf(degreeTypeValues),
    })
  ),
  comments: string(),
});

export default authorSchema;
