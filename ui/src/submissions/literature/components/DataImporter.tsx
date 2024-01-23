import React, { useState, MouseEventHandler, ChangeEventHandler } from 'react';
import { Map } from 'immutable';
import { Input, Button, Alert, Row, Col, Tooltip, Form } from 'antd';

import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import { LABEL_COL, WRAPPER_COL } from '../../common/withFormItem';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong during the import';

const DataImporter = ({
  onSkipClick,
  onImportClick,
  isImporting,
  error,
}: {
  onSkipClick: MouseEventHandler<HTMLElement>;
  onImportClick: Function;
  isImporting: boolean;
  error: Map<string, any>;
}) => {
  const [importValue, setImportValue] = useState<string | null>(null);
  async function onImportChange(event: Event) {
    const { value } = event.target as HTMLInputElement;
    setImportValue(value);
  }

  function onImport() {
    onImportClick(importValue);
  }

  function renderAlertMessage() {
    const recordId = error.get('recid');
    return (
      <>
        {error.get('message', DEFAULT_ERROR_MESSAGE)}
        {recordId && (
          <>
            {'. '}{' '}
            <LinkWithTargetBlank
              href={`http://inspirehep.net/record/${recordId}`}
            >
              See the record
            </LinkWithTargetBlank>
          </>
        )}
      </>
    );
  }

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
          <Col span={24}>
            <Alert
              message={renderAlertMessage()}
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
          onChange={
            onImportChange as never as ChangeEventHandler<HTMLInputElement>
          }
          onPressEnter={onImport}
        />
      </Form.Item>
      <Row justify="space-between" align="middle">
        <Col>
          <LinkLikeButton dataTestId="skip-import-button" onClick={onSkipClick}>
            Skip and fill the form manually
          </LinkLikeButton>
        </Col>
        <Col>
          <Button
            data-test-id="import-button"
            type="primary"
            onClick={onImport}
            loading={isImporting}
          >
            Import
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DataImporter;
