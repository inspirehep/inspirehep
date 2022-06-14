import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';

function OrcidProfileLink({
  children,
  orcid,
  className
}: any) {
  return (
    <ExternalLink className={className} href={`//orcid.org/${orcid}`}>
      {children || orcid}
    </ExternalLink>
  );
}

OrcidProfileLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  orcid: PropTypes.string.isRequired,
};

export default OrcidProfileLink;
