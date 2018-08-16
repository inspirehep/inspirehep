import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import AuthorForm from '../components/AuthorForm';
import authorSchema from '../schemas/author';
import { submitAuthor } from '../../actions/submissions';
import cleanupFormData from '../cleanupFormData';
import { authorSubmitErrorPath } from '../../reducers/submissions';

const initialValues = authorSchema.cast();

class AuthorSubmissionPage extends Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { dispatch, error } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <div className="mb3 pa3 bg-white">
            This form allows you to add new author information. All
            modifications are transferred to{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="//inspirehep.net/hepnames"
            >
              inspirehep.net/hepnames
            </a>{' '}
            upon approval.
          </div>
          {error && (
            <div className="mb3">
              <Alert
                message={error.get('message')}
                type="error"
                showIcon
                closable
              />
            </div>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={authorSchema}
            onSubmit={async (values, actions) => {
              const cleanValues = cleanupFormData(values);
              await dispatch(submitAuthor(cleanValues));
              if (this.mounted) {
                actions.setSubmitting(false);
                window.scrollTo(0, 0);
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
  error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  error: state.submissions.getIn(authorSubmitErrorPath),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
