import React, { Component } from 'react';

import './SecondaryButton.scss';

type Props = {
    onClick: $TSFixMeFunction;
};

class SecondaryButton extends Component<Props> {

  render() {
    const { onClick, children } = this.props;
    return (
      <button type="button" className="__SecondaryButton__" onClick={onClick}>
        {children}
      </button>
    );
  }
}

export default SecondaryButton;
