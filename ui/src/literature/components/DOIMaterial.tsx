import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DOIMaterial extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'material' does not exist on type 'Readon... Remove this comment to see the full error message
    const { material } = this.props;
    return material && <span> ({material})</span>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DOIMaterial.propTypes = {
  material: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
DOIMaterial.defaultProps = {
  material: null,
};

export default DOIMaterial;
