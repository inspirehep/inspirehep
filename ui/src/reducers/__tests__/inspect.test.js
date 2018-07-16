import { Map, fromJS } from 'immutable';

import reducer from '../inspect';
import {
  INSPECT_ERROR,
  INSPECT_REQUEST,
  INSPECT_SUCCESS,
} from '../../actions/actionTypes';

describe('inspect reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      loading: false,
      data: {},
      error: {},
    });
    expect(state).toEqual(expected);
  });

  it('INSPECT_REQUEST', () => {
    const state = reducer(Map(), { type: INSPECT_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('INSPECT_SUCCESS', () => {
    const payload = {
      foo: 'bar',
    };
    const state = reducer(Map(), { type: INSPECT_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      error: {},
      data: payload,
    });
    expect(state).toEqual(expected);
  });

  it('INSPECT_ERROR', () => {
    const state = reducer(Map(), {
      type: INSPECT_ERROR,
      payload: { message: 'error' },
    });
    const expected = fromJS({
      loading: false,
      data: {},
      error: { message: 'error' },
    });
    expect(state).toEqual(expected);
  });
});
