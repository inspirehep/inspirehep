import { Action, ActionCreator } from 'redux';
import { replace } from 'connected-react-router';
import { stringify } from 'qs';
import { RootState } from '../types';

export function appendQueryToLocationSearch(query: {}): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState
) => void {
  return (dispatch, getState) => {
    const { router } = getState();
    const newQuery = { ...router.location.query, ...query };
    const search = `?${stringify(newQuery, { indices: false })}`;
    const newLocation = { ...router.location, search };
    dispatch(replace(newLocation));
  };
}
