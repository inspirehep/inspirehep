import { number } from 'yup';

export default function year() {
  return number()
    .integer()
    .min(1000)
    .max(2050)
    .transform(
      (currentValue, originalValue) =>
        originalValue === '' ? undefined : currentValue
    );
}
