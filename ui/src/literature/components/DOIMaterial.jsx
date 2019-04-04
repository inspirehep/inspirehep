import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DOIMaterial extends Component {
  render() {
    const { material } = this.props;
    return material && <span> ({material})</span>;
  }
}

DOIMaterial.propTypes = {
  material: PropTypes.string,
};

DOIMaterial.defaultProps = {
  material: null,
};

export default DOIMaterial;
