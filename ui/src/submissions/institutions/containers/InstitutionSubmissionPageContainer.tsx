import React from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import SubmissionPage from '../../common/components/SubmissionPage';
import InstitutionSubmission from '../components/InstitutionSubmission';
import { INSTITUTIONS_PID_TYPE } from '../../../common/constants';
import { INSTITUTIONS } from '../../../common/routes';

export const InstitutionSubmissionPage = ({
  error,
  onSubmit
}: any) => (
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

InstitutionSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError')
});

const dispatchToProps = (dispatch: any) => ({
  async onSubmit(formData: any) {
    await dispatch(submit(INSTITUTIONS_PID_TYPE, formData));
  }
});

export default connect(stateToProps, dispatchToProps)(InstitutionSubmissionPage);
