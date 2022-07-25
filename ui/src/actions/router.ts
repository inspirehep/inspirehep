import { Action, ActionCreator, Dispatch } from 'redux';
import { RootStateOrAny } from 'react-redux';
import { replace } from 'connected-react-router';
import { stringify } from 'qs';

export function appendQueryToLocationSearch(query: {}): (
  dispatch: Dispatch | ActionCreator<Action>,
  getState: () => RootStateOrAny,
) => void {
  return (dispatch, getState) => {
    const { router } = getState();
    const newQuery = { ...router.location.query, ...query };
    const search = `?${stringify(newQuery, { indices: false })}`;
    const newLocation = { ...router.location, search };
    dispatch(replace(newLocation));
  };
}
