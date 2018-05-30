import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    } = this.props;
    const listClassName = separateItems ? SEPARATE_ITEMS_CLASS : null;
    return (
      items && (
        <div className="__InlineList__">
          {label && <span>{label}: </span>}
          <ul className={listClassName}>
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
  items: PropTypes.instanceOf(List),
  renderItem: PropTypes.func.isRequired,
  extractKey: PropTypes.func,
  suffix: PropTypes.node,
  label: PropTypes.string,
  separateItems: PropTypes.bool,
};

InlineList.defaultProps = {
  label: null,
  items: null,
  suffix: null,
  extractKey: item => item,
  separateItems: true,
};

export default InlineList;
