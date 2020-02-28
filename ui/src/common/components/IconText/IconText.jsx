import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './IconText.scss';

class IconText extends Component {
  render() {
    const { icon, text } = this.props;
    return (
      <span className="__IconText__">
        <span className="icon">{icon}</span>
        {text}
      </span>
    );
  }
}

IconText.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

export default IconText;
