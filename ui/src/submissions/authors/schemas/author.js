import { string, object, array, boolean } from 'yup';

import { authorStatusValues } from './constants';
import {
  degreeTypeValues,
  arxivCategoryValues,
  rankValues,
} from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import orcid from '../../common/schemas/orcid';
import year from '../../common/schemas/year';

const yearSchema = year().label('Year');

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
  alternate_name: string(),
  native_name: string(),
  emails: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        value: string()
          .email()
          .required()
          .label('Email'),
        hidden: boolean(),
      })
    ),
  status: string()
    .oneOf(authorStatusValues)
    .required()
    .default(authorStatusValues[0]),
  orcid: orcid(),
  websites: array()
    .default([''])
    .of(
      string()
        .trim()
        .nullable()
        .url()
        .label('Website')
    ),
  blog: string().url(),
  linkedin: string(),
  twitter: string(),
  arxiv_categories: array().of(string().oneOf(arxivCategoryValues)),
  positions: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        institution: string()
          .trim()
          .required()
          .label('Institution name'),
        rank: string().oneOf(rankValues),
        start_date: yearSchema,
        end_date: yearSchema,
        current: boolean(),
        hidden: boolean(),
      })
    ),
  project_membership: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        name: string()
          .trim()
          .required()
          .label('Experiment name'),
        start_date: yearSchema,
        end_date: yearSchema,
        current: boolean(),
        hidden: boolean(),
      })
    ),
  advisors: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        name: string()
          .trim()
          .required()
          .label('Advisor name'),
        degree_type: string().oneOf(degreeTypeValues),
        hidden: boolean(),
      })
    ),
  comments: string(),
  bai: string(),
});

export default authorSchema;
