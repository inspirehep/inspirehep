import React from 'react';

import SelectBox from './SelectBox';
import { SEARCH_BOX_NAMESPACES } from '../../search/constants';

const SCOPE_OPTIONS = SEARCH_BOX_NAMESPACES.map((value) => ({ value }));

const SearchBoxNamespaceSelect = ({
  searchScopeName,
  onSearchScopeChange,
}: {
  searchScopeName: string;
  onSearchScopeChange: Function;
}) => (
  <SelectBox
    listHeight={400}
    popupClassName="header-dropdown"
    onChange={onSearchScopeChange}
    value={searchScopeName}
    options={SCOPE_OPTIONS}
  />
);

export default SearchBoxNamespaceSelect;
