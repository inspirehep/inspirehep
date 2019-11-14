import { connect } from 'react-redux';
import { convertAllImmutablePropsToJS } from '../immutableToJS';
import {
  CITEABLE_QUERY,
  PUBLISHED_QUERY,
  CITEABLE_BAR_TYPE,
  PUBLISHED_BAR_TYPE,
} from '../constants';
import CitationSummaryGraph from '../components/CitationSummaryGraph';
import { AUTHOR_PUBLICATIONS_NS } from '../../reducers/search';
import { searchQueryUpdate } from '../../actions/search';

const CLEAR_QUERY = {
  citeable: undefined,
  refereed: undefined,
  citation_count: undefined,
};

function barToQuery(bar) {
  if (bar == null) {
    return CLEAR_QUERY;
  }
  if (bar.type === CITEABLE_BAR_TYPE) {
    return {
      ...CITEABLE_QUERY,
      citation_count: bar.xValue,
    };
  }
  return { ...PUBLISHED_QUERY, citation_count: bar.xValue };
}

export function queryToBar(query) {
  if (query.get('citeable') && query.get('citation_count')) {
    if (query.get('refereed')) {
      return {
        type: PUBLISHED_BAR_TYPE,
        xValue: query.get('citation_count'),
      };
    }
    return {
      type: CITEABLE_BAR_TYPE,
      xValue: query.get('citation_count'),
    };
  }
  return null;
}

const stateToProps = state => ({
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
  selectedBar: queryToBar(
    state.search.getIn(['namespaces', AUTHOR_PUBLICATIONS_NS, 'query'])
  ),
});

const dispatchToProps = dispatch => ({
  // TODO: rename to onSelectedBarChange
  onSelectBarChange(bar) {
    const query = barToQuery(bar);
    dispatch(searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, query));
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(CitationSummaryGraph)
);
