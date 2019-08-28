import { LOCATION_CHANGE } from 'connected-react-router';

let previousUrl = '';

export default () => {
  return next => action => {
    if (action.type === LOCATION_CHANGE) {
      const { location } = action.payload;
      location.previousUrl = previousUrl;

      const { pathname, search } = location;
      previousUrl = `${pathname}${search}`;
    }
    return next(action);
  };
};
