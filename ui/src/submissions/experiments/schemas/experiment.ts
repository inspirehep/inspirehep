// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string, object, array } from 'yup';

import { experimentValues } from './constants';

const experimentSchema = object().shape({
  project_type: array()
    .of(string().oneOf(experimentValues))
    .required()
    .label('Type of experiment'),
  legacy_name: string().required().label('Legacy name'),
});

export default experimentSchema;
