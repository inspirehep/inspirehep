import { Map, fromJS } from 'immutable';

import reducer from '../submissions';
import { SUBMIT_SUCCESS, SUBMIT_ERROR } from '../../actions/actionTypes';

describe('submissions reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      error: null,
    });
    expect(state).toEqual(expected);
  });

  it('SUBMIT_ERROR', () => {
    const error = { message: 'Error' };
    const state = reducer(Map(), { type: SUBMIT_ERROR, payload: error });
    const expected = fromJS({ error });
    expect(state).toEqual(expected);
  });

  it('SUBMIT_SUCCESS', () => {
    const error = { message: 'Error' };
    const state = reducer(fromJS({ error }), { type: SUBMIT_SUCCESS });
    const expected = fromJS({ error: null });
    expect(state).toEqual(expected);
  });
});
