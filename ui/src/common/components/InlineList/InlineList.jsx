import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { List } from 'immutable';

import { getSizeOfArrayOrImmutableList } from '../../utils';
import './InlineList.scss';
import { SEPARATOR_TYPES, DEFAULT_SEPARATOR_TYPE } from './constants';

class InlineList extends Component {
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
    return (
      items &&
      getSizeOfArrayOrImmutableList(items) > 0 && (
        <div className={classnames('__InlineList__', wrapperClassName)}>
          {label && (
            <span className={classnames(labelClassName)}>{label}: </span>
          )}
          <ul>
            {items.map((item, index) => (
              <li key={extractKey(item)}>
                {renderItem(item)}
                {separateItems && index < items.size - 1 && separator}
              </li>
            ))}
          </ul>
          {suffix}
        </div>
      )
    );
  }
}

InlineList.propTypes = {
  extractKey: PropTypes.func,
  items: PropTypes.oneOfType([PropTypes.instanceOf(List), PropTypes.array]),
  label: PropTypes.string,
  renderItem: PropTypes.func,
  separateItems: PropTypes.bool,
  separator: PropTypes.oneOf(SEPARATOR_TYPES),
  suffix: PropTypes.node,
  wrapperClassName: PropTypes.string,
  labelClassName: PropTypes.string,
};

InlineList.defaultProps = {
  extractKey: item => item,
  renderItem: item => item,
  items: null,
  label: null,
  separateItems: true,
  separator: DEFAULT_SEPARATOR_TYPE,
  suffix: null,
  wrapperClassName: null,
};

export default InlineList;
