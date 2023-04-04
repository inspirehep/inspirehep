import React from 'react';

import SelectBox from './SelectBox';

const SortBy = ({
  sort,
  onSortChange,
  sortOptions,
}: {
  sort: string;
  onSortChange: Function;
  sortOptions: { display: string; value: string }[];
}) =>
  sortOptions && (
    <SelectBox
      testid="sort-by-select"
      onChange={onSortChange}
      defaultValue={sort}
      options={sortOptions}
    />
  );

SortBy.defaultProps = {
  sortOptions: null,
};
export default SortBy;
