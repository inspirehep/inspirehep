import React from 'react';
import { List, Map } from 'immutable';

import './MultiSelectAggregation.less';
import SelectBox from '../SelectBox';
import { SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG } from './constants';

function MultiSelectAggregation({
  onChange,
  buckets,
  selections,
  name,
}: {
  onChange: Function;
  buckets: List<Map<string, any>>;
  selections: string | string[];
  name: string;
}) {
  function getSelectOptionDisplayForBucket(bucket: Map<string, any>) {
    const value = bucket.get('key');
    const selectValueToDisplay =
      SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG[
        name as keyof typeof SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG
      ];
    return (
      selectValueToDisplay &&
      selectValueToDisplay[value as keyof typeof selectValueToDisplay]
    );
  }

  const selectOptions = buckets
    .map((bucket: Map<string, any>) => ({
      value: bucket.get('key'),
      display: getSelectOptionDisplayForBucket(bucket),
    }))
    .toArray();
  return (
    <div className="__MultiSelectAggregation__">
      <SelectBox
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

MultiSelectAggregation.defaultProps = {
  selections: undefined,
};

export default MultiSelectAggregation;
