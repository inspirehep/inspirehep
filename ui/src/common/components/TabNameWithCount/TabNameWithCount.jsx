import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import EventTracker from '../../containers/EventTracker';

class TabNameWithCount extends Component {
  render() {
    const { name, loading, count } = this.props;
    return (
      <EventTracker eventId={`${name}-Tab`}>
        <span>
          <span>{name}</span>
          <span className="ml1">
            {loading ? (
              <Icon className="ml1" type="loading" spin />
            ) : (
              count != null && <span>({count})</span>
            )}
          </span>
        </span>
      </EventTracker>
    );
  }
}

TabNameWithCount.propTypes = {
  name: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  count: PropTypes.number,
};

TabNameWithCount.defaultProps = {
  count: null,
  loading: false,
};

export default TabNameWithCount;
