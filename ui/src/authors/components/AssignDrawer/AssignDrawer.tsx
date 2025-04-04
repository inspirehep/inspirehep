import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Set, Map } from 'immutable';
import { SelectOutlined } from '@ant-design/icons';
import { Drawer, Radio, Row, Col, Button } from 'antd';

import ResultsContainer from '../../../common/containers/ResultsContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';
import AuthorResultItem from '../AuthorResultItem';
import NumberOfResultsContainer from '../../../common/containers/NumberOfResultsContainer';
import EmbeddedSearchBoxContainer from '../../../common/containers/EmbeddedSearchBoxContainer';
import { pluralizeUnlessSingle } from '../../../common/utils';

function renderAuthorItem(result: Map<string, string>) {
  return (
    <Row>
      <Col flex="0 1 1px">
        <Radio value={result.getIn(['metadata', 'control_number'])} />
      </Col>
      <Col flex="1 1 1px">
        <AuthorResultItem
          metadata={result.get('metadata') as unknown as Map<string, any>}
          openDetailInNewTab
        />
      </Col>
    </Row>
  );
}

function AssignDrawer({
  visible,
  onDrawerClose,
  selectedPapers,
  onAssign,
}: {
  visible: boolean;
  onDrawerClose:
    | ((
        e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
      ) => void)
    | undefined;
  selectedPapers: Set<string>;
  onAssign: Function;
}) {
  const currentAuthorId = Number(useParams<{ id: string }>().id);
  const [selectedAuthorId, setSelectedAuthorId] = useState();
  const onSelectedAuthorChange = useCallback((event) => {
    setSelectedAuthorId(event.target.value);
  }, []);
  const onAssignClick = useCallback(() => {
    onAssign({
      from: currentAuthorId,
      to: selectedAuthorId === 'new' ? undefined : selectedAuthorId,
    });
  }, [currentAuthorId, selectedAuthorId, onAssign]);
  return (
    <Drawer
      className="search-drawer"
      placement="right"
      onClose={onDrawerClose}
      open={visible}
      title={`You have selected ${selectedPapers.size}
            ${pluralizeUnlessSingle('paper', selectedPapers.size)}. Select the
            author to assign the selected papers:`}
    >
      <EmbeddedSearchBoxContainer namespace={ASSIGN_AUTHOR_NS} />
      {/* @ts-ignore */}
      <NumberOfResultsContainer namespace={ASSIGN_AUTHOR_NS} />
      <Radio.Group
        data-testid="author-radio-group"
        className="w-100"
        onChange={onSelectedAuthorChange}
      >
        {/* @ts-ignore */}
        <ResultsContainer
          namespace={ASSIGN_AUTHOR_NS}
          renderItem={renderAuthorItem}
        />
        <div className="mv2">
          <Radio value="new">
            <strong>New author</strong>
          </Radio>
        </div>
      </Radio.Group>
      <Row className="mt2" justify="end">
        <Col>
          <Button
            data-testid="assign-button"
            disabled={selectedAuthorId == null}
            icon={<SelectOutlined />}
            type="primary"
            onClick={onAssignClick}
          >
            Assign
          </Button>
        </Col>
      </Row>
    </Drawer>
  );
}

export default AssignDrawer;
