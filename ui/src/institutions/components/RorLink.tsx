import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

function RorLink({
  ror
}: any) {
  return (
    <span>
      ROR Record: <ExternalLink href={ror}>{ror}</ExternalLink>
    </span>
  );
}

RorLink.propTypes = {
  ror: PropTypes.string.isRequired,
};

export default RorLink;
