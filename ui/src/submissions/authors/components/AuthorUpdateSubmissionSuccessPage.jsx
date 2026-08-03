import { Link, useParams } from 'react-router-dom';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { AUTHORS } from '../../../common/routes';

function AuthorUpdateSubmissionSuccessPage() {
  const { id } = useParams();
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
      testId="author-update-submission-success-page"
    />
  );
}

export default AuthorUpdateSubmissionSuccessPage;
