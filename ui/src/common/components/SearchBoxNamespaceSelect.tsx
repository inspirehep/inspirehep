import React from 'react';

import SelectBox from './SelectBox';
import { DATA_NS, SEARCH_BOX_NAMESPACES } from '../../search/constants';

const SearchBoxNamespaceSelect = ({
  canAccessDataCollection,
  searchScopeName,
  onSearchScopeChange,
}: {
  canAccessDataCollection: boolean;
  searchScopeName: string;
  onSearchScopeChange: Function;
}) => {
  const filteredNamespaces = canAccessDataCollection
    ? SEARCH_BOX_NAMESPACES
    : SEARCH_BOX_NAMESPACES.filter((value) => value !== DATA_NS);
  const SCOPE_OPTIONS = filteredNamespaces.map((value) => ({ value }));

  return (
    <SelectBox
      popupClassName="header-dropdown"
      onChange={onSearchScopeChange}
      value={searchScopeName}
      options={SCOPE_OPTIONS}
    />
  );
};

export default SearchBoxNamespaceSelect;
