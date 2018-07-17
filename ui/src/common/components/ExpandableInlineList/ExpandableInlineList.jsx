import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InlineList from '../InlineList';
import SecondaryButton from '../SecondaryButton';

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
      <SecondaryButton onClick={this.onExpandToggle}>
        {buttonText}
      </SecondaryButton>
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
      <div>
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
