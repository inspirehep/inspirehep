import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class AuthorSubmissionPage extends Component {
  constructor(props: any) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dispatch' does not exist on type 'Readon... Remove this comment to see the full error message
    const { dispatch } = this.props;
    await dispatch(submit(AUTHORS_PID_TYPE, formData));
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  error: PropTypes.instanceOf(Map),
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

const stateToProps = (state: any) => ({
  error: state.submissions.get('submitError'),
  query: state.router.location.query
});

const dispatchToProps = (dispatch: any) => ({
  dispatch
});

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
