import React, { Component } from 'react';

import LinkLikeButton from './LinkLikeButton';

type OwnProps = {
    onClick: $TSFixMeFunction;
};

type Props = OwnProps & typeof GoBackLink.defaultProps;

class GoBackLink extends Component<Props> {

static defaultProps = {
    children: 'go back',
};

  render() {
    const { children, onClick } = this.props;
    return <LinkLikeButton onClick={onClick}>{children}</LinkLikeButton>;
  }
}

export default GoBackLink;
