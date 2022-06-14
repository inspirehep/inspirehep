import React, { Component } from 'react';
import { Map } from 'immutable';

import Latex from '../../common/components/Latex';

type OwnProps = {
    abstract?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

type Props = OwnProps & typeof Abstract.defaultProps;

class Abstract extends Component<Props> {

static defaultProps = {
    abstract: null,
};

  renderSource() {
    const { abstract } = this.props;
    const source = abstract.get('source');
    return source && <span> ({source})</span>;
  }

  render() {
    const { abstract } = this.props;
    return (
      abstract && (
        <div>
          <div>Abstract:{this.renderSource()}</div>
          <Latex>{abstract.get('value')}</Latex>
        </div>
      )
    );
  }
}

export default Abstract;
