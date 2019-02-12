import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../submissions';
import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_SUCCESS,
  INITIAL_FORM_DATA_ERROR,
} from '../../actions/actionTypes';

describe('submissions reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      submitError: null,
      loadingInitialData: false,
      initialData: null,
      initialDataError: null,
    });
    expect(state).toEqual(expected);
  });

  it('SUBMIT_ERROR', () => {
    const submitError = { message: 'Error' };
    const state = reducer(Map(), {
      type: SUBMIT_ERROR,
      payload: submitError,
    });
    expect(state.get('submitError')).toEqual(fromJS(submitError));
  });

  it('SUBMIT_SUCCESS', () => {
    const submitError = { message: 'Error' };
    const stateWithError = fromJS({
      submitError,
    });
    const state = reducer(stateWithError, { type: SUBMIT_SUCCESS });
    expect(state.get('submitError')).toEqual(initialState.get('submitError'));
  });

  it('INITIAL_FORM_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_REQUEST,
    });
    expect(state.get('loadingInitialData')).toBe(true);
  });

  it('INITIAL_FORM_DATA_SUCCESS', () => {
    const data = fromJS({
      control_number: 123,
    });
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_SUCCESS,
      payload: { data },
    });
    expect(state.get('initialData')).toEqual(data);
    expect(state.get('loadingInitialData')).toBe(false);
    expect(state.get('initialDataError')).toEqual(
      initialState.get('initialDataError')
    );
  });

  it('INITIAL_FORM_DATA_ERROR', () => {
    const error = fromJS({
      message: 'Error',
    });
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_ERROR,
      payload: error,
    });
    expect(state.get('initialDataError')).toEqual(error);
    expect(state.get('loadingInitialData')).toBe(false);
    expect(state.get('initialData')).toEqual(initialState.get('initialData'));
  });
});
