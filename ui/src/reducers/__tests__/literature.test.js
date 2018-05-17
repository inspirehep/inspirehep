import { Map, fromJS } from 'immutable';

import reducer from '../literature';
import * as types from '../../actions/actionTypes';

describe('literature reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      loading: false,
      data: {},
      error: {},
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_REQUEST', () => {
    const state = reducer(Map(), { type: types.LITERATURE_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_SUCCESS', () => {
    const payload = {
      metadata: {
        titles: [
          {
            title: 'Jessica Jones',
          },
        ],
      },
    };
    const state = reducer(Map(), { type: types.LITERATURE_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
    });
    expect(state).toEqual(expected);
  });

  it('LITERATURE_ERROR', () => {
    const state = reducer(Map(), {
      type: types.LITERATURE_ERROR,
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
