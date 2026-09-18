import { connect } from 'react-redux';
import { RootState } from '../../types';

import CitationSummaryTable from '../components/CitationSummaryTable';

const stateToProps = (
  state: RootState,
  { namespace }: { namespace: string }
) => ({
  loading: state.citations.getIn([
    'namespaces',
    namespace,
    'loadingCitationSummary',
  ]),
  publishedBucket: state.citations.getIn([
    'namespaces',
    namespace,
    'citationSummary',
    'citations',
    'buckets',
    'published',
  ]),
  citeableBucket: state.citations.getIn([
    'namespaces',
    namespace,
    'citationSummary',
    'citations',
    'buckets',
    'all',
  ]),
  hIndex: state.citations.getIn([
    'namespaces',
    namespace,
    'citationSummary',
    'h-index',
    'value',
  ]),
  error: state.citations.getIn([
    'namespaces',
    namespace,
    'errorCitationSummary',
  ]),
});

// TODO: convert immutable to js and simplify CitationSummaryTable
export default connect(stateToProps, null)(CitationSummaryTable);
