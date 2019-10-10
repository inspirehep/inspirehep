import { connect } from 'react-redux';
import omit from 'lodash.omit';

import CiteAllAction from '../components/CiteAllAction';

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
  query: omit(state.router.location.query, ['sort', 'page']),
});

export default connect(stateToProps)(CiteAllAction);
