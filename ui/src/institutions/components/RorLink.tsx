import React from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

type Props = {
    ror: string;
};

function RorLink({ ror }: Props) {
  return (
    <span>
      ROR Record: <ExternalLink href={ror}>{ror}</ExternalLink>
    </span>
  );
}

export default RorLink;
