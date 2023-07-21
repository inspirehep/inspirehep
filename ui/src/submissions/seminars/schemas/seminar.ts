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
  name: string().trim().required().label('Seminar Name'),
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
    .of(
      object().shape({
        name: string().required().label('Speaker Name'),
        affiliation: string(),
      })
    )
    .required()
    .default([{} as { name: string; affiliation: string }])
    .label('Speaker'),
  series_name: string(),
  series_number: number().label('Series Number'),
  websites: array()
    .of(string().nullable().url().label('Seminar Website'))
    .default(['']),
  material_urls: array()
    .of(
      emptyObjectOrShapeOf({
        value: string().trim().url().required().label('Material'),
        description: string(),
      })
    )
    .default([{}]),
  join_urls: array()
    .of(
      emptyObjectOrShapeOf({
        value: string().trim().url().required().label('Join Url'),
        description: string(),
      })
    )
    .default([{}]),
  captioned: boolean(),
  address: emptyObjectOrShapeOf({
    city: string().trim().required().label('City'),
    country: string().oneOf(countryValues).required().label('Country'),
    state: string(),
    venue: string(),
  }),
  field_of_interest: array()
    .of(string().oneOf(inspireCategoryValues))
    .required()
    .label('Field of Interest'),
  contacts: contacts(),
  literature_records: array()
    .of(string().nullable().label('Related paper'))
    .default(['']),
  abstract: string(),
  additional_info: string(),
  keywords: array().of(string().nullable()).default(['']),
});

export default seminarSchema;
