import { string, object, array, date, number } from 'yup';

import {
  inspireCategoryValues,
  countryValues,
} from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';
import contacts from '../../common/schemas/contacts';
import { timeZoneValues } from './constants';

const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

const seminarSchema = object().shape({
  name: string()
    .trim()
    .required()
    .label('Seminar Name'),
  dates: array()
    .of(date())
    .compact()
    .min(2, 'Please fill in both start and end dates')
    .max(2)
    .required()
    .label('Dates'),
  timezone: string()
    .oneOf(timeZoneValues)
    .required()
    .default(timeZone)
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
  abstract: string(),
  additional_info: string(),
  keywords: array()
    .default([''])
    .of(string().nullable()),
});

export default seminarSchema;
