import { string, object, array, date, number } from 'yup';

import { countryValues } from './constants';
import { inspireCategoryValues } from '../../common/schemas/constants';
import emptyObjectOrShapeOf from '../../common/schemas/emptyObjectOrShapeOf';

const conferenceSchema = object().shape({
  name: string()
    .trim()
    .required()
    .label('Conference Name'),
  subtitle: string(),
  acronyms: array()
    .default([''])
    .of(string().nullable()),
  series_name: string(),
  series_number: number().label('Series Number'),
  dates: array()
    .of(date())
    .min(2)
    .max(2)
    .required()
    .label('Dates'),
  addresses: array()
    .default([{}])
    .of(
      object().shape({
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
      })
    )
    .required()
    .label('Address'),
  field_of_interest: array()
    .of(string().oneOf(inspireCategoryValues))
    .required()
    .label('Field of Interest'),
  websites: array()
    .default([''])
    .of(
      string()
        .nullable()
        .url()
        .label('Website')
    ),
  contacts: array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
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
  description: string(),
  additional_info: string(),
  keywords: array()
    .default([''])
    .of(string().nullable()),
});

export default conferenceSchema;
