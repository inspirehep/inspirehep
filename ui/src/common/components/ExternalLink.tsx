import React, { ComponentPropsWithoutRef, ElementType } from 'react';
import PropTypes from 'prop-types';

const defaultProps = {
  as: 'a',
};
type ExternalLinkProps = ComponentPropsWithoutRef<'a'> & typeof defaultProps;

function ExternalLink({ as, ...anchorProps }: ExternalLinkProps) {
  const externalLinkProps = {
    ...anchorProps,
    target: '_blank',
    rel: 'noopener',
  };
  return React.createElement(as, externalLinkProps);
}

ExternalLink.defaultProps = defaultProps;

export default ExternalLink;
