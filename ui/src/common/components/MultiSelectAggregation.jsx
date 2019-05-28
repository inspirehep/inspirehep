import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import SelectBox from './SelectBox';

class MultiSelectAggregation extends Component {
  render() {
    const { onChange, buckets, selections, name } = this.props;
    // TODO: optimize by running this only when `buckets` changed
    const selectOptions = buckets
      .map(bucket => ({ value: bucket.get('key') }))
      .toArray();
    return (
      <div>
        <div className="mb1">{name}:</div>
        <SelectBox
          className="w-100"
          mode="multiple"
          placeholder="All"
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
  // eslint-disable-next-line react/no-unused-prop-types
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

MultiSelectAggregation.defaultProps = {
  selections: undefined,
};

export default MultiSelectAggregation;
