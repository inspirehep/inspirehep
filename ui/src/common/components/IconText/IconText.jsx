import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

import './IconText.scss';

class IconText extends Component {
  render() {
    const { type, text } = this.props;
    return (
      <span className="__IconText__">
        <Icon className="icon" type={type} />
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
