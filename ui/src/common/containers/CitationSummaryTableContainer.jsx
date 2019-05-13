import { connect } from 'react-redux';

import CitationSummaryTable from '../components/CitationSummaryTable';

const stateToProps = state => ({
  loading: state.citations.get('loadingCitationSummary'),
  publishedBucket: state.citations.getIn([
    'citationSummary',
    'citations',
    'buckets',
    'published',
  ]),
  citeableBucket: state.citations.getIn([
    'citationSummary',
    'citations',
    'buckets',
    'all',
  ]),
  hIndex: state.citations.getIn(['citationSummary', 'h-index', 'value']),
  error: state.citations.get('errorCitationSummary'),
});

// TODO: convert immutable to js
export default connect(stateToProps, null)(CitationSummaryTable);
