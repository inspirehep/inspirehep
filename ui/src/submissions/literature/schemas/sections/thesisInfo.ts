import { string, object, array } from 'yup';

import { degreeTypeValues } from '../../../common/schemas/constants';
import date from '../../../common/schemas/date';
import emptyObjectOrShapeOf from '../../../common/schemas/emptyObjectOrShapeOf';

export default {
  degree_type: string().oneOf(degreeTypeValues),
  submission_date: date(),
  defense_date: date(),
  institution: string(),
  supervisors: array()
    .of(
      emptyObjectOrShapeOf({
        full_name: string(),
        affiliation: string(),
      })
    )
    .default([{}]),
};
