import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik, yupToFormErrors } from 'formik';
import useAsyncEffect from 'use-async-effect';

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
import useIsMounted from '../../../common/hooks/useIsMounted';

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
const ALLOWED_DOC_TYPES = Object.keys(FORMS_BY_DOC_TYPE);

function fallbackToArticleIfNotAllowed(docType) {
  const isAllowed = ALLOWED_DOC_TYPES.some(
    allowedDocType => docType === allowedDocType
  );
  return isAllowed ? docType : 'article';
}

function LiteratureSubmission({
  error = null,
  docType,
  initialFormData = null,
  onSubmit,
}) {
  const normalizedDocType = useMemo(
    () => fallbackToArticleIfNotAllowed(docType),
    [docType]
  );

  const { component, schema, defaultData } = FORMS_BY_DOC_TYPE[
    normalizedDocType
  ];
  const initialValues = useMemo(
    () => ({ ...defaultData, ...initialFormData }),
    [defaultData, initialFormData]
  );

  const [initialErrors, setInitialErrors] = useState();

  useAsyncEffect(
    async () => {
      try {
        const hasImportedData = Boolean(initialFormData);
        if (hasImportedData) {
          await schema.validate(initialValues);
        }
      } catch (yupErrors) {
        const errors = yupToFormErrors(yupErrors);
        setInitialErrors(errors);
      }
    },
    [initialValues, schema]
  );

  const isMounted = useIsMounted();

  const onFormikSubmit = useCallback(
    async (values, actions) => {
      const cleanValues = cleanupFormData(values);
      await onSubmit(cleanValues);
      // since it's an async callback might run after this component is unmounted
      // this happens when successful submissions routes to success page
      if (isMounted) {
        actions.setSubmitting(false);
        window.scrollTo(0, 0);
      }
    },
    [onSubmit, isMounted]
  );
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
            enableReinitialize
            initialErrors={initialErrors}
            initialValues={initialValues}
            validationSchema={schema}
            validateOnChange={false}
            onSubmit={onFormikSubmit}
            component={component}
          />
        </Col>
      </Row>
    </div>
  );
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
