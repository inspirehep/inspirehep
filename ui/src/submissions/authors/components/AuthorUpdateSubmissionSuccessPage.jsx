import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { AUTHORS } from '../../../common/routes';

function AuthorUpdateSubmissionSuccessPage({ match }) {
  const { id } = match.params;
  return (
    <SubmissionSuccess
      message={
        <span>
          Successfully submitted, thank you! See the author profile{' '}
          <Link to={`${AUTHORS}/${id}`}>here</Link>. All proposed updates are
          reviewed by INSPIRE and further updates might be necessary to ensure
          the best performance of the INSPIRE database.
        </span>
      }
    />
  );
}

AuthorUpdateSubmissionSuccessPage.propTypes = {
  match: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AuthorUpdateSubmissionSuccessPage;
