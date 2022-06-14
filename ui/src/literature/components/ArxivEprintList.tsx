import React, { Component } from 'react';
import { List } from 'immutable';

import ArxivEprint from './ArxivEprint';
import InlineList from '../../common/components/InlineList';

type OwnProps = {
    eprints?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ArxivEprintList.defaultProps;

class ArxivEprintList extends Component<Props> {

static defaultProps = {
    eprints: null,
};

  render() {
    const { eprints } = this.props;
    return (
      <InlineList
        label="e-Print"
        items={eprints}
        extractKey={(eprint: $TSFixMe) => eprint.get('value')}
        renderItem={(eprint: $TSFixMe) => <ArxivEprint eprint={eprint} />}
      />
    );
  }
}

export default ArxivEprintList;
