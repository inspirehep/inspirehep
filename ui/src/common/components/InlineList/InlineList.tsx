import React, { Component } from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';
import { List } from 'immutable';

import { getSizeOfArrayOrImmutableList } from '../../utils';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

// TODO: rename to `InlineDataList` then rename `InlineUL` to `InlineList`
class InlineList extends Component {
  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'items' does not exist on type 'Readonly<... Remove this comment to see the full error message
      items,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderItem' does not exist on type 'Read... Remove this comment to see the full error message
      renderItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
      label,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'suffix' does not exist on type 'Readonly... Remove this comment to see the full error message
      suffix,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'extractKey' does not exist on type 'Read... Remove this comment to see the full error message
      extractKey,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'separateItems' does not exist on type 'R... Remove this comment to see the full error message
      separateItems,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'separator' does not exist on type 'Reado... Remove this comment to see the full error message
      separator,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'wrapperClassName' does not exist on type... Remove this comment to see the full error message
      wrapperClassName,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'labelClassName' does not exist on type '... Remove this comment to see the full error message
      labelClassName,
    } = this.props;
    return items &&
    getSizeOfArrayOrImmutableList(items) > 0 && (
      <div className={classnames('__InlineList__', wrapperClassName)}>
        {label && (
          <span className={classnames(labelClassName)}>{label}: </span>
        )}
        <ul>
          {items.map((item: any, index: any) => (
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
InlineList.propTypes = {
  extractKey: PropTypes.func,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  items: PropTypes.oneOfType([PropTypes.instanceOf(List), PropTypes.array]),
  label: PropTypes.string,
  renderItem: PropTypes.func,
  separateItems: PropTypes.bool,
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
  suffix: PropTypes.node,
  wrapperClassName: PropTypes.string,
  labelClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
InlineList.defaultProps = {
  extractKey: (item: any) => item,
  renderItem: (item: any) => item,
  items: null,
  label: null,
  separateItems: true,
  separator: DEFAULT_SEPARATOR_TYPE,
  suffix: null,
  wrapperClassName: null,
};

export default InlineList;
