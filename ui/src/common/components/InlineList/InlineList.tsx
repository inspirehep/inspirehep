import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
import { List } from 'immutable';

import { getSizeOfArrayOrImmutableList } from '../../utils';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

type OwnProps = {
    extractKey?: $TSFixMeFunction;
    items?: $TSFixMe | $TSFixMe[];
    label?: string;
    renderItem?: $TSFixMeFunction;
    separateItems?: boolean;
    separator?: $TSFixMe; // TODO: PropTypes.oneOf(SEPARATOR_TYPES)
    suffix?: React.ReactNode;
    wrapperClassName?: string;
    labelClassName?: string;
};

type Props = OwnProps & typeof InlineList.defaultProps;

// TODO: rename to `InlineDataList` then rename `InlineUL` to `InlineList`
class InlineList extends Component<Props> {

static defaultProps: $TSFixMe;

  render() {
    const {
      items,
      renderItem,
      label,
      suffix,
      extractKey,
      separateItems,
      separator,
      wrapperClassName,
      labelClassName,
    } = this.props;
    return items &&
    getSizeOfArrayOrImmutableList(items) > 0 && (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        {label && (
          <span className={classnames(labelClassName)}>{label}: </span>
        )}
        <ul>
          {items.map((item: $TSFixMe, index: $TSFixMe) => (
            <li key={extractKey(item)}>
              {renderItem(item, index)}
              {separateItems && index < items.size - 1 && separator}
            </li>
          ))}
        </ul>
        {suffix}
      </div>
    );
  }
}

InlineList.defaultProps = {
  extractKey: (item: $TSFixMe) => item,
  renderItem: (item: $TSFixMe) => item,
  items: null,
  label: null,
  separateItems: true,
  separator: DEFAULT_SEPARATOR_TYPE,
  suffix: null,
  wrapperClassName: null,
};

export default InlineList;
