import React, { Component } from 'react';

import InlineList from '../InlineList';
import ExpandListToggle from '../ExpandListToggle';

/*
(ts-migrate) TODO: Migrate the remaining prop types
...InlineList.propTypes
*/
type OwnProps = {
    limit?: number;
};

type State = $TSFixMe;

type Props = OwnProps & typeof ExpandableInlineList.defaultProps;

class ExpandableInlineList extends Component<Props, State> {

static defaultProps = {
    ...InlineList.defaultProps,
    limit: 10,
};

  constructor(props: Props) {
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

export default ExpandableInlineList;
