import { replace } from 'connected-react-router';
import { ERRORS } from '../common/routes';

export default function({
  dispatch
}: $TSFixMe) {
  return (next: $TSFixMe) => (action: $TSFixMe) => {
    const { meta } = action;
    if (meta && meta.redirectableError) {
      const { error } = action.payload;
      dispatch(replace(`${ERRORS}/${error.status}`));
    }
    return next(action);
  };
}
