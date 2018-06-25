import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { List } from 'immutable';

import './InlineList.scss';

const SEPARATE_ITEMS_CLASS = 'separate-items';

class InlineList extends Component {
  render() {
    const {
      items,
      renderItem,
      label,
      suffix,
      extractKey,
      separateItems,
      wrapperClassName,
    } = this.props;
    return (
      items && (
        <div className={classnames('__InlineList__', wrapperClassName)}>
          {label && <span>{label}: </span>}
          <ul className={classnames({ [SEPARATE_ITEMS_CLASS]: separateItems })}>
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
  items: PropTypes.oneOfType([PropTypes.instanceOf(List), PropTypes.array]),
  renderItem: PropTypes.func.isRequired,
  extractKey: PropTypes.func,
  suffix: PropTypes.node,
  label: PropTypes.string,
  separateItems: PropTypes.bool,
  wrapperClassName: PropTypes.string,
};

InlineList.defaultProps = {
  label: null,
  items: null,
  suffix: null,
  wrapperClassName: null,
  extractKey: item => item,
  separateItems: true,
};

export default InlineList;
