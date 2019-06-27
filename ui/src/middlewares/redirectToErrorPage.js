import { push } from 'connected-react-router';
import { ERRORS } from '../common/routes';

export default function({ dispatch }) {
  return next => action => {
    const { meta } = action;
    if (meta && meta.redirectableError) {
      const { status } = action.payload;
      dispatch(push(`${ERRORS}/${status}`));
    }
    return next(action);
  };
}
