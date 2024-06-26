import { connect, RootStateOrAny } from 'react-redux';

import { convertAllImmutablePropsToJS } from '../immutableToJS';
import CitationsByYearGraph from '../components/CitationsByYearGraph';

const stateToProps = (state: RootStateOrAny) => ({
  loading: state.citations.get('loadingCitationsByYear'),
  citationsByYear: state.citations.get('byYear'),
  error: state.citations.get('errorCitationsByYear'),
});

export default connect(stateToProps)(
  convertAllImmutablePropsToJS(CitationsByYearGraph)
);
