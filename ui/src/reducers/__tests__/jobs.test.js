import { Map, fromJS } from 'immutable';
import reducer, { initialState } from '../jobs';
import {
  CLEAR_STATE,
  JOB_REQUEST,
  JOB_SUCCESS,
  JOB_ERROR,
} from '../../actions/actionTypes';

describe('jobs reducer', () => {
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

  it('JOB_REQUEST', () => {
    const state = reducer(Map(), { type: JOB_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('JOB_SUCCESS', () => {
    const payload = {
      metadata: {
        titles: [
          {
            title: 'Jessica Jones',
          },
        ],
      },
    };
    const state = reducer(Map(), { type: JOB_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('JOB_ERROR', () => {
    const state = reducer(Map(), {
      type: JOB_ERROR,
      payload: {
        error: { message: 'error' }
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
