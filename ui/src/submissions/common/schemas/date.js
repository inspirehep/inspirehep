import { string } from 'yup';

function isValidDate(value) {
  if (value == null) {
    return true;
  }
  const parsedDate = Date.parse(value);
  return !Number.isNaN(parsedDate);
}

export default function date(validationMessage = 'Not a valid date') {
  return string().test('date', validationMessage, isValidDate);
}
