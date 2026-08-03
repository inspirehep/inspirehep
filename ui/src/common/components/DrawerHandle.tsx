import { Component, ReactNode } from 'react';
import { Button, Drawer } from 'antd';

type DrawerHandleProps = {
  children: ReactNode;
  drawerTitle: ReactNode;
  width?: number;
  handleText?: string;
  className?: string;
};

interface DrawerHandleState {
  isDrawerVisible: boolean;
}

export default class DrawerHandle extends Component<
  DrawerHandleProps,
  DrawerHandleState
> {
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
    const {
      children,
      drawerTitle,
      width = 304,
      handleText = 'Open',
      className = '',
    } = this.props;
    const { isDrawerVisible } = this.state;
    return (
      <>
        <Button
          data-testid="handle-button"
          className={className}
          onClick={this.onDrawerHandleClick}
        >
          {handleText}
        </Button>
        <Drawer
          title={drawerTitle}
          placement="left"
          width={width}
          open={isDrawerVisible}
          onClose={this.onDrawerClose}
        >
          {children}
        </Drawer>
      </>
    );
  }
}
