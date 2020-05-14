import { string, object, array, mixed } from 'yup';
import moment from 'moment';

import { regionValues, statusValues, fieldOfInterestValues } from './constants';
import { rankValues } from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import date from '../../common/schemas/date';
import OR from '../../common/schemas/OR';
import { DATE_RANGE_FORMAT } from '../../../common/constants';

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
    .of(string().oneOf(fieldOfInterestValues))
    .required()
    .label('Field of Interest'),
  institutions: array()
    .default([{}])
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
  experiments: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        legacy_name: string()
          .trim()
          .required()
          .label('Experiment'),
      })
    ),
  contacts: array()
    .default([{}])
    .of(
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
  deadline_date: mixed().when('status', {
    is: 'closed',
    then: date(DATE_RANGE_FORMAT),
    otherwise: date(DATE_RANGE_FORMAT)
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
  reference_letters: array()
    .default([''])
    .of(
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
