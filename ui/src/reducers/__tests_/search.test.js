import { Map, fromJS } from 'immutable';
import reducer from '../search';
import * as types from '../../actions/actionTypes';

describe('search reducer', () => {
  it('SEARCHING', () => {
    const state = reducer(Map(), { type: types.SEARCHING });
    const expected = Map({ searching: true });
    expect(state).toEqual(expected);
  });

  it('SEARCH_SUCCESSFUL', () => {
    const state = reducer(Map(), { type: types.SEARCH_SUCCESS, payload: ['found'] });
    const expected = fromJS({ searching: false, results: ['found'] });
    expect(state).toEqual(expected);
  });

  it('SEARCH_ERROR', () => {
    const state = reducer(Map(), { type: types.SEARCH_ERROR, payload: { message: 'error' } });
    const expected = fromJS({ searching: false, error: { message: 'error' } });
    expect(state).toEqual(expected);
  });
});
