import { object, lazy } from 'yup';
import { isEmptyObjectShallow } from '../../../common/utils';

export default function emptyObjectOrShapeOf(shape) {
  return lazy(value => {
    if (isEmptyObjectShallow(value)) {
      return object();
    }
    return object().shape(shape);
  });
}
