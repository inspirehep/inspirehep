import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../citations';
import * as types from '../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('citations reducer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default', () => {
    const state = reducer(undefined, {});
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(initialState);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_SUMMARY_REQUEST', () => {
    const state = reducer(Map(), { type: types.CITATIONS_SUMMARY_REQUEST });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state.get('loadingCitationSummary')).toEqual(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_SUMMARY_SUCCESS', () => {
    const payload = {
      aggregations: {
        citation_summary: {
          citation_count: 1,
        },
      },
    };
    const state = reducer(Map(), {
      type: types.CITATIONS_SUMMARY_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loadingCitationSummary: false,
      errorCitationSummary: initialState.get('errorCitationSummary'),
      citationSummary: payload.aggregations.citation_summary,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_SUMMARY_ERROR', () => {
    const payload = {
      error: { message: 'error' },
    };
    const state = reducer(Map(), {
      type: types.CITATIONS_SUMMARY_ERROR,
      payload,
    });
    const expected = fromJS({
      loadingCitationSummary: false,
      errorCitationSummary: payload.error,
      citationSummary: initialState.get('citationSummary'),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_BY_YEAR_REQUEST', () => {
    const state = reducer(Map(), { type: types.CITATIONS_BY_YEAR_REQUEST });
    const expected = fromJS({
      loadingCitationsByYear: true,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_BY_YEAR_SUCCESS', () => {
    const payload = {
      aggregations: {
        citations_by_year: {
          value: {
            '1993': 21,
            '2000': 12,
          },
        },
      },
    };
    const state = reducer(Map(), {
      type: types.CITATIONS_BY_YEAR_SUCCESS,
      payload,
    });
    const expected = fromJS({
      loadingCitationsByYear: false,
      errorCitationsByYear: initialState.get('errorCitationsByYear'),
      byYear: payload.aggregations.citations_by_year.value,
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CITATIONS_BY_YEAR_ERROR', () => {
    const payload = { error: { message: 'error' } };
    const state = reducer(Map(), {
      type: types.CITATIONS_BY_YEAR_ERROR,
      payload,
    });
    const expected = fromJS({
      loadingCitationsByYear: false,
      errorCitationsByYear: payload.error,
      byYear: initialState.get('byYear'),
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(state).toEqual(expected);
  });
});
