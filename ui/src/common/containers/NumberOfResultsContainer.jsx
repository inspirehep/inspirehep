import { connect } from 'react-redux';

import NumberOfResults from '../components/NumberOfResults';

const stateToProps = (state, { namespace }) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
});

export default connect(stateToProps)(NumberOfResults);
