import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import Latex from '../../common/components/Latex';

class Abstract extends Component {
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

Abstract.propTypes = {
  abstract: PropTypes.instanceOf(Map),
};

Abstract.defaultProps = {
  abstract: null,
};

export default Abstract;
