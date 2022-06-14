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
