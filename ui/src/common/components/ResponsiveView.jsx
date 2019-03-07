import React from 'react';
import Media from 'react-media';
import PropTypes from 'prop-types';

const SIZE_TO_MAX_WIDTH = {
  xs: 575,
  sm: 767,
  md: 991,
  lg: 1199,
  xl: 1599,
};

const SIZE_TO_MIN_WIDTH = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

function ResponsiveView(props) {
  const { min, max, render } = props;
  const query = {};
  if (min) {
    query.minWidth = SIZE_TO_MIN_WIDTH[min];
  }

  if (max) {
    query.maxWidth = SIZE_TO_MAX_WIDTH[max];
  }

  return <Media query={query} render={render} />;
}

/* eslint-disable react/require-default-props */
ResponsiveView.propTypes = {
  min: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'xxl']),
  max: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  render: PropTypes.func.isRequired,
};

export default ResponsiveView;
