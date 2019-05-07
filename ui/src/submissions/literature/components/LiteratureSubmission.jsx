import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import articleSchema from '../schemas/article';
import thesisSchema from '../schemas/thesis';
import cleanupFormData from '../../common/cleanupFormData';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
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
    defaultData: articleSchema.cast(),
  },
  thesis: {
    component: ThesisForm,
    schema: thesisSchema,
    defaultData: thesisSchema.cast(),
  },
  book: {
    component: BookForm,
    schema: bookSchema,
    defaultData: bookSchema.cast(),
  },
  bookChapter: {
    component: BookChapterForm,
    schema: bookChapterSchema,
    defaultData: bookChapterSchema.cast(),
  },
};

class LiteratureSubmission extends Component {
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
    const { error, docType, initialFormData } = this.props;

    const { component, schema, defaultData } = FORMS_BY_DOC_TYPE[docType];
    const initialValues = { ...defaultData, ...initialFormData };

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
              onSubmit={this.onFormikSubmit}
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
  initialFormData: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func.isRequired, // must be async
};

LiteratureSubmission.defaultProps = {
  error: null,
  initialFormData: null,
};

export default convertAllImmutablePropsToJS(LiteratureSubmission);
