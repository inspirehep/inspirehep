import { string } from 'yup';
import moment from 'moment';

function getDateValidatorFor(format) {
  return value => moment(value, format, Boolean(format)).isValid();
}

export default function date(format) {
  const validationMessage = format
    ? `Does not match with ${format}`
    : 'Not a valid date';
  return string().test('date', validationMessage, getDateValidatorFor(format));
}
