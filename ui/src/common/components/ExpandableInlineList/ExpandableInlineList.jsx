import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InlineList from '../InlineList';
import ExpandListToggle from '../ExpandListToggle';

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
        <ExpandListToggle
          limit={limit}
          size={items.size}
          expanded={expanded}
          onToggle={this.onExpandToggle}
        />
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
