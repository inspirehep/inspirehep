import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';
import { SEARCH_BOX_NAMESPACES } from '../../search/constants';

const SCOPE_OPTIONS = SEARCH_BOX_NAMESPACES.map(value => ({ value }));

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
