import { LOCATION_CHANGE } from 'connected-react-router';
import { stringify } from 'qs';

import {
  searchQueryUpdate,
  newSearch,
  searchQueryReset,
  fetchAggregationsAndSearchQueryReset,
} from '../actions/search';
import {
  LITERATURE_NS,
  SEARCHABLE_COLLECTION_PATHNAMES,
} from '../search/constants';
import { getRootOfLocationPathname } from '../common/utils';

const idInUrlRegExp = new RegExp('/\\d+');
function isSearchPage(location) {
  const isCollectionPage = SEARCHABLE_COLLECTION_PATHNAMES.some((pathname) =>
    location.pathname.startsWith(pathname)
  );

  return isCollectionPage && !idInUrlRegExp.test(location.pathname);
}

function removeUiParam(param, value) {
  return param.startsWith('ui-') ? undefined : value;
}

function isLocationSyncedWithSearchQuery(namespace, state) {
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
export default function ({ dispatch, getState }) {
  return (next) => (action) => {
    if (action.type === LOCATION_CHANGE) {
      const prevState = getState();

      const prevLocation = prevState.router.location;
      const nextLocation = action.payload.location;

      const prevNamespace = getRootOfLocationPathname(prevLocation.pathname);
      const nextNamespace = getRootOfLocationPathname(nextLocation.pathname);

      const result = next(action);

      // dipsatch new search to clear to search state for previous location when pathname changes
      // ex: from `/literature?...` to `/` (home)
      if (
        prevLocation.pathname !== nextLocation.pathname &&
        isSearchPage(prevLocation)
      ) {

        dispatch(newSearch(prevNamespace));
        if (nextNamespace === LITERATURE_NS) {
          // fetch literature aggregations when `back` is clicked
          dispatch(fetchAggregationsAndSearchQueryReset(nextNamespace));
      }}

      if (isSearchPage(nextLocation)) {

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
            if (nextNamespace === LITERATURE_NS) {
              // reset query and fetch aggregations when `back` is clicked within literature collection
              dispatch(fetchAggregationsAndSearchQueryReset(nextNamespace, true));
            } else {
              dispatch(searchQueryReset(nextNamespace));
            }
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
