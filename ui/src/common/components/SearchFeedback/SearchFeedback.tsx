import React, { useState, CSSProperties } from 'react';
import { Card, Modal, Form, Input, message, Typography } from 'antd';
import { useForm, useWatch } from 'antd/lib/form/Form';
import { getClientId, trackEvent } from '../../../tracker';
import http from '../../http';

const { TextArea } = Input;

const SearchFeedback = ({ style }: { style?: CSSProperties }) => {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [form] = useForm();

  const question = useWatch('question', form);

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      await http.post('/ai/v1/search-feedback', {
        ...values,
        matomo_client_id: getClientId(),
      });

      message.success({
        content:
          'Thank you for your feedback! Your input helps us improve INSPIRE',
        duration: 4,
      });
      setFeedbackModalVisible(false);
      form.resetFields();
      trackEvent('Feedback modal', 'Submit', `Comment: ${values.question}`);
    } catch (error) {
      message.error({
        content:
          'An error occurred while submitting your feedback. Please try again later.',
        duration: 4,
      });
    }
  };

  const handleCancel = () => {
    setFeedbackModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Modal
        title="INSPIRE Search Feedback"
        open={feedbackModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Submit"
        okButtonProps={{
          disabled: !question?.trim(),
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="question"
            label="Explain in one sentence which specific question you want to answer through your search"
            rules={[
              { required: true, message: 'Please provide your feedback' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="How does the Higgs Boson interact with other particles?"
            />
          </Form.Item>
          <Form.Item
            name="additional"
            label="Provide additional information if needed"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
        <Typography.Text
          type="secondary"
          style={{
            fontSize: '12px',
            display: 'block',
            textAlign: 'center',
          }}
        >
          The INSPIRE team will take all feedback into consideration for ongoing
          improvement efforts to the INSPIRE search experience
        </Typography.Text>
      </Modal>
      <Card
        style={{
          textAlign: 'center',
          backgroundColor: '#e6f7ff',
          cursor: 'pointer',
          ...style,
        }}
        bodyStyle={{ padding: 12 }}
        onClick={() => setFeedbackModalVisible(true)}
      >
        <Typography.Text strong style={{ color: '#1890ff' }}>
          Not finding what you are looking for?
        </Typography.Text>
        <br />
        <Typography.Text style={{ color: '#595959' }}>
          Please click here to give us some quick information about your query
          and help us improve!
        </Typography.Text>
      </Card>
    </>
  );
};

export default SearchFeedback;
