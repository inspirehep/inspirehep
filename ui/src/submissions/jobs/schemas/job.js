import { string, object, array, date } from 'yup';
import moment from 'moment';

import { regionValues, statusValues } from './constants';
import {
  arxivCategoryValues,
  rankValues,
} from '../../common/schemas/constants';
import arrayWithEmptyObjectDefault from '../../common/schemas/arrayWithEmptyObjectDefault';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import arrayWithNullDefault from '../../common/schemas/arrayWithNullDefault';
import OR from '../../common/schemas/OR';

export function isValidDeadlineDate(value) {
  const dateValue = value instanceof moment ? value : moment(value);
  const now = moment();
  const nextYear = moment().add({ years: 1 });
  return dateValue.isAfter(now) && dateValue.isBefore(nextYear);
}

const jobSchema = object().shape({
  status: string()
    .oneOf(statusValues)
    .default('pending')
    .required(),
  title: string()
    .trim()
    .required()
    .label('Title'),
  external_job_identifier: string(),
  regions: array()
    .of(string().oneOf(regionValues))
    .required()
    .label('Region'),
  ranks: array()
    .of(string().oneOf(rankValues))
    .required()
    .label('Rank'),
  field_of_interest: array()
    .of(string().oneOf(arxivCategoryValues))
    .required()
    .label('Field of Interest'),
  institutions: arrayWithEmptyObjectDefault
    .of(
      object().shape({
        value: string()
          .trim()
          .required()
          .label('Institution'),
      })
    )
    .required()
    .label('Institution'),
  experiments: arrayWithEmptyObjectDefault.of(
    emptyObjectOrShapeOf({
      legacy_name: string()
        .trim()
        .required()
        .label('Experiment'),
    })
  ),
  contacts: arrayWithEmptyObjectDefault.of(
    object().shape({
      name: string()
        .trim()
        .required()
        .label('Contact name'),
      email: string()
        .email()
        .required()
        .label('Contact email'),
    })
  ),
  deadline_date: date().when('status', {
    is: 'closed',
    then: date(),
    otherwise: date()
      .required()
      .test(
        'is-valid-deadline-date',
        'Deadline should be within next year',
        isValidDeadlineDate
      )
      .label('Deadline'),
  }),
  description: string()
    .trim()
    .required()
    .label('Description'),
  url: string()
    .url()
    .label('URL'),
  reference_letters: arrayWithNullDefault.of(
    OR(
      [
        string()
          .nullable()
          .url(),
        string()
          .nullable()
          .email(),
      ],
      'Must be a url or an email'
    )
  ),
});

export default jobSchema;
