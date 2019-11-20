import { string, array, object } from 'yup';

import { languageValues, subjectValues } from '../constants';

export default {
  title: string()
    .required()
    .label('Title'),
  language: string()
    .oneOf(languageValues)
    .default(languageValues[0]),
  subjects: array()
    .of(string().oneOf(subjectValues))
    .min(1)
    .required()
    .label('Subject'),
  authors: array()
    .default([{}])
    .of(
      object().shape({
        full_name: string()
          .required()
          .label('Full name'),
        affiliation: string(),
      })
    )
    .min(1)
    .required()
    .label('Author'),
  collaboration: string(),
  experiment: string(),
  abstract: string(),
  report_numbers: array()
    .default([''])
    .of(string().nullable()),
  doi: string()
    .matches(new RegExp('^(doi:)?10\\.\\d+(\\.\\d+)?/\\S+$'))
    .label('DOI'),
};
