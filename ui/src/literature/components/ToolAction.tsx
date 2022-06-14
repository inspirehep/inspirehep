import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ToolOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';

import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import { MAX_BULK_ASSIGN } from '../constants';
import ExportToCdsModal from './ExportToCdsModal';

function ToolAction({
  onAssignToConference,
  onExportToCds,
  disabledBulkAssign,
  selectionSize
}: any) {
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

  return (
    <ListItemAction>
      <DropdownMenu
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        title={
          <Button>
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            <IconText text="tools" icon={<ToolOutlined />} />
          </Button>
        }
      >
        <Menu.Item
          title={
            disabledBulkAssign
              ? `Please select up to ${MAX_BULK_ASSIGN} papers that you want to assign to a conference.`
              : null
          }
          disabled={disabledBulkAssign}
          data-test-id="assign-conference"
          key="assign-conference"
          onClick={() => onAssignToConference()}
        >
          Assign conference
        </Menu.Item>
        <Menu.Item
          title={
            disabledBulkAssign
              ? `Please select up to ${MAX_BULK_ASSIGN} papers that you want to export to CDS.`
              : null
          }
          disabled={disabledBulkAssign}
          data-test-id="export-to-CDS"
          key="export-to-CDS"
          onClick={onClickExportToCds}
        >
          Export to CDS
        </Menu.Item>
        <ExportToCdsModal
          onCancel={onExportToCdsModalCancel}
          onOk={handleCdsExportOk}
          visible={isModalVisible}
          selectionSize={selectionSize}
        />
      </DropdownMenu>
    </ListItemAction>
  );
}

ToolAction.propTypes = {
  onAssignToConference: PropTypes.func.isRequired,
  onExportToCds: PropTypes.func.isRequired,
  disabledBulkAssign: PropTypes.bool,
  selectionSize: PropTypes.number,
};

export default ToolAction;
