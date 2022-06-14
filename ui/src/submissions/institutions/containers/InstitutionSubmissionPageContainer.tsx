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

export const InstitutionSubmissionPage = ({ error, onSubmit }) => (
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
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(INSTITUTIONS_PID_TYPE, formData));
  },
});

export default connect(stateToProps, dispatchToProps)(InstitutionSubmissionPage);
