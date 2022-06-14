import React from 'react'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Map } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import SubmissionPage from '../../common/components/SubmissionPage';
import InstitutionSubmission from '../components/InstitutionSubmission';
import { INSTITUTIONS_PID_TYPE } from '../../../common/constants';
import { INSTITUTIONS } from '../../../common/routes';

type InstitutionSubmissionPageProps = {
    onSubmit: $TSFixMeFunction;
    error?: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

export const InstitutionSubmissionPage = ({ error, onSubmit }: InstitutionSubmissionPageProps) => (
    <SubmissionPage
      title="Suggest institution"
      description={
        <span>
          This form allows you to create a new institution record. It will
          appear in the <Link to={INSTITUTIONS}>Institutions List</Link> immediately.
        </span>
      }
    >
    <InstitutionSubmission
      error={error}
      onSubmit={onSubmit}
    />
  </SubmissionPage>
);

const stateToProps = (state: $TSFixMe) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  async onSubmit(formData: $TSFixMe) {
    await dispatch(submit(INSTITUTIONS_PID_TYPE, formData));
  }
});

export default connect(stateToProps, dispatchToProps)(InstitutionSubmissionPage);
