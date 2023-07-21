import React from 'react';
import { Link } from 'react-router-dom';

import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { JOBS } from '../../../common/routes';

function JobUpdateSubmissionSuccessPage(props: any) {
  const { match } = props;
  const { id } = match.params;
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you for the submission! See the updates{' '}
          <Link to={`${JOBS}/${id}`}>here</Link>.
        </span>
      }
    />
  );
}

export default JobUpdateSubmissionSuccessPage;
