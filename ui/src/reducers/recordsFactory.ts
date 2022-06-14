import { fromJS } from 'immutable';
import { CLEAR_STATE } from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

export const onRequest = (state: any) => state.set('loading', true);
export const onSuccess = (state: any, action: any) =>
  state
    .set('loading', false)
    .set('data', fromJS(action.payload))
    .set('error', initialState.get('error'));
export const onError = (state: any, action: any) =>
  state
    .set('loading', false)
    .set('error', fromJS(action.payload.error))
    .set('data', initialState.get('data'));

export default function generateRecordFetchReducer({
  fetchingActionActionType,
  fecthSuccessActionType,
  fetchErrorActionType
}: any) {
  const reducer = (state = initialState, action: any) => {
    switch (action.type) {
      case CLEAR_STATE:
        return initialState;
      case fetchingActionActionType:
        return onRequest(state);
      case fecthSuccessActionType:
        return onSuccess(state, action);
      case fetchErrorActionType:
        return onError(state, action);
      default:
        return state;
    }
  };

  return reducer;
}
