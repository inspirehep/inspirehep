import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../citations';
import * as types from '../../actions/actionTypes';

describe('citations reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      loading: false,
      data: [],
      total: 0,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('CITATIONS_REQUEST', () => {
    const state = reducer(Map(), { type: types.CITATIONS_REQUEST });
    expect(state.get('loading')).toEqual(true);
  });

  it('CITATIONS_SUCCESS', () => {
    const payload = {
      metadata: {
        citation_count: 1,
        citations: [
          {
            control_number: 123,
          },
        ],
      },
    };
    const state = reducer(Map(), { type: types.CITATIONS_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      error: initialState.get('error'),
      data: payload.metadata.citations,
      total: payload.metadata.citation_count,
    });
    expect(state).toEqual(expected);
  });

  it('CITATIONS_ERROR', () => {
    const payload = { message: 'error' };
    const state = reducer(Map(), {
      type: types.CITATIONS_ERROR,
      payload,
    });
    const expected = fromJS({
      loading: false,
      error: payload,
      data: initialState.get('data'),
      total: initialState.get('total'),
    });
    expect(state).toEqual(expected);
  });
});
