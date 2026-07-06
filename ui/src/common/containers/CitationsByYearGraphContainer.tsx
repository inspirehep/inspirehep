import { connect } from 'react-redux';
import { RootState } from '../../types';

import { convertAllImmutablePropsToJS } from '../immutableToJS';
import CitationsByYearGraph from '../components/CitationsByYearGraph';

const stateToProps = (state: RootState) => ({
  loading: state.citations.get('loadingCitationsByYear'),
  citationsByYear: state.citations.get('byYear'),
  error: state.citations.get('errorCitationsByYear'),
});

export default connect(stateToProps)(
  convertAllImmutablePropsToJS(CitationsByYearGraph)
);
