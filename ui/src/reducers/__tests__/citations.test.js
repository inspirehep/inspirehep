import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../citations';
import * as types from '../../actions/actionTypes';

describe('citations reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('CITATIONS_SUMMARY_REQUEST', () => {
    const state = reducer(Map(), { type: types.CITATIONS_SUMMARY_REQUEST });
    expect(state.get('loadingCitationSummary')).toEqual(true);
  });

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
    expect(state).toEqual(expected);
  });

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
    expect(state).toEqual(expected);
  });

  it('CITATIONS_BY_YEAR_REQUEST', () => {
    const state = reducer(Map(), { type: types.CITATIONS_BY_YEAR_REQUEST });
    const expected = fromJS({
      loadingCitationsByYear: true,
    });
    expect(state).toEqual(expected);
  });

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
    expect(state).toEqual(expected);
  });

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
    expect(state).toEqual(expected);
  });
});
