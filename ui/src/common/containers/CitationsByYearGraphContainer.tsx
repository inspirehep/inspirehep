// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { convertAllImmutablePropsToJS } from '../immutableToJS';
import CitationsByYearGraph from '../components/CitationsByYearGraph';

const stateToProps = (state: $TSFixMe) => ({
  loading: state.citations.get('loadingCitationsByYear'),
  citationsByYear: state.citations.get('byYear'),
  error: state.citations.get('errorCitationsByYear')
});

export default connect(stateToProps)(
  convertAllImmutablePropsToJS(CitationsByYearGraph)
);
