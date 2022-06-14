// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string, object, array } from 'yup';

import { degreeTypeValues } from '../../../common/schemas/constants';
import date from '../../../common/schemas/date';

export default {
  degree_type: string().oneOf(degreeTypeValues),
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  submission_date: date(),
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  defense_date: date(),
  institution: string(),
  supervisors: array()
    .default([{}])
    .of(
      object().shape({
        full_name: string(),
        affiliation: string(),
      })
    ),
};
