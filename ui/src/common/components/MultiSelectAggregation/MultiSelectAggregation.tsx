import React, { Component } from 'react';
import { List } from 'immutable';

import './MultiSelectAggregation.scss';
import SelectBox from '../SelectBox';
import { SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG } from './constants';

type OwnProps = {
    name: string;
    onChange: $TSFixMeFunction;
    buckets: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    selections?: string[] | string;
};

type Props = OwnProps & typeof MultiSelectAggregation.defaultProps;

class MultiSelectAggregation extends Component<Props> {

static defaultProps: $TSFixMe;

  getSelectOptionDisplayForBucket(bucket: $TSFixMe) {
    const { name } = this.props;
    const value = bucket.get('key');
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const selectValueToDisplay = SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG[name];
    return selectValueToDisplay && selectValueToDisplay[value];
  }

  render() {
    const { onChange, buckets, selections, name } = this.props;
    // TODO: optimize by running this only when `buckets` changed
    const selectOptions = buckets
      .map((bucket: $TSFixMe) => ({
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

MultiSelectAggregation.defaultProps = {
  selections: undefined,
};

export default MultiSelectAggregation;
