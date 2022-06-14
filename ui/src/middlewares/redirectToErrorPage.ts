import { replace } from 'connected-react-router';
import { ERRORS } from '../common/routes';

export default function({
  dispatch
}: any) {
  return (next: any) => (action: any) => {
    const { meta } = action;
    if (meta && meta.redirectableError) {
      const { error } = action.payload;
      dispatch(replace(`${ERRORS}/${error.status}`));
    }
    return next(action);
  };
}
