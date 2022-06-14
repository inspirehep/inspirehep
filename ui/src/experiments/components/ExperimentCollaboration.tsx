import React from 'react';
import { Map } from 'immutable';

import CollaborationLink from '../../common/components/CollaborationLink';

type Props = {
    collaboration: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function ExperimentCollaboration({ collaboration }: Props) {
  return (
    <span>
      <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
      {' Collaboration'}
    </span>
  );
}

export default ExperimentCollaboration;
