import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import IconText from '../IconText';
import './ListItemAction.scss';

class ListItemAction extends Component {
  render() {
    const {
      iconType, text, href, onClick, target,
    } = this.props;

    return (
      <Button
        className="__ListItemAction__"
        href={href}
        target={target}
        onClick={onClick}
      >
        <IconText text={text} type={iconType} />
      </Button>
    );
  }
}

ListItemAction.propTypes = {
  iconType: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
};

ListItemAction.defaultProps = {
  onClick: undefined,
  href: undefined,
  target: undefined,
};

export default ListItemAction;
