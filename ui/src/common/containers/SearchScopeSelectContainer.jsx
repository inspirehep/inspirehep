import { connect } from 'react-redux';

import SearchScopeSelect from '../components/SearchScopeSelect';
import { changeSearchScope } from '../../actions/search';

const stateToProps = state => ({
  searchScopeName: state.search.getIn(['scope', 'name']),
});

export const dispatchToProps = dispatch => ({
  onSearchScopeChange(scope) {
    dispatch(changeSearchScope(scope));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchScopeSelect);
