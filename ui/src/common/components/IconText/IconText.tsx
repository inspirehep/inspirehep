import React, { Component } from 'react';

import './IconText.scss';

type Props = {
    icon: React.ReactNode;
    text: React.ReactNode;
};

class IconText extends Component<Props> {

  render() {
    const { icon, text } = this.props;
    return (
      <span className="__IconText__">
        <span className="icon">{icon}</span>
        <span className="v-top">{text}</span>
      </span>
    );
  }
}

export default IconText;
