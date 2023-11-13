import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { ActionCreator, Action } from 'redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { object } from 'yup';

import { submit } from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import uniqueOrcid from '../schemas/uniqueOrcid';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import SubmissionPage from '../../common/components/SubmissionPage';
import { AUTHORS } from '../../../common/routes';

const extraSchemaForNewAuthor = object().shape({ orcid: uniqueOrcid() });

const AuthorSubmissionPage = ({
  dispatch,
  error,
  query,
}: {
  dispatch: ActionCreator<Action<any>>;
  error: Map<string, any>;
  query: any;
}) => {
  const { bai } = query;
  const initialFormData = { bai };

  const onSubmit = async (formData: any) => {
    await dispatch(submit(AUTHORS_PID_TYPE, formData));
  };

  return (
    <SubmissionPage
      title="Suggest author"
      description={
        <span>
          This form allows you to create the profile of a new author. It will be
          added to the <Link to={AUTHORS}>authors collection</Link> upon
          approval.
        </span>
      }
    >
      <AuthorSubmission
        error={error}
        onSubmit={onSubmit}
        initialFormData={initialFormData}
        extendSchema={extraSchemaForNewAuthor}
      />
    </SubmissionPage>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('submitError'),
  query: state.router.location.query,
});

export default connect(mapStateToProps)(AuthorSubmissionPage);
