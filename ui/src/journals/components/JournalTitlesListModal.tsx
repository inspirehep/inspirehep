import React from 'react';
import { Modal, List } from 'antd';

export const JournalTitlesListModal = ({
  modalVisible,
  onModalVisibilityChange,
  titleVariants,
}: {
  modalVisible: boolean;
  onModalVisibilityChange: () => void;
  titleVariants: string[];
}) => (
  <Modal
    visible={modalVisible}
    onCancel={onModalVisibilityChange}
    footer={null}
  >
    <List
      header={<h3>Title variants</h3>}
      size="small"
      dataSource={titleVariants}
      pagination={{
        pageSize: 8,
        size: 'small',
        hideOnSinglePage: true,
        showSizeChanger: false
      }}
      renderItem={(item: string) => <List.Item>{item}</List.Item>}
    />
  </Modal>
);
