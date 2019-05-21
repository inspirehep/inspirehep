import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';
import { SelectOptionsPropType } from '../propTypes';

class SortBy extends Component {
  render() {
    const { sort, onSortChange, sortOptions } = this.props;
    return (
      sortOptions && (
        <SelectBox
          onChange={onSortChange}
          defaultValue={sort}
          options={sortOptions}
        />
      )
    );
  }
}

SortBy.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  sortOptions: SelectOptionsPropType,
  sort: PropTypes.string.isRequired,
};

SortBy.defaultProps = {
  sortOptions: null,
};
export default SortBy;
