import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { List } from 'immutable';

import { getSizeOfArrayOrImmutableList } from '../../utils';
import './InlineList.scss';
import {
  DEFAULT_SEPARATE_ITEMS_CLASS,
  SEPARATE_ITEMS_CLASSNAMES,
} from './constants';

class InlineList extends Component {
  render() {
    const {
      items,
      renderItem,
      label,
      suffix,
      extractKey,
      separateItems,
      separateItemsClassName,
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
          <ul
            className={classnames({ [separateItemsClassName]: separateItems })}
          >
            {items.map(item => (
              <li key={extractKey(item)}>{renderItem(item)}</li>
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
  // TODO: move the `sperate...` prefix to this component
  separateItemsClassName: PropTypes.oneOf(SEPARATE_ITEMS_CLASSNAMES),
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
  separateItemsClassName: DEFAULT_SEPARATE_ITEMS_CLASS,
  suffix: null,
  wrapperClassName: null,
};

export default InlineList;
