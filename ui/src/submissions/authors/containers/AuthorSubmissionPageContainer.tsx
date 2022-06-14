import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object } from 'yup';

import { submit } from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import uniqueOrcid from '../schemas/uniqueOrcid';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import SubmissionPage from '../../common/components/SubmissionPage';
import { AUTHORS } from '../../../common/routes';

const extraSchemaForNewAuthor = object().shape({ orcid: uniqueOrcid() });

type AuthorSubmissionPageProps = {
    dispatch: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    query: {
        [key: string]: $TSFixMe;
    };
};

class AuthorSubmissionPage extends Component<AuthorSubmissionPageProps> {

  constructor(props: AuthorSubmissionPageProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData: $TSFixMe) {
    const { dispatch } = this.props;
    await dispatch(submit(AUTHORS_PID_TYPE, formData));
  }

  render() {
    const { error, query } = this.props;
    const { bai } = query;
    const initialFormData = { bai };
    return (
      <SubmissionPage
        title="Suggest author"
        description={
          <span>
            This form allows you to create the profile of a new author. It will
            be added to the <Link to={AUTHORS}>authors collection</Link> upon
            approval.
          </span>
        }
      >
        <AuthorSubmission
          error={error}
          onSubmit={this.onSubmit}
          initialFormData={initialFormData}
          extendSchema={extraSchemaForNewAuthor}
        />
      </SubmissionPage>
    );
  }
}

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError'),
  query: state.router.location.query
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
