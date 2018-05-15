import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import './InlineList.css';

class InlineList extends Component {
  render() {
    const {
      items, renderItem, label, suffix,
    } = this.props;
    return items && (
      <div >
        {label && <span>{label}: </span>}
        <ul className="__InlineList__">
          {items.map(item => (
            // TODO: use proper key
            <li key={item} style={{ display: 'inline' }}>{renderItem(item)}</li>
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
  suffix: PropTypes.node,
  label: PropTypes.string,
};

InlineList.defaultProps = {
  label: null,
  items: null,
  suffix: null,
};

export default InlineList;
