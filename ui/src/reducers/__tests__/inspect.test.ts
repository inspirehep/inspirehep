import { Map, fromJS } from 'immutable';

import reducer from '../inspect';
import {
  INSPECT_ERROR,
  INSPECT_REQUEST,
  INSPECT_SUCCESS,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('inspect reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      loading: false,
      data: {},
      error: {},
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('INSPECT_REQUEST', () => {
    const state = reducer(Map(), { type: INSPECT_REQUEST });
    const expected = Map({ loading: true });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('INSPECT_ERROR', () => {
    const state = reducer(Map(), {
      type: INSPECT_ERROR,
      payload: {
        error: { message: 'error' }
      },
    });
    const expected = fromJS({
      loading: false,
      data: {},
      error: { message: 'error' },
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });
});
