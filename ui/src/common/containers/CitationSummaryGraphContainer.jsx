import { connect } from 'react-redux';
import CitationSummaryGraph from '../components/CitationSummaryGraph/CitationSummaryGraph';
import { convertAllImmutablePropsToJS } from '../immutableToJS';

const stateToProps = state => ({
  loadingCitationSummary: state.citations.get('loadingCitationSummary'),
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
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(CitationSummaryGraph)
);
