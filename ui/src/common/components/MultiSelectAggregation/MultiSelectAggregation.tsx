import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import './MultiSelectAggregation.scss';
import SelectBox from '../SelectBox';
import { SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG } from './constants';

class MultiSelectAggregation extends Component {
  getSelectOptionDisplayForBucket(bucket: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { name } = this.props;
    const value = bucket.get('key');
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const selectValueToDisplay = SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG[name];
    return selectValueToDisplay && selectValueToDisplay[value];
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    const { onChange, buckets, selections, name } = this.props;
    // TODO: optimize by running this only when `buckets` changed
    const selectOptions = buckets
      .map((bucket: any) => ({
      value: bucket.get('key'),
      display: this.getSelectOptionDisplayForBucket(bucket)
    }))
      .toArray();
    return (
      <div className="__MultiSelectAggregation__">
        <SelectBox
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ className: string; mode: string; placehold... Remove this comment to see the full error message
          className="w-100"
          mode="multiple"
          placeholder={name}
          onChange={onChange}
          value={selections}
          options={selectOptions}
        />
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
MultiSelectAggregation.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  buckets: PropTypes.instanceOf(List).isRequired,
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
MultiSelectAggregation.defaultProps = {
  selections: undefined,
};

export default MultiSelectAggregation;
