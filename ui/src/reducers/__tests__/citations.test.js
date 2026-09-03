import { Map, fromJS } from 'immutable';

import reducer, { initialState, initialNamespaceState } from '../citations';
import * as types from '../../actions/actionTypes';

const namespace = 'literature';

describe('citations reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('CITATIONS_SUMMARY_REQUEST', () => {
    const state = reducer(Map(), {
      type: types.CITATIONS_SUMMARY_REQUEST,
      payload: { namespace },
    });
    expect(
      state.getIn(['namespaces', namespace, 'loadingCitationSummary'])
    ).toEqual(true);
  });

  it('CITATIONS_SUMMARY_SUCCESS', () => {
    const payload = {
      namespace,
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
      errorCitationSummary: initialNamespaceState.get('errorCitationSummary'),
      citationSummary: payload.aggregations.citation_summary,
    });
    expect(state.getIn(['namespaces', namespace])).toEqual(expected);
  });

  it('CITATIONS_SUMMARY_ERROR', () => {
    const payload = {
      namespace,
      error: { message: 'error' },
    };
    const state = reducer(Map(), {
      type: types.CITATIONS_SUMMARY_ERROR,
      payload,
    });
    const expected = fromJS({
      loadingCitationSummary: false,
      errorCitationSummary: payload.error,
      citationSummary: initialNamespaceState.get('citationSummary'),
    });
    expect(state.getIn(['namespaces', namespace])).toEqual(expected);
  });

  it('keeps citation summaries for different namespaces independent', () => {
    let state = reducer(Map(), {
      type: types.CITATIONS_SUMMARY_SUCCESS,
      payload: {
        namespace: 'literature',
        aggregations: { citation_summary: { citation_count: 1 } },
      },
    });
    state = reducer(state, {
      type: types.CITATIONS_SUMMARY_SUCCESS,
      payload: {
        namespace: 'authorPublications',
        aggregations: { citation_summary: { citation_count: 2 } },
      },
    });

    expect(
      state.getIn(['namespaces', 'literature', 'citationSummary']).toJS()
    ).toEqual({ citation_count: 1 });
    expect(
      state
        .getIn(['namespaces', 'authorPublications', 'citationSummary'])
        .toJS()
    ).toEqual({ citation_count: 2 });
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
            1993: 21,
            2000: 12,
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
