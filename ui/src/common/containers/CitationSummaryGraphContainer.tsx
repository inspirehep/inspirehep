import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { convertAllImmutablePropsToJS } from '../immutableToJS';
import {
  CITEABLE_QUERY,
  PUBLISHED_QUERY,
  CITEABLE_BAR_TYPE,
  PUBLISHED_BAR_TYPE,
  CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM,
  CITATION_COUNT_PARAM,
} from '../constants';
import CitationSummaryGraph from '../components/CitationSummaryGraph';
import { searchQueryUpdate } from '../../actions/search';
import { shouldExcludeSelfCitations } from '../../literature/containers/ExcludeSelfCitationsContainer';
import { Bar } from '../components/CitationSummaryGraph/CitationSummaryGraph';

const CLEAR_QUERY = {
  citeable: undefined,
  refereed: undefined,
  [CITATION_COUNT_PARAM]: undefined,
  [CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM]: undefined,
};

function barToQuery(bar: Bar, excludeSelfCitations: boolean) {
  if (bar == null) {
    return CLEAR_QUERY;
  }

  const citationCountParam = excludeSelfCitations
    ? CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM
    : CITATION_COUNT_PARAM;
  if (bar.type === CITEABLE_BAR_TYPE) {
    return {
      ...CITEABLE_QUERY,
      [citationCountParam]: bar.xValue,
    };
  }
  return { ...PUBLISHED_QUERY, [citationCountParam]: bar.xValue };
}

function getSelectedBar(state: RootStateOrAny, namespace: string) {
  const citationCountParam = shouldExcludeSelfCitations(state)
    ? CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM
    : CITATION_COUNT_PARAM;
  const query = state.search.getIn(['namespaces', namespace, 'query']);
  if (query.get('citeable') && query.get(citationCountParam)) {
    if (query.get('refereed')) {
      return {
        type: PUBLISHED_BAR_TYPE,
        xValue: query.get(citationCountParam),
      };
    }
    return {
      type: CITEABLE_BAR_TYPE,
      xValue: query.get(citationCountParam),
    };
  }
  return null;
}

const stateToProps = (
  state: RootStateOrAny,
  { namespace }: { namespace: string }
) => ({
  loading: state.citations.get('loadingCitationSummary'),
  citeableData: state.citations.getIn([
    'citationSummary',
    'citations',
    'buckets',
    'all',
    'citation_buckets',
    'buckets',
  ]),
  publishedData: state.citations.getIn([
    'citationSummary',
    'citations',
    'buckets',
    'published',
    'citation_buckets',
    'buckets',
  ]),
  error: state.citations.get('errorCitationSummary'),
  selectedBar: getSelectedBar(state, namespace),
  excludeSelfCitations: shouldExcludeSelfCitations(state),
});

const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  { namespace }: { namespace: string }
) => ({
  // TODO: rename to onSelectedBarChange
  onSelectBarChange(bar: Bar, excludeSelfCitations: boolean) {
    const query = barToQuery(bar, excludeSelfCitations);
    dispatch(searchQueryUpdate(namespace, { page: '1', ...query }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(convertAllImmutablePropsToJS(CitationSummaryGraph));
