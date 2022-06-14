import React, { Component } from 'react';

import SecondaryButton from './SecondaryButton';

type OwnProps = {
    size: number;
    limit: number;
    onToggle: $TSFixMeFunction;
    expanded: boolean;
    expandLabel?: string;
};

type Props = OwnProps & typeof ExpandListToggle.defaultProps;

class ExpandListToggle extends Component<Props> {

static defaultProps = {
    expandLabel: 'Show all',
};

  render() {
    const { size, limit, onToggle, expanded, expandLabel } = this.props;

    if (size <= limit) {
      return null;
    }

    const buttonText = expanded ? 'Hide' : `${expandLabel} (${size})`;
    return <SecondaryButton onClick={onToggle}>{buttonText}</SecondaryButton>;
  }
}

export default ExpandListToggle;
