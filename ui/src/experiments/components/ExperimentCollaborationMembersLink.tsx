import React from 'react';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { AUTHORS } from '../../common/routes';

type Props = {
    recordId: number;
};

function ExperimentCollaborationMembersLink({ recordId }: Props) {
  return (
    <Link to={`${AUTHORS}?q=project_membership.record.$ref:${recordId}`}>
      Collaboration members
    </Link>
  );
}

export default ExperimentCollaborationMembersLink;
