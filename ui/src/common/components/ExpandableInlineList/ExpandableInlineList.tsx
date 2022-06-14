import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InlineList from '../InlineList';
import ExpandListToggle from '../ExpandListToggle';

class ExpandableInlineList extends Component {
  constructor(props: any) {
    super(props);
    this.onExpandToggle = this.onExpandToggle.bind(this);

    this.state = {
      expanded: false,
    };
  }

  onExpandToggle() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'expanded' does not exist on type 'Readon... Remove this comment to see the full error message
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'expanded' does not exist on type 'Readon... Remove this comment to see the full error message
    const { expanded } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'limit' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { limit, items, ...listProps } = this.props;

    if (!items) {
      return null;
    }

    const maybeLimitedItem = expanded ? items : items.take(limit);
    return (
      <div>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <InlineList items={maybeLimitedItem} {...listProps} />
        <ExpandListToggle
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          limit={limit}
          size={items.size}
          expanded={expanded}
          onToggle={this.onExpandToggle}
        />
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExpandableInlineList.propTypes = {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
  ...InlineList.propTypes,
  limit: PropTypes.number,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ExpandableInlineList.defaultProps = {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
  ...InlineList.defaultProps,
  limit: 10,
};

export default ExpandableInlineList;
