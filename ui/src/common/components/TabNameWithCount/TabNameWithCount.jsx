import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import EventTracker from '../EventTracker';

class TabNameWithCount extends Component {
  render() {
    const { name, loading, count } = this.props;
    return (
      <EventTracker eventId={`${name}-Tab`}>
        <span>
          <span>{name}</span>
          <span className="ml1">
            {loading ? (
              <span data-test-id="loading">
                <Icon className="ml1" type="loading" spin />
              </span>
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
