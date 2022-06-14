import React, { Component } from 'react';

type OwnProps = {
    material?: string;
};

type Props = OwnProps & typeof DOIMaterial.defaultProps;

class DOIMaterial extends Component<Props> {

static defaultProps = {
    material: null,
};

  render() {
    const { material } = this.props;
    return material && <span> ({material})</span>;
  }
}

export default DOIMaterial;
