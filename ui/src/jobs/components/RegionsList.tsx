import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

type OwnProps = {
    regions?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof RegionsList.defaultProps;

class RegionsList extends Component<Props> {

static defaultProps = {
    regions: null,
};

  render() {
    const { regions } = this.props;
    return <InlineList items={regions} />;
  }
}

export default RegionsList;
