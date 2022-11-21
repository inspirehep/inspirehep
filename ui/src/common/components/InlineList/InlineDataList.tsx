import React from 'react';
import classnames from 'classnames';
import { List } from 'immutable';

import './InlineList.less';
import { getSizeOfArrayOrImmutableList } from '../../utils';
import { DEFAULT_SEPARATOR_TYPE } from './constants';

const InlineDataList = ({
  items,
  renderItem,
  label,
  suffix,
  extractKey,
  separateItems,
  separator,
  wrapperClassName,
  labelClassName,
}: {
  items: List<any>;
  renderItem: Function;
  label: string;
  suffix: any;
  extractKey: Function;
  separateItems: boolean;
  separator: string;
  wrapperClassName: string;
  labelClassName?: string;
}) => {
  return (
    items &&
    getSizeOfArrayOrImmutableList(items) > 0 ? (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        {label && <span className={classnames(labelClassName)}>{label}: </span>}
        <ul>
          {items.map((item, index) => (
            <li key={`${extractKey(item)}-${index * 2}`}>
              {renderItem(item, index)}
              {separateItems && index < items.size - 1 && separator}
            </li>
          ))}
        </ul>
        {suffix}
      </div>
    ) : <></>
  );
};

InlineDataList.defaultProps = {
  extractKey: (item: any) => item,
  renderItem: (item: any) => item,
  items: null,
  label: null,
  separateItems: true,
  separator: DEFAULT_SEPARATOR_TYPE,
  suffix: null,
  wrapperClassName: null,
};

export default InlineDataList;
