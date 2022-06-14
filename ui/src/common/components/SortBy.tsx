import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectBox from './SelectBox';
import { SelectOptionsPropType } from '../propTypes';

class SortBy extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { sort, onSortChange, sortOptions } = this.props;
    return (
      sortOptions && (
        <SelectBox
          data-test-id="sort-by-select"
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ "data-test-id": string; onChange: any; def... Remove this comment to see the full error message
          onChange={onSortChange}
          defaultValue={sort}
          options={sortOptions}
        />
      )
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SortBy.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  sortOptions: SelectOptionsPropType,
  sort: PropTypes.string.isRequired,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SortBy.defaultProps = {
  sortOptions: null,
};
export default SortBy;
