import React, { Component } from 'react';
import { Map } from 'immutable';
import PropTypes from 'prop-types';

import Latex from './Latex';

class LiteratureTitle extends Component {
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

LiteratureTitle.propTypes = {
  title: PropTypes.instanceOf(Map).isRequired,
};

export default LiteratureTitle;
