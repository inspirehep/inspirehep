import React, { useCallback, useState } from 'react';
import { SelectOutlined } from '@ant-design/icons';

import { Drawer, Radio, Row, Col, Button } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import ResultItem from '../../common/components/ResultItem';
import Author from '../../common/components/Author';

interface IAuthor {
  affiliations: string[];
  signature_block: string;
  bai: string;
  recid: number;
  record: string[];
  last_name: string;
  ids: string[];
  raw_affiliations: string[];
  first_name: string;
  full_name: string;
  uuid: string;
}

interface IAuthorResult {
  get: (value: string) => IAuthor;
}

interface AssignLiteratureItemDrawerProps {
  visible: boolean;
  onDrawerClose: () => void;
  onAssign: (args: {
    from: string | undefined;
    to: number;
    literatureId: string;
  }) => void;
  currentUserRecordId: number;
  authors: IAuthorResult[];
  paperId: string;
}

const renderAuthorItem = (
  authors: IAuthorResult[],
  onChange: (event: RadioChangeEvent) => void
) => (
  <Radio.Group
    className="w-100"
    onChange={onChange}
    data-test-id="literature-drawer-radio-group"
  >
    {authors.map((result: IAuthorResult) => (
      <Row>
        <Col flex="0 1 1px">
          <Radio value={result.get('recid') || 'recid'} />
        </Col>
        <Col flex="1 1 1px" className="pb2">
          <ResultItem>
            <Author author={result} />
          </ResultItem>
        </Col>
      </Row>
    ))}
  </Radio.Group>
);

function AssignLiteratureItemDrawer({
  visible,
  onDrawerClose,
  onAssign,
  currentUserRecordId,
  authors,
  paperId,
}: AssignLiteratureItemDrawerProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>();

  const onSelectedAuthorChange = useCallback((event) => {
    setSelectedAuthorId(event.target.value);
  }, []);

  const onAssignClick = useCallback(() => {
    onAssign({
      from: selectedAuthorId,
      to: currentUserRecordId,
      literatureId: paperId,
    });
  }, [currentUserRecordId, selectedAuthorId, onAssign, paperId]);

  return (
    <Drawer
      className="search-drawer"
      placement="right"
      onClose={onDrawerClose}
      visible={visible}
    >
      <p>
        <strong>Select the author to claim:</strong>
      </p>
      {renderAuthorItem(authors, onSelectedAuthorChange)}
      <Row className="mt2" justify="end">
        <Col>
          <Button
            data-test-id="assign-literature-item-button"
            disabled={selectedAuthorId == null}
            icon={<SelectOutlined />}
            type="primary"
            onClick={onAssignClick}
          >
            Claim
          </Button>
        </Col>
      </Row>
    </Drawer>
  );
}

export default AssignLiteratureItemDrawer;
