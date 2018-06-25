import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ExpandableInlineList.scss';
import InlineList from '../InlineList';

class ExpandableInlineList extends Component {
  constructor(props) {
    super(props);
    this.onExpandToggle = this.onExpandToggle.bind(this);

    this.state = {
      expanded: false,
    };
  }

  onExpandToggle() {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  }

  renderExpandToggle() {
    const { expanded } = this.state;
    const { items } = this.props;
    const buttonText = expanded ? 'Hide' : `Show all (${items.size})`;
    return (
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
      <a className="toggle" onClick={this.onExpandToggle}>
        {buttonText}
      </a>
    );
  }

  render() {
    const { expanded } = this.state;
    const { limit, items, ...listProps } = this.props;
    if (!items) {
      return null;
    }

    const maybeLimitedItem = expanded ? items : items.take(limit);
    return (
      <div className="__ExpandableInlineList__">
        <InlineList items={maybeLimitedItem} {...listProps} />
        {items.size > limit && this.renderExpandToggle()}
      </div>
    );
  }
}

ExpandableInlineList.propTypes = {
  ...InlineList.propTypes,
  limit: PropTypes.number,
};

ExpandableInlineList.defaultProps = {
  ...InlineList.defaultProps,
  limit: 10,
};

export default ExpandableInlineList;
