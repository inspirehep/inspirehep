import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ToolOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import { MAX_BULK_ASSIGN } from '../constants';
import ExportToCdsModal from './ExportToCdsModal';

function ToolAction({
  onAssignToConference,
  onExportToCds,
  disabledBulkAssign,
  selectionSize,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onClickExportToCds = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const onExportToCdsModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleCdsExportOk = () => {
    setIsModalVisible(false);
    onExportToCds();
  };

  const menuItems = [
    {
      key: 'assign-conference',
      label: (
        <span
          title={
            disabledBulkAssign
              ? `Please select up to ${MAX_BULK_ASSIGN} papers that you want to assign to a conference.`
              : null
          }
          disabled={disabledBulkAssign}
          data-test-id="assign-conference"
          data-testid="assign-conference"
          onClick={() => onAssignToConference()}
        >
          Assign conference
        </span>
      ),
    },
    {
      key: 'export-to-CDS',
      label: (
        <span
          title={
            disabledBulkAssign
              ? `Please select up to ${MAX_BULK_ASSIGN} papers that you want to export to CDS.`
              : null
          }
          disabled={disabledBulkAssign}
          data-test-id="export-to-CDS"
          data-testid="export-to-CDS"
          onClick={onClickExportToCds}
        >
          Export to CDS
        </span>
      ),
    },
  ];

  return (
    <UserAction>
      <DropdownMenu
        title={
          <Button>
            <IconText text="tools" icon={<ToolOutlined />} />
          </Button>
        }
        items={menuItems}
      />
      <ExportToCdsModal
        onCancel={onExportToCdsModalCancel}
        onOk={handleCdsExportOk}
        visible={isModalVisible}
        selectionSize={selectionSize}
      />
    </UserAction>
  );
}

ToolAction.propTypes = {
  onAssignToConference: PropTypes.func.isRequired,
  onExportToCds: PropTypes.func.isRequired,
  disabledBulkAssign: PropTypes.bool,
  selectionSize: PropTypes.number,
};

export default ToolAction;
