import React, { Component } from 'react';

type OwnProps = {
    onClick: $TSFixMeFunction;
    dataTestId?: string;
};

type Props = OwnProps & typeof LinkLikeButton.defaultProps;

class LinkLikeButton extends Component<Props> {

static defaultProps: $TSFixMe;

  render() {
    const { children, onClick, dataTestId } = this.props;
    return (
      // TODO: use `<antd.Button type="link"` (as of now it has a problem with the style after button is clicked)
      /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
      <a data-test-id={dataTestId} onClick={onClick}>
        {children}
      </a>
    );
  }
}

LinkLikeButton.defaultProps = {
  dataTestId: undefined,
};

export default LinkLikeButton;
