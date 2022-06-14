import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { Set } from 'immutable';
import { SelectOutlined } from '@ant-design/icons';

import { Drawer, Radio, Row, Col, Button } from 'antd';
import ResultsContainer from '../../common/containers/ResultsContainer';
import { ASSIGN_CONFERENCE_NS } from '../../search/constants';
import ConferenceItem from '../../conferences/components/ConferenceItem';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import EmbeddedSearchBoxContainer from '../../common/containers/EmbeddedSearchBoxContainer';
import pluralizeUnlessSingle from '../../common/utils';

function renderConferenceItem(result) {
  const controlNumber = result.getIn(['metadata', 'control_number']);
  const title = result.getIn(['metadata', 'titles', 0, 'title']);
  return (
    <Row>
      <Col flex="0 1 1px">
        <Radio value={{ controlNumber, title }} />
      </Col>
      <Col flex="1 1 1px">
        <ConferenceItem metadata={result.get('metadata')} openDetailInNewTab />
      </Col>
    </Row>
  );
}

function AssignDrawer({ visible, onDrawerClose, onAssign, selectedPapers }) {
  const [selectedConferenceId, setSelectedConferenceId] = useState();
  const [selectedConferenceTitle, setSelectedConferenceTitle] = useState();

  const onSelectedConferenceChange = useCallback((event) => {
    const { controlNumber, title } = event.target.value;
    setSelectedConferenceId(controlNumber);
    setSelectedConferenceTitle(title);
  }, []);

  const onAssignClick = useCallback(() => {
    onAssign(selectedConferenceId, selectedConferenceTitle);
  }, [selectedConferenceId, selectedConferenceTitle, onAssign]);

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
          conference to assign the selected papers:
        </strong>
      </p>
      <EmbeddedSearchBoxContainer namespace={ASSIGN_CONFERENCE_NS} />
      <NumberOfResultsContainer namespace={ASSIGN_CONFERENCE_NS} />
      <Radio.Group
        data-test-id="conference-radio-group"
        className="w-100"
        onChange={onSelectedConferenceChange}
      >
        <ResultsContainer
          namespace={ASSIGN_CONFERENCE_NS}
          renderItem={renderConferenceItem}
        />
      </Radio.Group>
      <Row className="mt2" justify="end">
        <Col>
          <Button
            data-test-id="assign-conference-button"
            disabled={selectedConferenceId == null}
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

AssignDrawer.propTypes = {
  visible: PropTypes.bool,
  onDrawerClose: PropTypes.func,
  onAssign: PropTypes.func,
  selectedPapers: PropTypes.instanceOf(Set),
};

export default AssignDrawer;
