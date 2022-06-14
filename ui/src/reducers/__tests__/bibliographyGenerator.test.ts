import { Map, fromJS } from 'immutable';
import reducer, { initialState } from '../bibliographyGenerator';
import {
  BIBLIOGRAPHY_GENERATOR_REQUEST,
  BIBLIOGRAPHY_GENERATOR_SUCCESS,
  BIBLIOGRAPHY_GENERATOR_ERROR,
} from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('bibliographyGenerator reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('BIBLIOGRAPHY_GENERATOR_REQUEST', () => {
    const state = reducer(Map(), { type: BIBLIOGRAPHY_GENERATOR_REQUEST });
    const expected = fromJS({
      loading: true,
      data: null,
      citationErrors: null,
      error: null,
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('BIBLIOGRAPHY_GENERATOR_SUCCESS', () => {
    const payload = {
      data: {
        download_url: 'https://google.com',
      },
      errors: [{ message: 'This is an error' }],
    };
    const state = reducer(Map(), {
      type: BIBLIOGRAPHY_GENERATOR_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loading: false,
      data: payload.data,
      citationErrors: payload.errors,
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('BIBLIOGRAPHY_GENERATOR_ERROR', () => {
    const state = reducer(Map(), {
      type: BIBLIOGRAPHY_GENERATOR_ERROR,
      payload: {
        error: { message: 'error' },
      },
    });
    const expected = fromJS({
      loading: false,
      error: { message: 'error' },
    });
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(state).toEqual(expected);
  });
});
