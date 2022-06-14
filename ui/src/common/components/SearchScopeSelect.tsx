import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';
import { SEARCH_BOX_NAMESPACES } from '../../search/constants';

const SCOPE_OPTIONS = SEARCH_BOX_NAMESPACES.map(value => ({ value }));

class SearchScopeSelect extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchScopeName' does not exist on type ... Remove this comment to see the full error message
    const { searchScopeName, onSearchScopeChange } = this.props;
    return (
      <SelectBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ dropdownClassName: string; onChange: any; ... Remove this comment to see the full error message
        dropdownClassName="header-dropdown"
        onChange={onSearchScopeChange}
        value={searchScopeName}
        options={SCOPE_OPTIONS}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchScopeSelect.propTypes = {
  onSearchScopeChange: PropTypes.func.isRequired,
  searchScopeName: PropTypes.string.isRequired,
};

export default SearchScopeSelect;
