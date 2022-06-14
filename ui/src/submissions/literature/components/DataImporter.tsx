import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Input, Button, Alert, Row, Col, Tooltip, Form } from 'antd';
import ExternalLink from '../../../common/components/ExternalLink.tsx';

import LinkLikeButton from '../../../common/components/LinkLikeButton';
import { LABEL_COL, WRAPPER_COL } from '../../common/withFormItem';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong during the import';

class DataImporter extends Component {
  constructor(props) {
    super(props);
    this.onImportChange = this.onImportChange.bind(this);
    this.onImportClick = this.onImportClick.bind(this);
  }

  async onImportChange(event) {
    const { value } = event.target;
    this.importValue = value;
  }

  onImportClick() {
    const { onImportClick } = this.props;
    onImportClick(this.importValue);
  }

  renderAlertMessage() {
    const { error } = this.props;
    const recordId = error.get('recid');
    return (
      <>
        {error.get('message', DEFAULT_ERROR_MESSAGE)}
        {recordId && (
          <>
            {'. '}{' '}
            <ExternalLink href={`http://inspirehep.net/record/${recordId}`}>
              See the record
            </ExternalLink>
          </>
        )}
      </>
    );
  }

  render() {
    const { onSkipClick, isImporting, error } = this.props;
    return (
      <div>
        <Row className="mb3">
          <Col span={24}>
            <Alert
              message="Fill in the field to automatically import more data from arXiv or DOI"
              type="info"
            />
          </Col>
        </Row>
        {error && (
          <Row className="mb3">
            <Col>
              <Alert
                message={this.renderAlertMessage()}
                type="error"
                showIcon
                closable
              />
            </Col>
          </Row>
        )}
        <Form.Item
          label={<Tooltip title="From arXiv or DOI">From arXiv or DOI</Tooltip>}
          labelCol={LABEL_COL}
          wrapperCol={WRAPPER_COL}
        >
          <Input
            data-test-id="import-input"
            placeholder="hep-th/9711200 or 1207.7235 or arXiv:1001.4538 or 10.1086/305772 or doi:10.1086/305772"
            onChange={this.onImportChange}
            onPressEnter={this.onImportClick}
          />
        </Form.Item>
        <Row type="flex" justify="space-between" align="middle">
          <Col>
            <LinkLikeButton
              dataTestId="skip-import-button"
              onClick={onSkipClick}
            >
              Skip and fill the form manually
            </LinkLikeButton>
          </Col>
          <Col>
            <Button
              data-test-id="import-button"
              type="primary"
              onClick={this.onImportClick}
              loading={isImporting}
            >
              Import
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

DataImporter.propTypes = {
  // TODO: maybe use portal to put this future directly into SubmissionPage or remove this component fully since it's not used anywhere else, or use redux
  onSkipClick: PropTypes.func.isRequired,
  onImportClick: PropTypes.func.isRequired,
  isImporting: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Map),
};

export default DataImporter;
