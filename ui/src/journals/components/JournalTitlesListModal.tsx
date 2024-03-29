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
    open={modalVisible}
    onCancel={onModalVisibilityChange}
    footer={null}
    title="Title variants"
  >
    <List
      size="small"
      dataSource={titleVariants}
      pagination={{
        pageSize: 8,
        size: 'small',
        hideOnSinglePage: true,
        showSizeChanger: false,
      }}
      renderItem={(item: string) => <List.Item>{item}</List.Item>}
    />
  </Modal>
);
