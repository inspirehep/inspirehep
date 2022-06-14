import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Tooltip, Form } from 'antd';

import { submit } from '../../../actions/submissions';
import { LABEL_COL, WRAPPER_COL } from '../../common/withFormItem';
import LiteratureSubmission from '../components/LiteratureSubmission';
import ExternalLink from '../../../common/components/ExternalLink.tsx';
import SelectBox from '../../../common/components/SelectBox';
import DataImporterContainer from './DataImporterContainer';
import {
  LITERATURE_PID_TYPE,
  CONTENT_POLICY_URL,
} from '../../../common/constants';
import SubmissionPage from '../../common/components/SubmissionPage';

const DOC_TYPE_OPTIONS = [
  {
    value: 'article',
    display: 'Article/Conference paper',
  },
  {
    value: 'thesis',
    display: 'Thesis',
  },
  {
    value: 'book',
    display: 'Book',
  },
  {
    value: 'bookChapter',
    display: 'Book Chapter',
  },
];

function LiteratureSubmissionPage({ error, importedFormData, onSubmit }) {
  const [docType, setDocType] = useState(DOC_TYPE_OPTIONS[0].value);
  const [isDataImportSkipped, setDataImportSkipped] = useState(false);
  const shouldDisplayForm = isDataImportSkipped || importedFormData != null;

  const onDataImportSkipClick = useCallback(() => {
    setDataImportSkipped(true);
  }, []);
  const onDocTypeChange = useCallback(newDocType => {
    setDocType(newDocType);
  }, []);

  useEffect(
    () => {
      if (importedFormData) {
        const newDocType = importedFormData.get('document_type');
        setDocType(newDocType);
      }
    },
    [importedFormData]
  );
  return (
    <SubmissionPage
      title="Suggest content"
      description={
        <span>
          This form allows you to suggest a preprint, an article, a book, a
          conference proceeding or a thesis you would like to see added to
          INSPIRE. We will check your suggestion with our{' '}
          <ExternalLink href={CONTENT_POLICY_URL}>
            selection policy
          </ExternalLink>{' '}
          and transfer it to INSPIRE.
        </span>
      }
    >
      <Row className="mb3 pa3 bg-white">
        <Col span={24}>
          <DataImporterContainer onSkipClick={onDataImportSkipClick} />
        </Col>
      </Row>
      {shouldDisplayForm && (
        <>
          <Row className="mb3 ph3 pt3 bg-white">
            <Col span={24}>
              <Form.Item
                label={
                  <Tooltip title="Type of the document">
                    Type of the document
                  </Tooltip>
                }
                labelCol={LABEL_COL}
                wrapperCol={WRAPPER_COL}
              >
                <SelectBox
                  data-test-id="document-type-select"
                  className="w-100"
                  value={docType}
                  options={DOC_TYPE_OPTIONS}
                  onChange={onDocTypeChange}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <LiteratureSubmission
                initialFormData={importedFormData}
                error={error}
                onSubmit={onSubmit}
                docType={docType}
              />
            </Col>
          </Row>
        </>
      )}
    </SubmissionPage>
  );
}

LiteratureSubmissionPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map),
  importedFormData: PropTypes.instanceOf(Map),
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
  importedFormData: state.submissions.get('initialData'),
});

const dispatchToProps = dispatch => ({
  async onSubmit(formData) {
    await dispatch(submit(LITERATURE_PID_TYPE, formData));
  },
});

export default connect(stateToProps, dispatchToProps)(LiteratureSubmissionPage);
