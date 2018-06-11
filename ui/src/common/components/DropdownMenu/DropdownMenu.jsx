import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Icon } from 'antd';

class DropdownMenu extends Component {
  static renderLink(link) {
    if (link.to) {
      return <Link to={link.to}>{link.display}</Link>;
    }
    return (
      <a target={link.target} href={link.href}>
        {link.display}
      </a>
    );
  }

  renderMenu() {
    const { links } = this.props;
    return (
      <Menu>
        {links.map(link => (
          <Menu.Item key={link.to || link.href}>
            {DropdownMenu.renderLink(link)}
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
  links: PropTypes.arrayOf(
    PropTypes.shape({
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
