import { connect } from 'react-redux';

import CiteAllAction from '../components/CiteAllAction';

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
  query: state.router.location.query,
});

export default connect(stateToProps)(CiteAllAction);
