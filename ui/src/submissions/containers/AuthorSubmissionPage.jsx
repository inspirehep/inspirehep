import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { Formik } from 'formik';

import AuthorForm from '../components/AuthorForm';
import authorSchema from '../schemas/author';

class AuthorSubmissionPage extends Component {
  render() {
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          Author Submission
          <Formik
            initialValues={{
              display_name: 'Harun Urhan',
              field_of_research: ['hep-ph'],
            }}
            validationSchema={authorSchema}
            onSubmit={(values, actions) => {
              console.log(values);
              actions.setSubmitting(false);
            }}
            component={AuthorForm}
          />
        </Col>
      </Row>
    );
  }
}

AuthorSubmissionPage.propTypes = {
  // dispatch: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => ({ dispatch });

export default connect(null, dispatchToProps)(AuthorSubmissionPage);
