import React, { Component } from 'react';
import { Map } from 'immutable';

import ArxivEprintLink from './ArxivEprintLink';

type Props = {
    eprint: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class ArxivEprint extends Component<Props> {

  render() {
    const { eprint } = this.props;
    return (
      <span>
        <ArxivEprintLink>{eprint.get('value')}</ArxivEprintLink>
        {eprint.has('categories') && (
          <span> [{eprint.getIn(['categories', 0])}]</span>
        )}
      </span>
    );
  }
}

export default ArxivEprint;
