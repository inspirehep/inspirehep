import React, { useCallback, useState } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { useParams } from 'react-router-dom';
import { Set } from 'immutable';
import { SelectOutlined } from '@ant-design/icons';

import { Drawer, Radio, Row, Col, Button } from 'antd';
import ResultsContainer from '../../../common/containers/ResultsContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';
import AuthorResultItem from '../AuthorResultItem';
import NumberOfResultsContainer from '../../../common/containers/NumberOfResultsContainer';
import EmbeddedSearchBoxContainer from '../../../common/containers/EmbeddedSearchBoxContainer';
import pluralizeUnlessSingle from '../../../common/utils';

function renderAuthorItem(result: $TSFixMe) {
  return (
    <Row>
      <Col flex="0 1 1px">
        <Radio value={result.getIn(['metadata', 'control_number'])} />
      </Col>
      <Col flex="1 1 1px">
        <AuthorResultItem
          metadata={result.get('metadata')}
          openDetailInNewTab
        />
      </Col>
    </Row>
  );
}

type Props = {
    visible?: boolean;
    onDrawerClose?: $TSFixMeFunction;
    onAssign?: $TSFixMeFunction;
    selectedPapers?: $TSFixMe; // TODO: PropTypes.instanceOf(Set)
};

function AssignDrawer({ visible, onDrawerClose, selectedPapers, onAssign }: Props) {
  const currentAuthorId = Number(useParams().id);
  const [selectedAuthorId, setSelectedAuthorId] = useState();
  const onSelectedAuthorChange = useCallback(event => {
    setSelectedAuthorId(event.target.value);
  }, []);
  const onAssignClick = useCallback(
    () => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      onAssign({
        from: currentAuthorId,
        to: selectedAuthorId === 'new' ? undefined : selectedAuthorId,
      });
    },
    [currentAuthorId, selectedAuthorId, onAssign]
  );
  return (
    <Drawer
      className="search-drawer"
      placement="right"
      onClose={onDrawerClose}
      visible={visible}
    >
      <p>
        <strong>
          You have selected {selectedPapers.size}{' '}
          {pluralizeUnlessSingle('paper', selectedPapers.size)}. Select the
          author to assign the selected papers:
        </strong>
      </p>
      <EmbeddedSearchBoxContainer namespace={ASSIGN_AUTHOR_NS} />
      <NumberOfResultsContainer namespace={ASSIGN_AUTHOR_NS} />
      <Radio.Group
        data-test-id="author-radio-group"
        className="w-100"
        onChange={onSelectedAuthorChange}
      >
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
            data-test-id="assign-button"
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
