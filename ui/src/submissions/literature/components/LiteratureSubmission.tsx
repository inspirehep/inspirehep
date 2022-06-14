import React, { useMemo, useState } from 'react';
import { Row, Col, Alert } from 'antd';
import { Formik, yupToFormErrors } from 'formik';
import useAsyncEffect from 'use-async-effect';

import articleSchema from '../schemas/article';
import thesisSchema from '../schemas/thesis';
import { convertAllImmutablePropsToJS } from '../../../common/immutableToJS';
import ArticleForm from './ArticleForm';
import ThesisForm from './ThesisForm';
import BookForm from './BookForm';
import bookSchema from '../schemas/book';
import BookChapterForm from './BookChapterForm';
import bookChapterSchema from '../schemas/bookChapter';
import useSubmitCallback from '../../common/hooks/useSubmitCallback';

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

function fallbackToArticleIfNotAllowed(docType: $TSFixMe) {
  const isAllowed = ALLOWED_DOC_TYPES.some(
    allowedDocType => docType === allowedDocType
  );
  return isAllowed ? docType : 'article';
}

type OwnProps = {
    docType: 'article' | 'thesis' | 'book' | 'bookChapter';
    error?: {
        [key: string]: $TSFixMe;
    };
    initialFormData?: {
        [key: string]: $TSFixMe;
    };
    onSubmit: $TSFixMeFunction;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof LiteratureSubmission.defaultProps;

// @ts-expect-error ts-migrate(2322) FIXME: Type 'null' is not assignable to type 'never'.
function LiteratureSubmission({ error = null, docType, initialFormData = null, onSubmit, }: Props) {
  const normalizedDocType = useMemo(
    () => fallbackToArticleIfNotAllowed(docType),
    [docType]
  );

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const { component, schema, defaultData } = FORMS_BY_DOC_TYPE[
    normalizedDocType
  ];
  const initialValues = useMemo(
    // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'FormikErrors<unknown>' is not as... Remove this comment to see the full error message
        setInitialErrors(errors);
      }
    },
    [initialValues, schema]
  );

  const onFormikSubmit = useSubmitCallback(onSubmit);
  return (<div>
      {error && (<Row className="mb3">
          <Col span={24}>
            <Alert message={(error as $TSFixMe).message} type="error" showIcon closable/>
          </Col>
        </Row>)}
      <Row>
        <Col span={24}>
          <Formik enableReinitialize initialErrors={initialErrors} initialValues={initialValues} validationSchema={schema} validateOnChange={false} onSubmit={onFormikSubmit} component={component}/>
        </Col>
      </Row>
    </div>);
}

LiteratureSubmission.defaultProps = {
  error: null,
  initialFormData: null,
};

export default convertAllImmutablePropsToJS(LiteratureSubmission);
