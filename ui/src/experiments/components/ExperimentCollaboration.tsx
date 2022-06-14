import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import CollaborationLink from '../../common/components/CollaborationLink';

function ExperimentCollaboration({
  collaboration
}: any) {
  return (
    <span>
      <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
      {' Collaboration'}
    </span>
  );
}

ExperimentCollaboration.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  collaboration: PropTypes.instanceOf(Map).isRequired,
};

export default ExperimentCollaboration;
