import { string, object, array, number, boolean } from 'yup';

import {
  inspireCategoryValues,
  countryValues,
} from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import date from '../../common/schemas/date';
import contacts from '../../common/schemas/contacts';
import { timeZoneValues, SEMINAR_DATETIME_FORMAT } from './constants';
import { LOCAL_TIMEZONE } from '../../../common/constants';

const seminarSchema = object().shape({
  name: string()
    .trim()
    .required()
    .label('Seminar Name'),
  dates: array()
    .of(date(SEMINAR_DATETIME_FORMAT))
    .compact()
    .min(2, 'Please fill in both start and end dates')
    .max(2)
    .required()
    .label('Dates'),
  timezone: string()
    .oneOf(timeZoneValues)
    .required()
    .default(LOCAL_TIMEZONE)
    .label('Timezone'),
  speakers: array()
    .default([{}])
    .of(
      object().shape({
        name: string()
          .required()
          .label('Speaker Name'),
        affiliation: string(),
      })
    )
    .required()
    .label('Speaker'),
  series_name: string(),
  series_number: number().label('Series Number'),
  websites: array()
    .default([''])
    .of(
      string()
        .nullable()
        .url()
        .label('Seminar Website')
    ),
  material_urls: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        value: string()
          .trim()
          .url()
          .required()
          .label('Material'),
        description: string(),
      })
    ),
  join_urls: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        value: string()
          .trim()
          .url()
          .required()
          .label('Join Url'),
        description: string(),
      })
    ),
  captioned: boolean(),
  address: emptyObjectOrShapeOf({
    city: string()
      .trim()
      .required()
      .label('City'),
    country: string()
      .oneOf(countryValues)
      .required()
      .label('Country'),
    state: string(),
    venue: string(),
  }),
  field_of_interest: array()
    .of(string().oneOf(inspireCategoryValues))
    .required()
    .label('Field of Interest'),
  contacts: contacts(),
  literature_records: array()
    .default([''])
    .of(
      string()
        .nullable()
        .label('Related paper')
    ),
  abstract: string(),
  additional_info: string(),
  keywords: array()
    .default([''])
    .of(string().nullable()),
});

export default seminarSchema;
