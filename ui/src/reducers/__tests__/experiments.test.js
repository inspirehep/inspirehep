import { Map, fromJS } from 'immutable';
import reducer, { initialState } from '../experiments';
import {
  CLEAR_STATE,
  EXPERIMENT_REQUEST,
  EXPERIMENT_SUCCESS,
  EXPERIMENT_ERROR,
} from '../../actions/actionTypes';

describe('experiments reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('CLEAR_STATE', () => {
    const currentState = fromJS({
      data: {
        control_number: 123456,
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    expect(state).toEqual(initialState);
  });

  it('EXPERIMENT_REQUEST', () => {
    const state = reducer(Map(), { type: EXPERIMENT_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('EXPERIMENT_SUCCESS', () => {
    const payload = {
      metadata: {
        legacy_name: 'Experiment',
      },
    };
    const state = reducer(Map(), { type: EXPERIMENT_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('EXPERIMENT_ERROR', () => {
    const state = reducer(Map(), {
      type: EXPERIMENT_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      data: initialState.get('data'),
      error: { message: 'error' },
    });
    expect(state).toEqual(expected);
  });
});
