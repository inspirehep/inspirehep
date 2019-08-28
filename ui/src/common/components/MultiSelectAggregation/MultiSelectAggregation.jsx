import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import './MultiSelectAggregation.scss';
import SelectBox from '../SelectBox';
import { SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG } from './constants';

class MultiSelectAggregation extends Component {
  getSelectOptionDisplayForBucket(bucket) {
    const { name } = this.props;
    const value = bucket.get('key');
    const selectValueToDisplay = SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG[name];
    return selectValueToDisplay && selectValueToDisplay[value];
  }

  render() {
    const { onChange, buckets, selections, name } = this.props;
    // TODO: optimize by running this only when `buckets` changed
    const selectOptions = buckets
      .map(bucket => ({
        value: bucket.get('key'),
        display: this.getSelectOptionDisplayForBucket(bucket),
      }))
      .toArray();
    return (
      <div className="__MultiSelectAggregation__">
        <SelectBox
          className="w-100"
          mode="multiple"
          placeholder={<span className="placeholder">{name}</span>}
          onChange={onChange}
          value={selections}
          options={selectOptions}
        />
      </div>
    );
  }
}

MultiSelectAggregation.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(List).isRequired,
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

MultiSelectAggregation.defaultProps = {
  selections: undefined,
};

export default MultiSelectAggregation;
