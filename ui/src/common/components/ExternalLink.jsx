import React from 'react';
import PropTypes from 'prop-types';

function ExternalLink(props) {
  const { children, href, ...otherProps } = props;
  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...otherProps}>
      {children}
    </a>
  );
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ExternalLink;
