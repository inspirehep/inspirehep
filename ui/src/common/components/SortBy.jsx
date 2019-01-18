import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';

const SORT_BY_OPTIONS = [
  {
    display: 'Most Recent',
    value: 'mostrecent',
  },
  {
    display: 'Most Cited',
    value: 'mostcited',
  },
  {
    display: 'Best Match',
    value: 'bestmatch',
  },
];

class SortBy extends Component {
  render() {
    const { sort, onSortChange } = this.props;
    return (
      <SelectBox
        onChange={onSortChange}
        defaultValue={sort}
        options={SORT_BY_OPTIONS}
      />
    );
  }
}

SortBy.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  sort: PropTypes.string,
};

SortBy.defaultProps = {
  sort: SORT_BY_OPTIONS[0].value,
};

export default SortBy;
