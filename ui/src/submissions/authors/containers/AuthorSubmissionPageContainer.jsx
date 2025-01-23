import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { object } from 'yup';

import { submit } from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import uniqueOrcid from '../schemas/uniqueOrcid';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import SubmissionPage from '../../common/components/SubmissionPage';
import { AUTHORS, SUBMISSIONS_AUTHOR } from '../../../common/routes';

const extraSchemaForNewAuthor = object().shape({ orcid: uniqueOrcid() });

class AuthorSubmissionPage extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData) {
    const { dispatch } = this.props;
    await dispatch(submit(AUTHORS_PID_TYPE, formData));
  }

  render() {
    const { error, query, profileControlNumber } = this.props;
    const { bai } = query;
    const initialFormData = { bai };
    const authorUpdateUrl = `${SUBMISSIONS_AUTHOR}/${profileControlNumber}`;
    return (
      <SubmissionPage
        title="Suggest author"
        description={
          <>
            <span>
              This form allows you to create the profile of a new author. It
              will be added to the <Link to={AUTHORS}>authors collection</Link>{' '}
              upon approval.
            </span>
            {profileControlNumber && (
              <p className="mt-4">
                <strong>
                  Do you want to update your profile? Go to the{' '}
                  <Link to={authorUpdateUrl}>author update form</Link>.
                </strong>
              </p>
            )}
          </>
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

AuthorSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
  query: PropTypes.objectOf(PropTypes.any).isRequired,
  profileControlNumber: PropTypes.number,
};

const stateToProps = (state) => ({
  error: state.submissions.get('submitError'),
  query: state.router.location.query,
  profileControlNumber: state.user.getIn(['data', 'profile_control_number']),
});

const dispatchToProps = (dispatch) => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
