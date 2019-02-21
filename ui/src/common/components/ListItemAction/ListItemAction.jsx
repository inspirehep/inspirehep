import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import IconText from '../IconText';
import './ListItemAction.scss';

const CLASS_NAME = '__ListItemAction__';

class ListItemAction extends Component {
  renderIconText() {
    const { text, iconType } = this.props;
    return <IconText text={text} type={iconType} />;
  }

  render() {
    const { link, onClick } = this.props;

    if (link && link.href) {
      return (
        // set onClick so that it can be tracked
        <Button
          className={CLASS_NAME}
          href={link.href}
          target={link.target}
          onClick={onClick}
        >
          {this.renderIconText()}
        </Button>
      );
    }

    if (link && link.to) {
      return (
        <Link
          className={`no-transition ant-btn ${CLASS_NAME}`}
          to={link.to}
          onClick={onClick}
        >
          {this.renderIconText()}
        </Link>
      );
    }

    return (
      <Button className={CLASS_NAME} onClick={onClick}>
        {this.renderIconText()}
      </Button>
    );
  }
}

ListItemAction.propTypes = {
  iconType: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  // set either `link` or `onClick`
  link: PropTypes.oneOfType([
    PropTypes.shape({ to: PropTypes.string.isRequired }),
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      target: PropTypes.string,
    }),
  ]),
  onClick: PropTypes.func,
};

ListItemAction.defaultProps = {
  onClick: undefined,
  link: undefined,
};

export default ListItemAction;
