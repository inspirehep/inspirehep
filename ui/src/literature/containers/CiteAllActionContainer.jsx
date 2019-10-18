import { connect } from 'react-redux';

import omit from 'lodash.omit';
import CiteAllAction from '../components/CiteAllAction';
import { searchScopes } from '../../reducers/search';

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
  query: {
    // set default `sort` in case there is no `sort` in the location query
    sort: searchScopes.getIn(['literature', 'query', 'sort']),
    ...omit(state.router.location.query, ['size', 'page']),
  },
});

export default connect(stateToProps)(CiteAllAction);
