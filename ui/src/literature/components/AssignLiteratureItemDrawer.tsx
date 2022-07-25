import React, { useCallback, useState, useEffect } from 'react';
import { SelectOutlined } from '@ant-design/icons';

import { Drawer, Radio, Row, Col, Button, List, Input } from 'antd';
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
  literatureId: number;
  onDrawerClose: () => void;
  onAssign: (args: {
    from: number | undefined;
    to: number;
    literatureId: number;
  }) => void;
  currentUserRecordId: number;
  authors: IAuthorResult[];
  itemLiteratureId: number;
}

function AssignLiteratureItemDrawer({
  literatureId,
  onDrawerClose,
  onAssign,
  currentUserRecordId,
  authors,
  itemLiteratureId,
}: AssignLiteratureItemDrawerProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<number>();
  const [availableAuthors, setAvailableAuthors] = useState<IAuthorResult[]>([]);
  
  useEffect(() => {
    // @ts-ignore
    setAvailableAuthors(authors.toArray());
  }, [authors]);
  
  const onSelectedAuthorChange = useCallback((event) => {
    setSelectedAuthorId(event.target.value);
  }, []);

  const onAssignClick = useCallback(() => {
    onAssign({
      from: selectedAuthorId,
      to: currentUserRecordId,
      literatureId: itemLiteratureId,
    });
  }, [currentUserRecordId, selectedAuthorId, onAssign, itemLiteratureId]);

  const onAuthorSearch = (value: string): void => {
    const filteredAuthors = authors.filter(
        (author: IAuthorResult) => author
          .get('full_name')
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    // @ts-ignore
    setAvailableAuthors(filteredAuthors.toArray());
  };

  return (
    <Drawer
      className="search-drawer"
      placement="right"
      onClose={onDrawerClose}
      visible={itemLiteratureId === literatureId}
      title="Select the author to claim:"
    >
      <Input.Search
        onSearch={onAuthorSearch}
        enterButton
        className="pb3"
        placeholder="Search for an author"
      />
      <Radio.Group
        className="w-100"
        onChange={onSelectedAuthorChange}
        data-test-id="literature-drawer-radio-group"
      >
        <List
          itemLayout="horizontal"
          pagination={{
            pageSize: 20,
            size: 'small',
            hideOnSinglePage: true,
          }}
          dataSource={availableAuthors}
          renderItem={(item: IAuthorResult) => (
            <Row>
              <Col flex="0 1 1px">
                <Radio value={item.get('recid') || 'recid'} />
              </Col>
              <Col flex="1 1 1px" className="pb2">
                <ResultItem>
                  <Author author={item} />
                </ResultItem>
              </Col>
            </Row>
          )}
        />
      </Radio.Group>

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
