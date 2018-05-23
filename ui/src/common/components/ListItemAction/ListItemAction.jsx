import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import IconText from '../IconText';
import './ListItemAction.scss';

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

  render() {
    const {
      iconType, text, link, onClick,
    } = this.props;

    return (
      <Button
        className="__ListItemAction__"
        href={link && link.href}
        target={link && link.target}
        onClick={onClick}
      >
        {this.wrapWithRouterLinkIfToPropSet(<IconText text={text} type={iconType} />)}
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
    PropTypes.shape({ href: PropTypes.string.isRequired, target: PropTypes.string }),
  ]),
  onClick: PropTypes.func,
};

ListItemAction.defaultProps = {
  onClick: undefined,
  link: undefined,
};

export default ListItemAction;
