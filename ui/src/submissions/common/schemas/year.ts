// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { number } from 'yup';

export default function year() {
  return number()
    .integer()
    .min(1000)
    .max(2050)
    .transform(
      (currentValue: any, originalValue: any) =>
        originalValue === '' ? undefined : currentValue
    );
}
