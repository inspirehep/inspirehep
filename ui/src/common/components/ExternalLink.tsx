import {
  ComponentPropsWithoutRef,
  FunctionComponent,
  createElement,
} from 'react';

interface AnchorElement {
  as?: 'a' | 'button' | FunctionComponent;
}

type ExternalLinkProps = ComponentPropsWithoutRef<'a'> & AnchorElement;

function ExternalLink({ as = 'a', ...anchorProps }: ExternalLinkProps) {
  const externalLinkProps = {
    ...anchorProps,
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  return createElement(as, externalLinkProps);
}

export default ExternalLink;
