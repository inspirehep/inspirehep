import { fromJS } from 'immutable';

import {
  BIBLIOGRAPHY_GENERATOR_SUCCESS,
  BIBLIOGRAPHY_GENERATOR_REQUEST,
  BIBLIOGRAPHY_GENERATOR_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: null,
  citationErrors: null,
  error: null,
});

const bibliographyGeneratorReducer = (state = initialState, action) => {
  const { payload } = action;
  const { data, error, errors } = payload || {};
  switch (action.type) {
    case BIBLIOGRAPHY_GENERATOR_REQUEST:
      return state
        .set('loading', true)
        .set('data', initialState.get('data'))
        .set('citationErrors', initialState.get('citationErrors'))
        .set('error', initialState.get('error'));
    case BIBLIOGRAPHY_GENERATOR_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(data))
        .set('citationErrors', fromJS(errors));
    case BIBLIOGRAPHY_GENERATOR_ERROR:
      return state.set('loading', false).set('error', fromJS(error));
    default:
      return state;
  }
};

export default bibliographyGeneratorReducer;
