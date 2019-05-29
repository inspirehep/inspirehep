import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class RegionsList extends Component {
  render() {
    const { regions } = this.props;
    return <InlineList items={regions} />;
  }
}

RegionsList.propTypes = {
  regions: PropTypes.instanceOf(List),
};

RegionsList.defaultProps = {
  regions: null,
};

export default RegionsList;
