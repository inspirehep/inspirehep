import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import DOILink from './DOILink';
import InlineList from '../../common/components/InlineList';

class DOIList extends Component {
  render() {
    const { dois } = this.props;
    return (
      <InlineList
        label="DOI"
        items={dois}
        renderItem={doi => (
          <DOILink>{doi.get('value')}</DOILink>
        )}
      />
    );
  }
}

DOIList.propTypes = {
  dois: PropTypes.instanceOf(List),
};

DOIList.defaultProps = {
  dois: null,
};

export default DOIList;
