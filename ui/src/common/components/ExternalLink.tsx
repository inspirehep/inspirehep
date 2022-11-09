import React, {
  ComponentPropsWithoutRef,
  FunctionComponent,
  createElement,
} from 'react';

interface AnchorElement {
  as: 'a' | 'button' | FunctionComponent;
}

type ExternalLinkProps = ComponentPropsWithoutRef<'a'> & AnchorElement;

function ExternalLink({ as, ...anchorProps }: ExternalLinkProps) {
  const externalLinkProps = {
    ...anchorProps,
    target: '_blank',
    rel: 'noopener',
  };

  return createElement(as, externalLinkProps);
}

ExternalLink.defaultProps = {
  as: 'a',
};

export default ExternalLink;
