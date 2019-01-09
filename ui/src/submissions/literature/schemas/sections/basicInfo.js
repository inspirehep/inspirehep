import { string, array, object } from 'yup';

import { languageValues, subjectValues } from '../constants';
import arrayWithEmptyObjectDefault from '../../../common/schemas/arrayWithEmptyObjectDefault';
import arrayWithNullDefault from '../../../common/schemas/arrayWithNullDefault';

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
  authors: arrayWithEmptyObjectDefault
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
  report_numbers: arrayWithNullDefault.of(string().nullable()),
};
