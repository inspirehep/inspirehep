import { connect } from 'react-redux';
import { RootState } from '../../types';

import SearchResults from '../components/SearchResults';
import { castPropToNumber } from '../utils';
import { isCataloger } from '../authorization';

const stateToProps = (
  state: RootState,
  { namespace }: { namespace: string }
) => ({
  results: state.search.getIn(['namespaces', namespace, 'results']),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),
  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  ),
});

export default connect(stateToProps)(SearchResults);
