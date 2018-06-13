import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Icon } from 'antd';

class DropdownMenu extends Component {
  static renderAnchorMenuItem(item) {
    if (item.href) {
      return (
        <a target={item.target} href={item.href}>
          {item.display}
        </a>
      );
    }
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <a onClick={item.onClick}>{item.display}</a>
    );
  }

  static renderMenuItem(item) {
    if (item.to) {
      return <Link to={item.to}>{item.display}</Link>;
    }
    return DropdownMenu.renderAnchorMenuItem(item);
  }

  renderMenu() {
    const { items } = this.props;
    return (
      <Menu>
        {items.map(item => (
          <Menu.Item key={item.display}>
            {DropdownMenu.renderMenuItem(item)}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  render() {
    const { title, titleClassName } = this.props;
    return (
      <div>
        <Dropdown overlay={this.renderMenu()}>
          <span className={titleClassName}>
            {title} <Icon type="down" />
          </span>
        </Dropdown>
      </div>
    );
  }
}

DropdownMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      onClick: PropTypes.func,
      href: PropTypes.string,
      to: PropTypes.string,
      display: PropTypes.string.isRequired,
      target: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.node.isRequired,
  titleClassName: PropTypes.string,
};

DropdownMenu.defaultProps = {
  titleClassName: undefined,
};

export default DropdownMenu;
