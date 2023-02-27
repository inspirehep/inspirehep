import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './IconText.less';

class IconText extends Component {
  render() {
    const { icon, text, className } = this.props;
    return (
      <span className={classNames('__IconText__', className)}>
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
