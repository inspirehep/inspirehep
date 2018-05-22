import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import './InlineList.scss';

class InlineList extends Component {
  render() {
    const {
      items, renderItem, label, suffix, extractKey,
    } = this.props;
    return items && (
      <div className="__InlineList__">
        {label && <span>{label}: </span>}
        <ul>
          {items.map(item => (
            <li key={extractKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
        {suffix}
      </div>
    );
  }
}

InlineList.propTypes = {
  items: PropTypes.instanceOf(List),
  renderItem: PropTypes.func.isRequired,
  extractKey: PropTypes.func,
  suffix: PropTypes.node,
  label: PropTypes.string,
};

InlineList.defaultProps = {
  label: null,
  items: null,
  suffix: null,
  extractKey: item => item,
};

export default InlineList;
