import React, { Component } from 'react';
import { Map } from 'immutable';

import Latex from './Latex';

type Props = {
    title: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class LiteratureTitle extends Component<Props> {

  render() {
    const { title } = this.props;
    return (
      <span>
        <Latex>{title.get('title')}</Latex>
        {title.has('subtitle') && (
          <span>
            <span> : </span>
            <Latex>{title.get('subtitle')}</Latex>
          </span>
        )}
      </span>
    );
  }
}

export default LiteratureTitle;
