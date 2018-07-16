import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { List } from 'immutable';

import './InlineList.scss';

const DEFAULT_SEPARATE_ITEMS_CLASS = 'separate-items-with-semicolon';

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
    } = this.props;
    return (
      items && (
        <div className={classnames('__InlineList__', wrapperClassName)}>
          {label && <span>{label}: </span>}
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
  renderItem: PropTypes.func.isRequired,
  separateItems: PropTypes.bool,
  separateItemsClassName: PropTypes.string,
  suffix: PropTypes.node,
  wrapperClassName: PropTypes.string,
};

InlineList.defaultProps = {
  extractKey: item => item,
  items: null,
  label: null,
  separateItems: true,
  separateItemsClassName: DEFAULT_SEPARATE_ITEMS_CLASS,
  suffix: null,
  wrapperClassName: null,
};

export default InlineList;
