import { connect } from 'react-redux';

import SearchResults from '../components/SearchResults';
import { castPropToNumber } from '../utils';
import { isCataloger } from '../authorization';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: any
) => ({
  results: state.search.getIn(['namespaces', namespace, 'results']),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),

  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),

  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  )
});

export default connect(stateToProps)(SearchResults);
