import { customizeValidator } from '@rjsf/validator-ajv8';

const DATE_FORMATS = [/^\d{4}$/, /^\d{4}-\d{2}$/, /^\d{4}-\d{2}-\d{2}$/];
const DATE_TIME_FORMAT =
  /^\d{4}-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i;

const validator = customizeValidator({
  customFormats: {
    date: (value) => DATE_FORMATS.some((format) => format.test(value)),
    'date-time': DATE_TIME_FORMAT,
  },
});

export default validator;
