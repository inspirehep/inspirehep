import React, { useCallback, useState, useEffect } from 'react';
import { SelectOutlined } from '@ant-design/icons';
import { Drawer, Radio, Row, Col, Button, List, Input } from 'antd';
import { Map } from 'immutable';

import AuthorResult from './AuthorResult';

interface AssignLiteratureItemDrawerProps {
  literatureId: number;
  onDrawerClose: () => void;
  onAssign: (args: {
    from: number | undefined;
    to: number;
    literatureId: number;
  }) => void;
  currentUserRecordId: number;
  authors: Map<string, string>[];
  itemLiteratureId: number;
  page: string;
}

function AssignLiteratureItemDrawer({
  literatureId,
  onDrawerClose,
  onAssign,
  currentUserRecordId,
  authors,
  itemLiteratureId,
  page,
}: AssignLiteratureItemDrawerProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<number>();
  const [availableAuthors, setAvailableAuthors] = useState<
    Map<string, string>[]
  >([]);

  useEffect(() => {
    if (authors) {
      // @ts-ignore
      setAvailableAuthors(authors.toArray());
    }
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
    const filteredAuthors = authors.filter((author: Map<string, string>) =>
      author
        ?.get('full_name')
        ?.toString()
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
      onClose={() => {
        onDrawerClose();
        setSelectedAuthorId(undefined);
      }}
      open={itemLiteratureId === literatureId}
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
        value={selectedAuthorId || null}
      >
        <List
          itemLayout="horizontal"
          pagination={{
            pageSize: 20,
            size: 'small',
            hideOnSinglePage: true,
          }}
          dataSource={availableAuthors}
          renderItem={(item: Map<string, string>) => (
            <AuthorResult item={item} page={page} />
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
