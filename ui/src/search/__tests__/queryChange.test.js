import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import searchReducer from '../../reducers/search';
import citationsReducer from '../../reducers/citations';
import userReducer, {
  CITATION_SUMMARY_ENABLING_PREFERENCE,
} from '../../reducers/user';
import { searchQueryUpdate } from '../../actions/search';
import { fetchCitationSummary } from '../../actions/citations';
import { CITATIONS_SUMMARY_SUCCESS } from '../../actions/actionTypes';
import { LITERATURE_NS, AUTHOR_PUBLICATIONS_NS } from '../constants';

vi.mock('../../actions/citations', () => ({
  fetchCitationSummary: vi.fn(() => ({ type: 'MOCK_FETCH_CITATION_SUMMARY' })),
}));

const fakeHttp = {
  get: vi.fn(() =>
    Promise.resolve({
      data: { hits: { hits: [], total: 0 }, aggregations: {} },
    })
  ),
};

function buildStore({ persistedSize } = {}) {
  const rootReducer = combineReducers({
    search: searchReducer,
    citations: citationsReducer,
    user: userReducer,
    router: (state = { location: { query: {}, pathname: '/literature' } }) =>
      state,
  });

  let preloaded = rootReducer(undefined, { type: '@@INIT' });
  preloaded = {
    ...preloaded,
    user: preloaded.user.setIn(
      ['preferences', CITATION_SUMMARY_ENABLING_PREFERENCE],
      true
    ),
  };
  if (persistedSize) {
    preloaded = {
      ...preloaded,
      search: preloaded.search.setIn(
        ['namespaces', LITERATURE_NS, 'query', 'size'],
        persistedSize
      ),
    };
  }

  return createStore(
    rootReducer,
    preloaded,
    applyMiddleware(thunk.withExtraArgument(fakeHttp))
  );
}

describe('onLiteratureQueryChange citation summary triggering', () => {
  beforeEach(() => {
    fetchCitationSummary.mockClear();
  });

  it('fetches citation summary on a plain fresh visit', () => {
    const store = buildStore();

    store.dispatch(searchQueryUpdate(LITERATURE_NS, {}, true));

    expect(fetchCitationSummary).toHaveBeenCalledWith(LITERATURE_NS);
  });

  it('still fetches citation summary on a fresh visit when a persisted page-size makes query differ from baseQuery', () => {
    // regression test: search.namespaces.literature.query.size is persisted
    // across sessions (see REDUCERS_TO_PERSISTS), which makes
    // `isInitialQueryUpdate` permanently false for users with a non-default
    // page size, even on a namespace that has never been fetched
    const store = buildStore({ persistedSize: '10' });
    expect(
      store
        .getState()
        .search.getIn(['namespaces', LITERATURE_NS, 'query'])
        .toJS()
    ).toEqual({ sort: 'mostrecent', size: '10', page: '1' });

    store.dispatch(searchQueryUpdate(LITERATURE_NS, {}, true));

    expect(fetchCitationSummary).toHaveBeenCalledWith(LITERATURE_NS);
  });

  it('does not re-fetch on a pure pagination change once data already exists for the namespace', () => {
    const store = buildStore({ persistedSize: '10' });
    store.dispatch({
      type: CITATIONS_SUMMARY_SUCCESS,
      payload: {
        namespace: LITERATURE_NS,
        aggregations: { citation_summary: { citation_count: 1 } },
      },
    });

    store.dispatch(searchQueryUpdate(LITERATURE_NS, { page: '2' }, false));

    expect(fetchCitationSummary).not.toHaveBeenCalled();
  });

  it('re-fetches when a real filter changes, regardless of existing data', () => {
    const store = buildStore();
    store.dispatch({
      type: CITATIONS_SUMMARY_SUCCESS,
      payload: {
        namespace: LITERATURE_NS,
        aggregations: { citation_summary: { citation_count: 1 } },
      },
    });

    store.dispatch(searchQueryUpdate(LITERATURE_NS, { q: 'higgs' }, false));

    expect(fetchCitationSummary).toHaveBeenCalledWith(LITERATURE_NS);
  });

  it('also fetches citation summary for an embedded namespace on its first load', () => {
    const store = buildStore();

    store.dispatch(
      searchQueryUpdate(
        AUTHOR_PUBLICATIONS_NS,
        { search_type: 'hep-author-publication' },
        false
      )
    );

    expect(fetchCitationSummary).toHaveBeenCalledWith(AUTHOR_PUBLICATIONS_NS);
  });
});
