import React from 'react';
import { Link } from 'react-router-dom';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { JOBS } from '../../../common/routes';

function JobUpdateSubmissionSuccessPage({ match }: { match: any }) {
  const { id } = match.params;

  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you for the submission! See the updates{' '}
          <Link to={`${JOBS}/${id}`} className="submission-link">
            here
          </Link>
          .
        </span>
      }
    />
  );
}

export default JobUpdateSubmissionSuccessPage;
