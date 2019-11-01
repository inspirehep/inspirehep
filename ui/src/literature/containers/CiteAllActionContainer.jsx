import { connect } from 'react-redux';

import CiteAllAction from '../components/CiteAllAction';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';

const stateToProps = (state, { namespace }) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
  query: state.search.getIn(['namespaces', namespace, 'query']),
});

export default connect(stateToProps)(
  convertAllImmutablePropsToJS(CiteAllAction)
);
