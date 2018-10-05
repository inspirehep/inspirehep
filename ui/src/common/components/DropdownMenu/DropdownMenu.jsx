import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Icon } from 'antd';

class DropdownMenu extends Component {
  static renderMenuItem(item) {
    if (item.to) {
      return <Link to={item.to}>{item.display}</Link>;
    }

    if (item.href) {
      return (
        <a target={item.target} href={item.href}>
          {item.display}
        </a>
      );
    }
    return item;
  }

  renderMenu() {
    const { items } = this.props;
    return (
      <Menu>
        {items.map(item => (
          // use key from react element if passed instead of object.
          <Menu.Item key={item.display || item.key}>
            {DropdownMenu.renderMenuItem(item)}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  render() {
    const { title, titleClassName, dataTestId } = this.props;
    return (
      <div>
        <Dropdown overlay={this.renderMenu()}>
          <span className={titleClassName} data-test-id={dataTestId}>
            {title} <Icon type="down" />
          </span>
        </Dropdown>
      </div>
    );
  }
}

DropdownMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        onClick: PropTypes.func,
        href: PropTypes.string,
        to: PropTypes.string,
        display: PropTypes.string.isRequired,
        target: PropTypes.string,
      }),
      PropTypes.node,
    ])
  ).isRequired,
  title: PropTypes.node.isRequired,
  titleClassName: PropTypes.string,
  dataTestId: PropTypes.string,
};

DropdownMenu.defaultProps = {
  titleClassName: undefined,
  dataTestId: undefined,
};

export default DropdownMenu;
