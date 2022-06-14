import React from 'react';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';

type Props = {
    collaboration: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function ExperimentCollaborationArticlesLink({ collaboration }: Props) {
  return (
    <Link to={`${LITERATURE}?q=collaboration:${collaboration.get('value')}`}>
      Collaboration articles
    </Link>
  );
}

export default ExperimentCollaborationArticlesLink;
