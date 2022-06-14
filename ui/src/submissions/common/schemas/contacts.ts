// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { array, string } from 'yup';
import emptyObjectOrShapeOf from './emptyObjectOrShapeOf';

export default function contacts() {
  return array()
    .default([{}])
    .of(
      emptyObjectOrShapeOf({
        name: string()
          .trim()
          .required()
          .label('Contact name'),
        email: string()
          .email()
          .required()
          .label('Contact email'),
      })
    );
}
