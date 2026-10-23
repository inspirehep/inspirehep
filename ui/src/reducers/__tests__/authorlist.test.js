import { Map, fromJS } from 'immutable';
import reducer, { initialState } from '../authorlist';
import {
  AUTHORLIST_REQUEST,
  AUTHORLIST_SUCCESS,
  AUTHORLIST_ERROR,
} from '../../actions/actionTypes';

describe('authorlist reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('AUTHORLIST_REQUEST', () => {
    const state = reducer(Map(), { type: AUTHORLIST_REQUEST });
    const expected = fromJS({
      loading: true,
      authors: null,
      warnings: null,
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('AUTHORLIST_SUCCESS', () => {
    const payload = {
      authors: [{ fullname: 'Einstein' }],
      warnings: ['This is a warning'],
    };
    const state = reducer(Map(), {
      type: AUTHORLIST_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loading: false,
      authors: payload.authors,
      warnings: payload.warnings,
    });
    expect(state).toEqual(expected);
  });

  it('AUTHORLIST_ERROR', () => {
    const state = reducer(Map(), {
      type: AUTHORLIST_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      error: 'error',
    });
    expect(state).toEqual(expected);
  });
});
