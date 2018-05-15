import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ArxivEprintLink from './ArxivEprintLink';
import InlineList from '../../common/components/InlineList';

class ArxivEprintList extends Component {
  render() {
    const { eprints } = this.props;
    return (
      <InlineList
        label="e-Prints"
        items={eprints}
        renderItem={eprint => (
          <span>
            <ArxivEprintLink>
              {eprint.get('value')}
            </ArxivEprintLink>
            {eprint.has('categories') ? <span>[{eprint.getIn(['categories', 0])}]</span> : null}
          </span>
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
