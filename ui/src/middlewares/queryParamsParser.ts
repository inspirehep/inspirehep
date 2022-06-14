import { LOCATION_CHANGE } from 'connected-react-router';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { parse } from 'qs';

export default () => (next: any) => (action: any) => {
    if (action.type === LOCATION_CHANGE) {
      const { location } = action.payload;
      location.query = parse(location.search.substring(1));
    }
    return next(action);
  };
