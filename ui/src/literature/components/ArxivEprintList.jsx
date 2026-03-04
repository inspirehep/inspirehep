import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ArxivEprint from './ArxivEprint';
import InlineDataList from '../../common/components/InlineList';

class ArxivEprintList extends Component {
  render() {
    const { eprints, showLabel } = this.props;
    const label = showLabel ? 'e-Print' : null;
    return (
      <InlineDataList
        label={label}
        items={eprints}
        extractKey={(eprint) => eprint.get('value')}
        renderItem={(eprint) => <ArxivEprint eprint={eprint} />}
      />
    );
  }
}

ArxivEprintList.propTypes = {
  eprints: PropTypes.instanceOf(List),
  showLabel: PropTypes.bool,
};

ArxivEprintList.defaultProps = {
  eprints: null,
  showLabel: true,
};

export default ArxivEprintList;
