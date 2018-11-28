import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import IconText from '../IconText';
import './ListItemAction.scss';

const CLASS_NAME = '__ListItemAction__';

class ListItemAction extends Component {
  wrapWithRouterLinkIfToPropSet(component) {
    const { link } = this.props;
    if (link && link.to) {
      return (
        <Link className="no-transition" to={link.to}>
          {component}
        </Link>
      );
    }
    return component;
  }

  renderIconText() {
    const { text, iconType } = this.props;
    return <IconText text={text} type={iconType} />;
  }

  render() {
    const { link, onClick } = this.props;

    if (link && link.href) {
      return (
        <Button className={CLASS_NAME} href={link.href} target={link.target}>
          {this.renderIconText()}
        </Button>
      );
    }

    if (link && link.to) {
      return (
        <Button className={CLASS_NAME}>
          <Link className="no-transition" to={link.to}>
            {this.renderIconText()}
          </Link>
        </Button>
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
