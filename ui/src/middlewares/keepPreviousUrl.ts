import { LOCATION_CHANGE } from 'connected-react-router';
import { HOME } from '../common/routes';

let previousUrl = HOME;

export default () => {
  return next => action => {
    if (action.type === LOCATION_CHANGE) {
      const { location } = action.payload;
      location.previousUrl = previousUrl;

      const { pathname, search } = location;
      // TODO: keep #hash
      previousUrl = `${pathname}${search}`;
    }
    return next(action);
  };
};
