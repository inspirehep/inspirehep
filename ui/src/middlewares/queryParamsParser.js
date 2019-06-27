/* eslint-disable arrow-body-style, consistent-return, no-param-reassign */
import { LOCATION_CHANGE } from 'connected-react-router';
import { parse } from 'qs';

export default () => {
  return next => action => {
    if (action.type === LOCATION_CHANGE) {
      const { location } = action.payload;
      location.query = parse(location.search.substring(1));
    }
    return next(action);
  };
};
