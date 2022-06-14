import React, { Component } from 'react';

import SelectBox from './SelectBox';
import { SEARCH_BOX_NAMESPACES } from '../../search/constants';

const SCOPE_OPTIONS = SEARCH_BOX_NAMESPACES.map(value => ({ value }));

type Props = {
    onSearchScopeChange: $TSFixMeFunction;
    searchScopeName: string;
};

class SearchScopeSelect extends Component<Props> {

  render() {
    const { searchScopeName, onSearchScopeChange } = this.props;
    return (
      <SelectBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ dropdownClassName: string; onChange: $TSFi... Remove this comment to see the full error message
        dropdownClassName="header-dropdown"
        onChange={onSearchScopeChange}
        value={searchScopeName}
        options={SCOPE_OPTIONS}
      />
    );
  }
}

export default SearchScopeSelect;
