import React, {
  ComponentPropsWithoutRef,
  FunctionComponent,
  createElement,
} from 'react';

interface AnchorElement {
  as: 'a' | 'button' | FunctionComponent;
}

type LinkWithTargetBlankProps = ComponentPropsWithoutRef<'a'> & AnchorElement;

function LinkWithTargetBlank({ as, ...anchorProps }: LinkWithTargetBlankProps) {
  const externalLinkProps = {
    ...anchorProps,
    target: '_blank',
    rel: 'noopener',
  };

  return createElement(as, externalLinkProps);
}

LinkWithTargetBlank.defaultProps = {
  as: 'a',
};

export default LinkWithTargetBlank;
