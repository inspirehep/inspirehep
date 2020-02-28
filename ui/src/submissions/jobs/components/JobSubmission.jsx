import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';
import { object } from 'yup';

import JobForm from './JobForm';
import jobSchema from '../schemas/job';
import cleanupFormData from '../../common/cleanupFormData';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';

const DEFAULT_FORM_DATA = jobSchema.cast();

class JobSubmission extends Component {
  constructor(props) {
    super(props);

    this.onFormikSubmit = this.onFormikSubmit.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async onFormikSubmit(values, actions) {
    const { onSubmit } = this.props;
    const cleanValues = cleanupFormData(values);
    await onSubmit(cleanValues);
    if (this.mounted) {
      actions.setSubmitting(false);
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { error, initialFormData, extendSchema } = this.props;
    const initialValues = {
      ...DEFAULT_FORM_DATA,
      ...initialFormData,
    };
    return (
      <div>
        {error && (
          <Row className="mb3">
            <Col span={24}>
              <Alert message={error.message} type="error" showIcon closable />
            </Col>
          </Row>
        )}
        <Row>
          <Col span={24}>
            <Formik
              initialValues={initialValues}
              validationSchema={jobSchema.concat(extendSchema)}
              onSubmit={this.onFormikSubmit}
              validateOnChange={false}
              component={JobForm}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

JobSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  initialFormData: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired, // must be async
  extendSchema: PropTypes.instanceOf(object),
};

JobSubmission.defaultProps = {
  initialFormData: DEFAULT_FORM_DATA,
  extendSchema: object(),
  error: null,
};

export default convertAllImmutablePropsToJS(JobSubmission);
