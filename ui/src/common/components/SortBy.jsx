import React from 'react';

import SelectBox from './SelectBox';

const SortBy = ({ sort, onSortChange, sortOptions }) =>
  sortOptions && (
    <SelectBox
      data-testid="sort-by-select"
      onChange={onSortChange}
      defaultValue={sort}
      options={sortOptions}
    />
  );

SortBy.defaultProps = {
  sortOptions: null,
};
export default SortBy;
