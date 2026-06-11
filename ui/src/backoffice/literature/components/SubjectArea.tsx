import { AutoComplete, Button, Form, Modal, Table } from 'antd';
import React, { useState } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { ActionCreator, Action } from 'redux';
import { Map } from 'immutable';
import { BulbOutlined } from '@ant-design/icons';
import { columnsShortcut, columnsSubject } from '../containers/columnData';
import {
  statusesWithUpdatableSubjects,
  Subject,
  WorkflowStatuses,
} from '../../constants';
import {
  inspireCategoryOptions,
  inspireCategoryShortcutsMapping,
  inspireCategoryShortcuts,
  inspireCategoryValues,
} from '../../../submissions/common/schemas/constants';
import { updateLiteratureAction } from '../../../actions/backoffice';
import { notifyActionError } from '../../notifications';

interface SubjectAreaProps {
  workflowId: string;
  status: WorkflowStatuses;
  inspireCategories: Subject[];
  dispatch: ActionCreator<Action>;
  literature: Map<string, any>;
  disableActions: boolean;
}

const SubjectArea = ({
  workflowId,
  status,
  inspireCategories,
  dispatch,
  literature,
  disableActions,
}: SubjectAreaProps) => {
  const [form] = Form.useForm();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const isUpdatable = statusesWithUpdatableSubjects.includes(status);

  const removeSubject = (subjectToRemove: Subject) => {
    if (inspireCategories.length === 1) {
      notifyActionError('Cannot have empty subjects field');
      return;
    }
    dispatch(
      updateLiteratureAction(workflowId, {
        data: {
          ...(literature?.get('data')?.toJS() ?? {}),
          inspire_categories: inspireCategories.filter(
            (subject) => subject !== subjectToRemove
          ),
        },
      })
    );
  };

  const columns = isUpdatable
    ? [
        ...columnsSubject,
        {
          title: 'Action',
          key: 'action',
          render: (value: Subject) => (
            <Button
              type="link"
              onClick={() => removeSubject(value)}
              disabled={disableActions}
            >
              Remove
            </Button>
          ),
        },
      ]
    : columnsSubject;

  const validateMessages = {
    required: 'Subject is required!',
  };

  const subjectIsInspireCategory = async (value: string) => {
    if (
      inspireCategoryValues.includes(value) ||
      inspireCategoryShortcuts.includes(value)
    ) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`${value} is not a valid subject`));
  };

  const subjectIsNotAlreadyInTheList = async (value: string) => {
    const currentSubjectsValues = inspireCategories.map(
      (subject) => subject.term
    );
    if (currentSubjectsValues.includes(value)) {
      return Promise.reject(new Error(`${value} is already in the list`));
    }
    const matched = (inspireCategoryShortcutsMapping as Record<string, string>)[
      value
    ];
    if (matched && currentSubjectsValues.includes(matched)) {
      return Promise.reject(new Error(`${matched} is already in the list`));
    }
    return Promise.resolve();
  };

  const handleSubmitNewSubject = (value: { newSubject: string }) => {
    const matched = (inspireCategoryShortcutsMapping as Record<string, string>)[
      value.newSubject
    ];
    const newTerm = matched || value.newSubject;
    if (matched) form.setFieldValue('newSubject', matched);
    dispatch(
      updateLiteratureAction(workflowId, {
        data: {
          ...(literature?.get('data')?.toJS() ?? {}),
          inspire_categories: [
            ...inspireCategories,
            { term: newTerm, source: 'curator' },
          ],
        },
      })
    );

    form.resetFields();
  };

  return (
    <div className="flex flex-column" style={{ gap: '20px' }}>
      <Table
        columns={columns}
        dataSource={inspireCategories}
        pagination={false}
        size="small"
        rowKey={(record) => record.term}
      />
      {isUpdatable && (
        <div className="flex flex-column" style={{ gap: '2px' }}>
          <span className="gray i flex items-center" style={{ gap: '4px' }}>
            <BulbOutlined />
            Hint: use{' '}
            <Button
              type="link"
              size="small"
              style={{ padding: '0px' }}
              onClick={() => setIsShortcutsModalOpen(true)}
            >
              shortcuts
            </Button>{' '}
            to add subject (eg: submit &quot;a&quot; to add
            &quot;Astrophysics&quot;).
          </span>
          <Modal
            title="Shortcuts"
            open={isShortcutsModalOpen}
            onCancel={() => setIsShortcutsModalOpen(false)}
            footer={null}
          >
            <Table
              columns={columnsShortcut}
              dataSource={Object.entries(inspireCategoryShortcutsMapping).map(
                ([shortcut, subject]) => ({ subject, shortcut })
              )}
              pagination={false}
              size="small"
              rowKey={(record) => record.shortcut}
              scroll={{ y: '50vh' }}
            />
          </Modal>
          <Form
            layout="inline"
            onFinish={handleSubmitNewSubject}
            validateMessages={validateMessages}
            form={form}
            className="w-100"
          >
            <Form.Item
              name="newSubject"
              rules={[
                { required: true },
                () => ({
                  validator(_, value) {
                    return subjectIsInspireCategory(value);
                  },
                }),
                () => ({
                  validator(_, value) {
                    return subjectIsNotAlreadyInTheList(value);
                  },
                }),
              ]}
              validateTrigger={[]}
              style={{ flex: 1 }}
              className="w-100"
            >
              <AutoComplete
                options={inspireCategoryOptions}
                placeholder="Select a subject"
                filterOption={(input: string, option: { value: string }) =>
                  option.value.toLowerCase().includes(input.toLowerCase())
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' && !disableActions) {
                    form.submit();
                  }
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={disableActions}
              >
                Add
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  literature: state.backoffice.get('literature'),
});

export default connect(stateToProps)(SubjectArea);
