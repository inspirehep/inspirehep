import React from 'react'
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import SubmissionSuccess from '../../common/components/SubmissionSuccess';
import { INSTITUTIONS } from '../../../common/routes';

export const InstitutionSubmissionSuccessPage = ({ recordId }) => (
  <SubmissionSuccess
    message={
      <span>
        Successfully submitted, thank you for the submission! See the
        institution{' '}<Link to={`${INSTITUTIONS}/${recordId}`}>here</Link>.
      </span>
    }
  />
);

InstitutionSubmissionSuccessPage.propTypes = {
  recordId: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  recordId: state.submissions.getIn(['successData', 'control_number']),
});

export default connect(stateToProps)(InstitutionSubmissionSuccessPage);
