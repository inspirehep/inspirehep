import React from 'react';
import PropTypes from 'prop-types';

function ExternalLink({ as, ...linkProps }) {
  const externalLinkProps = {
    ...linkProps,
    target: '_blank',
    rel: 'noopener',
  };
  return React.createElement(as, externalLinkProps);
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  as: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};

ExternalLink.defaultProps = {
  as: 'a',
};

export default ExternalLink;
