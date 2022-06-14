import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import { submit } from '../../../actions/submissions';
import SubmissionPage from '../../common/components/SubmissionPage';
import ExperimentSubmission from '../components/ExperimentSubmission';
import { EXPERIMENTS_PID_TYPE } from '../../../common/constants';
import { EXPERIMENTS } from '../../../common/routes';

export const ExperimentSubmissionPage = ({ error, onSubmit }) => (
  <SubmissionPage
    title="Suggest experiment"
    description={
      <span>
        This form allows you to create a new experiment record. It will
        appear in the <Link to={EXPERIMENTS}>Experiments List</Link> immediately.
      </span>
    }
  >
    <ExperimentSubmission
      error={error}
      onSubmit={onSubmit}
    />
  </SubmissionPage>
);

ExperimentSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(EXPERIMENTS_PID_TYPE, formData));
  },
});

export default connect(stateToProps, dispatchToProps)(ExperimentSubmissionPage);
