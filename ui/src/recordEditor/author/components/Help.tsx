import { QuestionCircleFilled } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';

function Help() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button
        type="text"
        icon={
          <QuestionCircleFilled style={{ fontSize: '20px', color: 'white' }} />
        }
        onClick={() => setIsModalOpen(true)}
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
        title="Help"
        width={800}
      >
        <div className="pt2">
          All details on the Data Model fields and their mapping to MARC is in{' '}
          <a
            href="https://inspire-schemas.readthedocs.io/en/latest/schemas/index.html"
            target="_blank"
            rel="noreferrer"
          >
            inspire-schemas docs
          </a>
        </div>
      </Modal>
    </>
  );
}

export default Help;
