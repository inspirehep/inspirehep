import { SUBMIT_ERROR } from '../actions/actionTypes';
import { userLogout } from '../actions/user';

export default function({ dispatch }) {
  return next => action => {
    if (action.type === SUBMIT_ERROR) {
      const { status } = action.payload;
      if (status === 401) {
        dispatch(userLogout());
      }
    }
    return next(action);
  };
}
