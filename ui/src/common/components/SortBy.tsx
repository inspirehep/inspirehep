import React, { Component } from 'react';

import SelectBox from './SelectBox';
import { SelectOptionsPropType } from '../propTypes';

type OwnProps = {
    onSortChange: $TSFixMeFunction;
    sortOptions?: SelectOptionsPropType;
    sort: string;
};

type Props = OwnProps & typeof SortBy.defaultProps;

class SortBy extends Component<Props> {

static defaultProps = {
    sortOptions: null,
};

  render() {
    const { sort, onSortChange, sortOptions } = this.props;
    return (
      sortOptions && (
        <SelectBox
          data-test-id="sort-by-select"
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ "data-test-id": string; onChange: never; d... Remove this comment to see the full error message
          onChange={onSortChange}
          defaultValue={sort}
          options={sortOptions}
        />
      )
    );
  }
}
export default SortBy;
