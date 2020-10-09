import React, { Component, ReactNode } from 'react';
import { Button, Drawer } from 'antd';

type DrawerHandleProps = typeof DrawerHandle.defaultProps & {
  children: ReactNode;
  drawerTitle: ReactNode;
};

interface DrawerHandleState {
  isDrawerVisible: boolean;
}

export default class DrawerHandle extends Component<
  DrawerHandleProps,
  DrawerHandleState
> {
  static defaultProps = {
    width: 304,
    handleText: 'Open',
    className: '',
  };

  state = {
    isDrawerVisible: false,
  };

  onDrawerHandleClick = () => {
    this.setState({ isDrawerVisible: true });
  };

  onDrawerClose = () => {
    this.setState({ isDrawerVisible: false });
  };

  render() {
    const { children, drawerTitle, width, handleText, className } = this.props;
    const { isDrawerVisible } = this.state;
    return (
      <>
        <Button
          data-test-id="handle-button"
          className={className}
          onClick={this.onDrawerHandleClick}
        >
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
