import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SelectBox from '../components/SelectBox';
import { changeSearchScope } from '../../actions/search';
import { searchScopes } from '../../reducers/search';

const SCOPE_OPTIONS = searchScopes
  .keySeq()
  .take(1) // TODO: remove this to be able to select other scopes than literature, like: authors
  .map(scope => ({ value: scope }))
  .toJS();

class SearchScopeSelectContainer extends Component {
  render() {
    const { searchScopeName, onSearchScopeChange } = this.props;
    return (
      <SelectBox
        onChange={onSearchScopeChange}
        value={searchScopeName}
        options={SCOPE_OPTIONS}
      />
    );
  }
}

SearchScopeSelectContainer.propTypes = {
  onSearchScopeChange: PropTypes.func.isRequired,
  searchScopeName: PropTypes.string.isRequired,
};

const stateToProps = state => ({
  searchScopeName: state.search.getIn(['scope', 'name']),
});

export const dispatchToProps = dispatch => ({
  onSearchScopeChange(scope) {
    dispatch(changeSearchScope(scope));
  },
});

export default connect(stateToProps, dispatchToProps)(
  SearchScopeSelectContainer
);
