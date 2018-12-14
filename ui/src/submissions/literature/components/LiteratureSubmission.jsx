import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import articleSchema from '../schemas/article';
import thesisSchema from '../schemas/thesis';
import cleanupFormData from '../../common/cleanupFormData';
import toJS from '../../../common/immutableToJS';
import ArticleForm from './ArticleForm';
import ThesisForm from './ThesisForm';
import BookForm from './BookForm';
import bookSchema from '../schemas/book';
import BookChapterForm from './BookChapterForm';
import bookChapterSchema from '../schemas/bookChapter';

const FORMS_BY_DOC_TYPE = {
  article: {
    component: ArticleForm,
    schema: articleSchema,
    initialValues: articleSchema.cast(),
  },
  thesis: {
    component: ThesisForm,
    schema: thesisSchema,
    initialValues: thesisSchema.cast(),
  },
  book: {
    component: BookForm,
    schema: bookSchema,
    initialValues: bookSchema.cast(),
  },
  bookChapter: {
    component: BookChapterForm,
    schema: bookChapterSchema,
    initialValues: bookChapterSchema.cast(),
  },
};

class LiteratureSubmission extends Component {
  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { error, onSubmit, docType } = this.props;

    const { component, schema, initialValues } = FORMS_BY_DOC_TYPE[docType];

    return (
      <Row>
        {error && (
          <Row className="mb3">
            <Col>
              <Alert message={error.message} type="error" showIcon closable />
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={schema}
              onSubmit={async (values, actions) => {
                const cleanValues = cleanupFormData(values);
                await onSubmit(cleanValues);
                if (this.mounted) {
                  actions.setSubmitting(false);
                  window.scrollTo(0, 0);
                }
              }}
              component={component}
            />
          </Col>
        </Row>
      </Row>
    );
  }
}

LiteratureSubmission.propTypes = {
  docType: PropTypes.oneOf(['article', 'thesis', 'book', 'bookChapter'])
    .isRequired,
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  onSubmit: PropTypes.func.isRequired, // must be async
};

LiteratureSubmission.defaultProps = {
  error: null,
};

export default toJS(LiteratureSubmission);
