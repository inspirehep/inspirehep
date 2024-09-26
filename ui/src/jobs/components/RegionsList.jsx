import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';

class RegionsList extends Component {
  render() {
    const { regions } = this.props;
    return <InlineDataList items={regions} />;
  }
}

RegionsList.propTypes = {
  regions: PropTypes.instanceOf(List),
};

RegionsList.defaultProps = {
  regions: null,
};

export default RegionsList;
