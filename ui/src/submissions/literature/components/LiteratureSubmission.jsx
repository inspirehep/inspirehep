import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { Formik } from 'formik';

import articleSchema from '../schemas/article';
import thesisSchema from '../schemas/thesis';
import cleanupFormData from '../../common/cleanupFormData';
import toJS from '../../../common/immutableToJS';
import ExternalLink from '../../../common/components/ExternalLink';
import ArticleForm from './ArticleForm';
import SelectBox from '../../../common/components/SelectBox';
import ThesisForm from './ThesisForm';

const DOC_TYPE_OPTIONS = [
  {
    value: 'article',
    display: 'Article/Conference paper',
  },
  {
    value: 'thesis',
    display: 'Thesis',
  },
];
const FORM_COMPONENT_BY_DOC_TYPE = {
  article: ArticleForm,
  thesis: ThesisForm,
};
const FORM_SCHEMA_BY_DOC_TYPE = {
  article: articleSchema,
  thesis: thesisSchema,
};

class LiteratureSubmission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      docType: DOC_TYPE_OPTIONS[0].value,
    };

    this.onDocTypeChange = this.onDocTypeChange.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onDocTypeChange(docType) {
    this.setState({ docType });
  }

  render() {
    const { error, onSubmit } = this.props;
    const { docType } = this.state;

    const FormComponent = FORM_COMPONENT_BY_DOC_TYPE[docType];
    const formSchema = FORM_SCHEMA_BY_DOC_TYPE[docType];

    const initialValues = formSchema.cast();

    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <div className="mb3 pa3 bg-white">
            This form allows you to suggest a preprint, an article, a book, a
            conference proceeding or a thesis you would like to see added to
            INSPIRE. We will check your suggestion with our{' '}
            <ExternalLink href="//inspirehep.net/info/hep/collection-policy">
              selection policy
            </ExternalLink>{' '}
            and transfer it to INSPIRE.
          </div>
          {error && (
            <div className="mb3">
              <Alert message={error.message} type="error" showIcon closable />
            </div>
          )}
          <Row className="mb3">
            <Col span={8}>
              <SelectBox
                className="w-100"
                value={docType}
                options={DOC_TYPE_OPTIONS}
                onChange={this.onDocTypeChange}
              />
            </Col>
          </Row>
          <Row>
            <Formik
              initialValues={initialValues}
              validationSchema={formSchema}
              onSubmit={async (values, actions) => {
                const cleanValues = cleanupFormData(values);
                await onSubmit(cleanValues);
                if (this.mounted) {
                  actions.setSubmitting(false);
                  window.scrollTo(0, 0);
                }
              }}
              component={FormComponent}
            />
          </Row>
        </Col>
      </Row>
    );
  }
}

LiteratureSubmission.propTypes = {
  error: PropTypes.objectOf(PropTypes.any), // must have 'message'
  onSubmit: PropTypes.func.isRequired, // must be async
};

LiteratureSubmission.defaultProps = {
  error: null,
};

export default toJS(LiteratureSubmission);
