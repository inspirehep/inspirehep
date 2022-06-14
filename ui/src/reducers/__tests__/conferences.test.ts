import { Map, fromJS } from 'immutable';
import reducer from '../conferences';
import { initialState } from '../recordsFactory';

import {
  CLEAR_STATE,
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CONFERENCE_ERROR,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('conferences reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CLEAR_STATE', () => {
    const currentState = fromJS({
      data: {
        control_number: 123456,
      },
    });
    const state = reducer(currentState, { type: CLEAR_STATE });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CONFERENCE_REQUEST', () => {
    const state = reducer(Map(), { type: CONFERENCE_REQUEST });
    const expected = Map({ loading: true });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CONFERENCE_SUCCESS', () => {
    const payload = {
      metadata: {
        titles: [
          {
            title: '32nd International Conference on High Energy Physics',
          },
        ],
      },
    };
    const state = reducer(Map(), { type: CONFERENCE_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      data: payload,
      error: null,
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CONFERENCE_ERROR', () => {
    const state = reducer(Map(), {
      type: CONFERENCE_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      data: initialState.get('data'),
      error: { message: 'error' },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
