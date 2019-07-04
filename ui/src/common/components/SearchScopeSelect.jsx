import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';
import { searchScopes } from '../../reducers/search';

const SCOPE_OPTIONS = searchScopes
  .keySeq()
  .map(scope => ({ value: scope }))
  .toJS();

class SearchScopeSelect extends Component {
  render() {
    const { searchScopeName, onSearchScopeChange } = this.props;
    return (
      <SelectBox
        dropdownClassName="header-dropdown"
        onChange={onSearchScopeChange}
        value={searchScopeName}
        options={SCOPE_OPTIONS}
      />
    );
  }
}

SearchScopeSelect.propTypes = {
  onSearchScopeChange: PropTypes.func.isRequired,
  searchScopeName: PropTypes.string.isRequired,
};

export default SearchScopeSelect;
