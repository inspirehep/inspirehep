import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

class TabNameWithCount extends Component {
  render() {
    const { name, loading, count } = this.props;
    return (
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
