import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../submissions';
import {
  AUTHOR_SUBMIT_SUCCESS,
  AUTHOR_SUBMIT_ERROR,
} from '../../actions/actionTypes';

describe('submissions reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      author: {
        submitError: null,
      },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_SUBMIT_ERROR', () => {
    const submitError = { message: 'Error' };
    const state = reducer(Map(), {
      type: AUTHOR_SUBMIT_ERROR,
      payload: submitError,
    });
    const expected = fromJS({
      ...initialState.toJS(),
      author: { submitError },
    });
    expect(state).toEqual(expected);
  });

  it('AUTHOR_SUBMIT_SUCCESS', () => {
    const submitError = { message: 'Error' };
    const stateWithError = fromJS({
      author: { submitError },
    });
    const state = reducer(stateWithError, { type: AUTHOR_SUBMIT_SUCCESS });
    const expected = fromJS({
      ...initialState.toJS(),
      author: { submitError: null },
    });
    expect(state).toEqual(expected);
  });
});
