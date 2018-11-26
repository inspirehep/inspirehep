import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import AuthorForm from './AuthorForm';
import authorSchema from '../schemas/author';
import cleanupFormData from '../cleanupFormData';
import toJS from '../../common/immutableToJS';
import ExternalLink from '../../common/components/ExternalLink';

const DEFAULT_FORM_DATA = authorSchema.cast();

class AuthorSubmission extends Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { error, initialFormData, onSubmit } = this.props;
    const initialValues = {
      ...DEFAULT_FORM_DATA,
      ...initialFormData,
    };
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <div className="mb3 pa3 bg-white">
            This form allows you to add new author information. All
            modifications are transferred to{' '}
            <ExternalLink href="//inspirehep.net/hepnames">
              inspirehep.net/hepnames
            </ExternalLink>{' '}
            upon approval.
          </div>
          {error && (
            <div className="mb3">
              <Alert message={error.message} type="error" showIcon closable />
            </div>
          )}
          <Formik
            initialValues={initialValues}
            validationSchema={authorSchema}
            onSubmit={async (values, actions) => {
              const cleanValues = cleanupFormData(values);
              await onSubmit(cleanValues);
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

AuthorSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  initialFormData: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired, // must be async
};

AuthorSubmission.defaultProps = {
  initialFormData: DEFAULT_FORM_DATA,
  error: null,
};

export default toJS(AuthorSubmission);
