// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';
import moment from 'moment';

function getDateValidatorFor(format: any) {
  return (value: any) => moment(value, format, Boolean(format)).isValid();
}

export default function date(format: any) {
  const validationMessage = format
    ? `Does not match with ${format}`
    : 'Not a valid date';
  return string().test('date', validationMessage, getDateValidatorFor(format));
}
