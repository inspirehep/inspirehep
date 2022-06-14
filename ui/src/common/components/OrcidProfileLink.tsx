import React from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';

type Props = {
    children?: React.ReactNode;
    className?: string;
    orcid: string;
};

function OrcidProfileLink({ children, orcid, className }: Props) {
  return (
    <ExternalLink className={className} href={`//orcid.org/${orcid}`}>
      {children || orcid}
    </ExternalLink>
  );
}

export default OrcidProfileLink;
