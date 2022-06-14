import React from 'react';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../../common/components/ExternalLink.tsx';

type Props = {
    name: string;
    href: string;
    src: string;
};

function CollaborationLogo({ href, name, src }: Props) {
  return (
    <ExternalLink href={href}>
      <img height={60} src={src} alt={name} />
    </ExternalLink>
  );
}

export default CollaborationLogo;
