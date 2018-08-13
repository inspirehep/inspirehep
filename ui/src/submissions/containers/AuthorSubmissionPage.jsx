import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { Formik } from 'formik';

import AuthorForm from '../components/AuthorForm';
import authorSchema from '../schemas/author';
import { submitAuthor } from '../../actions/submissions';

class AuthorSubmissionPage extends Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { dispatch } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <div className="mb3">Author Submission</div>
          <Formik
            initialValues={{
              display_name: 'Harun Urhan',
              field_of_research: ['hep-ph'],
              institution_history: [null],
              websites: [null],
            }}
            validationSchema={authorSchema}
            onSubmit={async (values, actions) => {
              // TODO: clear & trim
              await dispatch(submitAuthor(values));
              if (this.mounted) {
                actions.setSubmitting(false);
              }
            }}
            component={AuthorForm}
          />
        </Col>
      </Row>
    );
  }
}

AuthorSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  submitted: state.submissions.get('submitted'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
