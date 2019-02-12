import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ArxivEprint from './ArxivEprint';
import InlineList from '../../common/components/InlineList';

class ArxivEprintList extends Component {
  render() {
    const { eprints, wrapperClassName } = this.props;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        label="e-Print"
        items={eprints}
        extractKey={eprint => eprint.get('value')}
        renderItem={eprint => <ArxivEprint eprint={eprint} />}
      />
    );
  }
}

ArxivEprintList.propTypes = {
  eprints: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

ArxivEprintList.defaultProps = {
  eprints: null,
  wrapperClassName: null,
};

export default ArxivEprintList;
