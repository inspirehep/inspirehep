import { LOCATION_CHANGE } from 'connected-react-router';

import { CLEAR_STATE } from '../actions/actionTypes';

function getLocationFromRootState(state) {
  const {
    router: { location },
  } = state;
  return location || {};
}

export default function({ getState, dispatch }) {
  return next => action => {
    if (action.type === LOCATION_CHANGE && action.payload) {
      const currentLocation = getLocationFromRootState(getState());
      const result = next(action);
      const nextLocation = action.payload.location; // use this instead of `getLocationFromRootState(getState())` for testability.
      if (nextLocation.pathname !== currentLocation.pathname) {
        dispatch({
          type: CLEAR_STATE,
          payload: { cause: 'LOCATION_REALLY_CHANGED' }, // explicit cause to help with debugging
        });
      }
      return result;
    }

    return next(action);
  };
}
