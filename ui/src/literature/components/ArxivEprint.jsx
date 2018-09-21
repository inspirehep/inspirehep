import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import ArxivEprintLink from './ArxivEprintLink';

class ArxivEprint extends Component {
  render() {
    const { eprint } = this.props;
    return (
      <span>
        <ArxivEprintLink>{eprint.get('value')}</ArxivEprintLink>
        {eprint.has('categories') && (
          <span>[{eprint.getIn(['categories', 0])}]</span>
        )}
      </span>
    );
  }
}

ArxivEprint.propTypes = {
  eprint: PropTypes.instanceOf(Map).isRequired,
};

export default ArxivEprint;
