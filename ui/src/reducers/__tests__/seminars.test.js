import { Map, fromJS } from 'immutable';
import reducer from '../seminars';
import { initialState } from '../recordsFactory';
import {
  CLEAR_STATE,
  SEMINAR_REQUEST,
  SEMINAR_SUCCESS,
  SEMINAR_ERROR,
} from '../../actions/actionTypes';

describe('seminars reducer', () => {
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

  it('SEMINAR_REQUEST', () => {
    const state = reducer(Map(), { type: SEMINAR_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('SEMINAR_SUCCESS', () => {
    const payload = {
      metadata: {
        titles: [
          {
            title: '32nd International Conference on High Energy Physics',
          },
        ],
      },
    };
    const state = reducer(Map(), { type: SEMINAR_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('SEMINAR_ERROR', () => {
    const state = reducer(Map(), {
      type: SEMINAR_ERROR,
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
