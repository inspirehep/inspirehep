import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../submissions';
import {
  SUBMIT_SUCCESS,
  SUBMIT_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_SUCCESS,
  INITIAL_FORM_DATA_ERROR,
  SUBMIT_REQUEST,
} from '../../actions/actionTypes';

describe('submissions reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      submitError: null,
      successData: null,
      loadingInitialData: false,
      initialData: null,
      initialDataError: null,
      initialMeta: null,
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

  it('SUBMIT_REQUEST', () => {
    const submitError = { message: 'Error' };
    const successData = { foo: 'bar' };
    const stateWithErrorAndData = fromJS({
      submitError,
      successData,
    });
    const state = reducer(stateWithErrorAndData, { type: SUBMIT_REQUEST });
    expect(state.get('successData')).toEqual(initialState.get('successData'));
    expect(state.get('submitError')).toEqual(initialState.get('submitError'));
  });

  it('SUBMIT_SUCCESS', () => {
    const submitError = { message: 'Error' };
    const stateWithError = fromJS({
      submitError,
    });
    const data = { cnum: 'C2019-10-10' };
    const state = reducer(stateWithError, {
      type: SUBMIT_SUCCESS,
      payload: data,
    });
    expect(state.get('successData')).toEqual(fromJS(data));
  });

  it('INITIAL_FORM_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_REQUEST,
    });
    expect(state.get('loadingInitialData')).toBe(true);
  });

  it('INITIAL_FORM_DATA_SUCCESS', () => {
    const data = {
      control_number: 123,
    };
    const meta = {
      can_modify_status: true,
    };
    const state = reducer(Map(), {
      type: INITIAL_FORM_DATA_SUCCESS,
      payload: { data, meta },
    });
    expect(state.get('initialData').toJS()).toEqual(data);
    expect(state.get('initialMeta').toJS()).toEqual(meta);
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
