import { fromJS } from 'immutable';

import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: {},
  loadingReferences: false,
  errorReferences: {},
  references: [],
});

const literatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case LITERATURE_REQUEST:
      return state.set('loading', true);
    case LITERATURE_SUCCESS:
      return state.set('loading', false).set('data', fromJS(action.payload));
    case LITERATURE_ERROR:
      return state
        .set('loading', false)
        .set('data', fromJS({}))
        .set('error', fromJS(action.payload));
    case LITERATURE_REFERENCES_REQUEST:
      return state.set('loadingReferences', true);
    case LITERATURE_REFERENCES_SUCCESS:
      return state
        .set('loadingReferences', false)
        .set('references', fromJS(action.payload.metadata.references))
        .set('errorReferences', initialState.get('errorReferences'));
    case LITERATURE_REFERENCES_ERROR:
      return state
        .set('loadingReferences', false)
        .set('errorReferences', fromJS(action.payload))
        .set('references', initialState.get('references'));
    default:
      return state;
  }
};

export default literatureReducer;
