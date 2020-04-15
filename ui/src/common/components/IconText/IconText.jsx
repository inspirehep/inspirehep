import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './IconText.scss';

class IconText extends Component {
  render() {
    const { icon, text } = this.props;
    return (
      <span className="__IconText__">
        <span className="icon">{icon}</span>
        <span className="v-top">{text}</span>
      </span>
    );
  }
}

IconText.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.node.isRequired,
};

export default IconText;
