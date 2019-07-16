import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col, Form } from 'antd';

import { submit } from '../../../actions/submissions';
import { LABEL_COL, WRAPPER_COL } from '../../common/withFormItem';
import LiteratureSubmission from '../components/LiteratureSubmission';
import ExternalLink from '../../../common/components/ExternalLink';
import SelectBox from '../../../common/components/SelectBox';
import DataImporterContainer from './DataImporterContainer';
import { LITERATURE_PID_TYPE } from '../../../common/constants';

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

class LiteratureSubmissionPage extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onDocTypeChange = this.onDocTypeChange.bind(this);
    this.onDataImportSkipClick = this.onDataImportSkipClick.bind(this);

    this.state = {
      docType: DOC_TYPE_OPTIONS[0].value,
      hasDataImportSkipped: false,
    };
  }

  async onSubmit(formData) {
    const { dispatch } = this.props;
    await dispatch(submit(LITERATURE_PID_TYPE, formData));
  }

  onDocTypeChange(docType) {
    this.setState({ docType });
  }

  onDataImportSkipClick() {
    this.setState({ hasDataImportSkipped: true });
  }

  shouldDisplayForm() {
    const { hasDataImportSkipped } = this.state;
    const { importedFormData } = this.props;
    return hasDataImportSkipped || importedFormData != null;
  }

  render() {
    const { error, importedFormData } = this.props;
    const { docType } = this.state;

    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
          <Row className="mb3 pa3 bg-white">
            <h3>Suggest content</h3>
            This form allows you to suggest a preprint, an article, a book, a
            conference proceeding or a thesis you would like to see added to
            INSPIRE. We will check your suggestion with our{' '}
            <ExternalLink href="//inspirehep.net/info/hep/collection-policy">
              selection policy
            </ExternalLink>{' '}
            and transfer it to INSPIRE.
          </Row>
          <Row className="mb3 pa3 bg-white">
            <Col>
              <DataImporterContainer onSkipClick={this.onDataImportSkipClick} />
            </Col>
          </Row>
          {this.shouldDisplayForm() && (
            <>
              <Row className="mb3 ph3 pt3 bg-white">
                <Col>
                  <Form.Item
                    label="Type of the document"
                    labelCol={LABEL_COL}
                    wrapperCol={WRAPPER_COL}
                  >
                    <SelectBox
                      data-test-id="document-type-select"
                      className="w-100"
                      value={docType}
                      options={DOC_TYPE_OPTIONS}
                      onChange={this.onDocTypeChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col>
                  <LiteratureSubmission
                    initialFormData={importedFormData}
                    error={error}
                    onSubmit={this.onSubmit}
                    docType={docType}
                  />
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    );
  }
}

LiteratureSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
  importedFormData: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
  importedFormData: state.submissions.get('initialData'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(LiteratureSubmissionPage);
