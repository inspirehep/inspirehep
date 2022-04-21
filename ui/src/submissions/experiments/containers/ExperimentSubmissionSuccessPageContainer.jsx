import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { EXPERIMENTS } from '../../../common/routes';

export const ExperimentSubmissionSucessPage = ({ recordId }) => (
  <SubmissionSuccess
    message={
      <span>
        Successfully submitted, thank you for the submission! See the
        experiment{' '}<Link to={`${EXPERIMENTS}/${recordId}`}>here</Link>.
      </span>
    }
  />
);

ExperimentSubmissionSucessPage.propTypes = {
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  recordId: state.submissions.getIn(['successData', 'control_number']),
});

export default connect(stateToProps)(ExperimentSubmissionSucessPage);
