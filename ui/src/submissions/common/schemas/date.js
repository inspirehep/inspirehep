import { string } from 'yup';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const FREE_FORM_DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY-MM',
  'YYYY',
  'D MMMM YYYY',
  'MMMM YYYY',
];

function getDateValidatorFor(format) {
  const formats = format ? [format] : FREE_FORM_DATE_FORMATS;
  return (value) =>
    value == null ||
    formats.some((oneFormat) => dayjs(value, oneFormat, true).isValid());
}

export default function date(format) {
  const validationMessage = format
    ? `Does not match with ${format}`
    : 'Not a valid date';
  return string().test('date', validationMessage, getDateValidatorFor(format));
}
