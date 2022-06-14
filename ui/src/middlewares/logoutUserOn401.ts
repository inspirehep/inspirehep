import { SUBMIT_ERROR } from '../actions/actionTypes';
import { userLogout } from '../actions/user';

export default function({
  dispatch
}: any) {
  return (next: any) => (action: any) => {
    if (action.type === SUBMIT_ERROR) {
      const { status } = action.payload;
      if (status === 401) {
        dispatch(userLogout());
      }
    }
    return next(action);
  };
}
