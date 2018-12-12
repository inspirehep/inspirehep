import { string, array, object, date } from 'yup';

import { degreeTypeValues } from '../../../common/schemas/constants';

// TODO: move it to common
const arrayWithEmptyObjectDefault = array().default([{}]);

export default {
  degree_type: string().oneOf(degreeTypeValues),
  submission_date: date(),
  defense_date: date(),
  institution: string(),
  // TODO: maybe reuse the same from basicInfo/authors
  supervisors: arrayWithEmptyObjectDefault.of(
    object().shape({
      full_name: string(),
      affiliation: string(),
    })
  ),
};
