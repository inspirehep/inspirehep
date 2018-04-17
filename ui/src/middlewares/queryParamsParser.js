/* eslint-disable arrow-body-style, consistent-return, no-param-reassign */
import { LOCATION_CHANGE } from 'react-router-redux';
import { parse } from 'qs';

export default () => {
  return () => next => (action) => {
    if (action.type === LOCATION_CHANGE) {
      action.payload.query = parse(action.payload.search.substring(1));
    }
    return next(action);
  };
};
