import reducer from '../search';
import * as types from '../../actions/actionTypes';

describe('search reducer', () => {
  it('should mark state.search true when SEARCHING', () => {
    const state = reducer({}, { type: types.SEARCHING });
    const expected = { searching: true };
    expect(state).toEqual(expected);
  });
});
