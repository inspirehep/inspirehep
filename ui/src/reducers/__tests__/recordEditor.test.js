import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../recordEditor';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
} from '../../actions/actionTypes';

describe('recordEditor reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REQUEST', () => {
    const state = reducer(Map(), { type: EDITOR_AUTHOR_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SUCCESS', () => {
    const payload = {
      data: {
        metadata: {
          name: {
            preferred_name: 'Jessica Jones',
          },
        },
      },
    };
    const currentState = fromJS({ loading: true, author: {} });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loading: false,
      author: payload.data,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_ERROR', () => {
    const currentState = fromJS({
      loading: true,
      author: { metadata: { control_number: 123 } },
    });
    const state = reducer(currentState, { type: EDITOR_AUTHOR_ERROR });
    const expected = fromJS({
      loading: false,
      author: initialState.get('author'),
    });
    expect(state).toEqual(expected);
  });
});
