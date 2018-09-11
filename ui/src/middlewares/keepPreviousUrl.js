/* eslint-disable arrow-body-style */
import { LOCATION_CHANGE } from 'react-router-redux';

let previousUrl = '';

export default () => {
  return next => action => {
    if (action.type === LOCATION_CHANGE) {
      action.payload.previousUrl = previousUrl;

      const { pathname, search } = action.payload;
      previousUrl = `${pathname}${search}`;
    }
    return next(action);
  };
};
