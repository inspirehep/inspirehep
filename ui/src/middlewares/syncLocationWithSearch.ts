import { LOCATION_CHANGE } from 'connected-react-router';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { stringify } from 'qs';

import {
  searchQueryUpdate,
  newSearch,
  searchQueryReset,
} from '../actions/search';
import { SEARCHABLE_COLLECTION_PATHNAMES } from '../search/constants';
import { getRootOfLocationPathname } from '../common/utils';

const idInUrlRegExp = new RegExp('/\\d+');
function isSearchPage(location: any) {
  const isCollectionPage = SEARCHABLE_COLLECTION_PATHNAMES.some(pathname =>
    location.pathname.startsWith(pathname)
  );

  return isCollectionPage && !idInUrlRegExp.test(location.pathname);
}

function removeUiParam(param: any, value: any) {
  return param.startsWith('ui-') ? undefined : value;
}

function isLocationSyncedWithSearchQuery(namespace: any, state: any) {
  const {
    search,
    router: { location },
  } = state;
  const searchQuery = search.getIn(['namespaces', namespace, 'query']).toJS();
  const searchQueryString = stringify(searchQuery, {
    indices: false,
    filter: removeUiParam,
  });
  const locationQueryStirng = stringify(location.query, {
    indices: false,
    filter: removeUiParam,
  });
  return searchQueryString === locationQueryStirng;
}

// FIXME: this can be moved to reducer?
export default function({
  dispatch,
  getState
}: any) {
  return (next: any) => (action: any) => {
    if (action.type === LOCATION_CHANGE) {
      const prevState = getState();
      const prevLocation = prevState.router.location;

      const result = next(action);

      // use this instead of getState() for ease of testing
      const nextLocation = action.payload.location;

      // dipsatch new search to clear to search state for previous location when pathname changes
      // ex: from `/literature?...` to `/` (home)
      if (
        prevLocation.pathname !== nextLocation.pathname &&
        isSearchPage(prevLocation)
      ) {
        const prevNamespace = getRootOfLocationPathname(prevLocation.pathname);
        dispatch(newSearch(prevNamespace));
      }

      if (isSearchPage(nextLocation)) {
        const nextNamespace = getRootOfLocationPathname(nextLocation.pathname);

        const { isFirstRendering } = action.payload;
        if (
          isFirstRendering || // when first route that user hits the application is a search page
          // make sure LOCATION_CHANGE is not caused by SEARCH_QUERY_UPDATE, to avoid infinite loop
          !isLocationSyncedWithSearchQuery(nextNamespace, getState())
        ) {
          // reset whole query when `back` is clicked on the same search page, then location query will be used
          if (
            prevLocation.pathname === nextLocation.pathname &&
            action.payload.action === 'POP'
          ) {
            dispatch(searchQueryReset(nextNamespace));
          }

          const { query } = nextLocation;
          dispatch(searchQueryUpdate(nextNamespace, query, true));
        }
      }

      return result;
    }
    return next(action);
  };
}
