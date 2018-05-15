import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';


class IconText extends Component {
  render() {
    const { type, text } = this.props;
    return (
      <span>
        <Icon type={type} style={{ marginRight: 8, fontSize: 16 }} />
        {text}
      </span>
    );
  }
}

IconText.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default IconText;
