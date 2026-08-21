import { LOCATION_CHANGE } from 'redux-first-history';
import { parse } from 'qs';

export default () => {
  return (next) => (action) => {
    if (action.type === LOCATION_CHANGE) {
      const { location } = action.payload;
      action.payload.location = {
        ...location,
        query: parse(location.search.substring(1)),
      };
    }
    return next(action);
  };
};
