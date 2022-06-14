// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object, lazy } from 'yup';
import { isEmptyObjectShallow } from '../../../common/utils';

export default function emptyObjectOrShapeOf(shape: any) {
  return lazy((value: any) => {
    if (isEmptyObjectShallow(value)) {
      return object();
    }
    return object().shape(shape);
  });
}
