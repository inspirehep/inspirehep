import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ArxivEprint from './ArxivEprint';
import InlineList from '../../common/components/InlineList';

class ArxivEprintList extends Component {
  render() {
    const { eprints } = this.props;
    return (
      <InlineList
        label="e-Prints"
        items={eprints}
        extractKey={eprint => eprint.get('value')}
        renderItem={eprint => (
          <ArxivEprint eprint={eprint} />
        )}
      />
    );
  }
}

ArxivEprintList.propTypes = {
  eprints: PropTypes.instanceOf(List),
};

ArxivEprintList.defaultProps = {
  eprints: null,
};

export default ArxivEprintList;
