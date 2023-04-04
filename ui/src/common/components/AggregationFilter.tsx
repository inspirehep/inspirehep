import React, { ComponentPropsWithoutRef } from 'react';
import { List } from 'immutable';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';
import MultiSelectAggregation from './MultiSelectAggregation';
import TreeAggregation from './TreeAggregation';

type AggregationFilterType = 'range' | 'checkbox' | 'multiselect' | 'tree';

export interface AggregationFilterProps extends ComponentPropsWithoutRef<any> {
  aggregationType?: AggregationFilterType;
  onChange: Function;
  buckets: List<any>;
  name: string;
  selections: string;
  splitTreeBy: string;
  initialBuckets: List<any>,
};

const AggregationFilter = ({
  aggregationType,
  ...aggregationProps
}: AggregationFilterProps) => {
  switch (aggregationType) {
    case 'range':
      return <RangeAggregation {...aggregationProps} />;
    case 'multiselect':
      return <MultiSelectAggregation {...aggregationProps} />;
    case 'tree':
      return <TreeAggregation {...aggregationProps} />;
    case 'checkbox':
    default:
      return <CheckboxAggregation {...aggregationProps} />;
  }
};

export default AggregationFilter;
