import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Drawer } from 'antd';

class DrawerHandle extends Component {
  constructor(props) {
    super(props);

    this.onDrawerHandleClick = this.onDrawerHandleClick.bind(this);
    this.onDrawerClose = this.onDrawerClose.bind(this);

    this.state = {
      isDrawerVisible: false,
    };
  }

  onDrawerHandleClick() {
    this.setState({ isDrawerVisible: true });
  }

  onDrawerClose() {
    this.setState({ isDrawerVisible: false });
  }

  render() {
    const { children, drawerTitle, width, handleText, className } = this.props;
    const { isDrawerVisible } = this.state;
    return (
      <>
        <Button className={className} onClick={this.onDrawerHandleClick}>
          {handleText}
        </Button>
        <Drawer
          title={drawerTitle}
          placement="left"
          width={width}
          visible={isDrawerVisible}
          onClose={this.onDrawerClose}
        >
          {children}
        </Drawer>
      </>
    );
  }
}

DrawerHandle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  drawerTitle: PropTypes.string.isRequired,
  handleText: PropTypes.string,
  width: PropTypes.number,
};

DrawerHandle.defaultProps = {
  width: 304,
  handleText: 'Open',
  className: '',
};

export default DrawerHandle;
