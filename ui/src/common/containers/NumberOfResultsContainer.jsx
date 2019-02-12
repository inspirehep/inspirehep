import { connect } from 'react-redux';

import NumberOfResults from '../components/NumberOfResults';

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
});

export default connect(stateToProps)(NumberOfResults);
