import { object, lazy } from 'yup';

// eslint-disable-next-line import/prefer-default-export
export function emptyObjectOrShapeOf(shape) {
  return lazy(value => {
    if (Object.keys(value).length === 0) {
      return object();
    }
    return object().shape(shape);
  });
}
