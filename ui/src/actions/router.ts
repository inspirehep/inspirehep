import { replace } from 'connected-react-router';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
import { stringify } from 'qs';

export function appendQueryToLocationSearch(query: any) {
  return (dispatch: any, getState: any) => {
    const { router } = getState();
    const newQuery = { ...router.location.query, ...query };
    const search = `?${stringify(newQuery, { indices: false })}`;
    const newLocation = { ...router.location, search };
    dispatch(replace(newLocation));
  };
}
