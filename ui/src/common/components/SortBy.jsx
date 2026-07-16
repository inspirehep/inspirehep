import SelectBox from './SelectBox';

const SortBy = ({ sort, onSortChange, sortOptions = null }) =>
  sortOptions && (
    <SelectBox
      data-testid="sort-by-select"
      onChange={onSortChange}
      defaultValue={sort}
      options={sortOptions}
    />
  );

export default SortBy;
