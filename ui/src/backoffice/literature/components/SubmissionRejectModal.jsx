import React, { useEffect, useState } from 'react';
import { Input, Modal, Select, Typography } from 'antd';

import { CONTENT_POLICY_URL } from '../../../common/constants';

const { TextArea } = Input;
const REJECTION_REASON_MAX_LENGTH = 1500;

const buildSubmissionReasons = (submissionContext) => {
  const { email, title } = submissionContext;

  return [
    {
      title: 'Rejection',
      content: `Dear ${email},

Thanks for suggesting "${title}".

We regret to inform you that we cannot include it in our database as it is outside the focus of INSPIRE.
For details please check our collection policy at: ${CONTENT_POLICY_URL}.
Thanks again for collaborating with INSPIRE! We are looking forward to further suggestions you might have.`,
    },
    {
      title: 'Duplicate',
      content: `Dear ${email},

Thanks for suggesting "${title}".
We already have it in our database, you can find it here: https://inspirehep.net/literature/INSERT_RECID.

Thanks again for collaborating with INSPIRE! We are looking forward to further suggestions you might have.`,
    },
    {
      title: 'Will be harvested',
      content: `Dear ${email},

Thanks for suggesting "${title}".
This article was published in a journal that we harvest automatically as part of our regular workflow.
It is still in the queue of papers being processed and should appear in the coming weeks.

Thanks again for collaborating with INSPIRE! We are looking forward to further suggestions you might have.`,
    },
  ];
};

const SubmissionRejectModal = ({
  open,
  onCancel,
  onReject,
  submissionContext,
}) => {
  const { email, title } = submissionContext;
  const reasons = buildSubmissionReasons({ email, title });
  const [reasonIndex, setReasonIndex] = useState(0);
  const initialReason = reasons[0].content;
  const [reason, setReason] = useState(initialReason);

  useEffect(() => {
    if (!open) {
      setReasonIndex(0);
      setReason(initialReason);
    }
  }, [open, initialReason]);

  const handleTemplateChange = (index) => {
    setReasonIndex(index);
    setReason(reasons[index].content);
  };

  return (
    <Modal
      title="Reason for rejection"
      open={open}
      onCancel={onCancel}
      onOk={() => onReject(reason)}
      okText="Reject"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <Typography.Paragraph>
        Explain why this was rejected (is sent directly to user):
      </Typography.Paragraph>
      <TextArea
        id="reject-reason"
        rows={10}
        value={reason}
        maxLength={REJECTION_REASON_MAX_LENGTH}
        showCount
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="mt3">
        <Typography.Text>Select template:</Typography.Text>
        <Select
          className="w-100 mt2"
          value={reasonIndex}
          options={reasons.map((item, index) => ({
            label: item.title,
            value: index,
          }))}
          onChange={handleTemplateChange}
        />
      </div>
    </Modal>
  );
};

export default SubmissionRejectModal;
