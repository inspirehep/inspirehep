// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import CitationSummaryTable from '../components/CitationSummaryTable';

const stateToProps = (state: any) => ({
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
  error: state.citations.get('errorCitationSummary')
});

// TODO: convert immutable to js and simplify CitationSummaryTable
export default connect(stateToProps, null)(CitationSummaryTable);
