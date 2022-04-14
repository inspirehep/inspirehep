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
import { AUTHORS } from '../../../common/routes';

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

AuthorSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

const stateToProps = (state) => ({
  error: state.submissions.get('submitError'),
  query: state.router.location.query,
});

const dispatchToProps = (dispatch) => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
