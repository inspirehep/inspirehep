import { AutoComplete, Button, Form, Modal, Table } from 'antd';
import { useMemo, useState } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { ActionCreator, Action } from 'redux';
import { List, Map } from 'immutable';
import { BulbOutlined } from '@ant-design/icons';
import { columnsShortcut, columnsSubject } from '../containers/columnData';
import { Subject, WorkflowActions, WorkflowStatuses } from '../../constants';
import {
  inspireCategoryOptions,
  inspireCategoryShortcutsMapping,
  inspireCategoryShortcuts,
  inspireCategoryValues,
} from '../../../submissions/common/schemas/constants';
import {
  setSubjectsDraft,
  updateLiteratureAction,
} from '../../../actions/backoffice';
import { notifyActionError } from '../../notifications';

interface SubjectAreaProps {
  workflowId: string;
  status: WorkflowStatuses;
  inspireCategories: Subject[];
  dispatch: ActionCreator<Action>;
  subjectsDraft: List<any> | null;
  actionInProgress: Map<string, any> | null;
  literature: Map<string, any>;
}

const SubjectArea = ({
  workflowId,
  status,
  inspireCategories,
  dispatch,
  subjectsDraft,
  actionInProgress,
  literature,
}: SubjectAreaProps) => {
  const [form] = Form.useForm();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const hasBeenUpdated = subjectsDraft !== null;
  const currentSubjects = useMemo<Subject[]>(
    () => (subjectsDraft?.toJS() as Subject[]) ?? inspireCategories,
    [subjectsDraft, inspireCategories]
  );

  const actionId = actionInProgress?.get?.('id');
  const actionType = actionInProgress?.get?.('type');
  const isUpdating =
    actionType === WorkflowActions.UPDATE && actionId === workflowId;

  const isUpdatable = [
    WorkflowStatuses.APPROVAL,
    WorkflowStatuses.APPROVAL_CORE_SELECTION,
    WorkflowStatuses.APPROVAL_MERGE,
    WorkflowStatuses.MISSING_SUBJECT_FIELDS,
  ].includes(status);

  const getUpdateSubjectsPayload = () => ({
    data: {
      ...(literature?.get('data')?.toJS() ?? {}),
      inspire_categories: currentSubjects,
    },
    status:
      status === WorkflowStatuses.MISSING_SUBJECT_FIELDS &&
      currentSubjects.length > 0
        ? WorkflowStatuses.APPROVAL
        : status,
  });

  const handleCancel = () => dispatch(setSubjectsDraft(null));

  const handleUpdate = () => {
    if (currentSubjects.length === 0) {
      notifyActionError('Missing subjects field');
      return;
    }
    dispatch(updateLiteratureAction(workflowId, getUpdateSubjectsPayload()));
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
              onClick={() =>
                dispatch(
                  setSubjectsDraft(
                    currentSubjects.filter((subject) => subject !== value)
                  )
                )
              }
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
    const currentSubjectsValues = currentSubjects.map(
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
      setSubjectsDraft([
        ...currentSubjects,
        { term: newTerm, source: 'curator' },
      ])
    );
    form.resetFields();
  };

  return (
    <div className="flex flex-column" style={{ gap: '20px' }}>
      {hasBeenUpdated && (
        <div className="flex justify-end w-100" style={{ gap: '8px' }}>
          <Button type="default" onClick={handleCancel} disabled={isUpdating}>
            Cancel changes
          </Button>
          <Button type="primary" onClick={handleUpdate} disabled={isUpdating}>
            Save changes
          </Button>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={currentSubjects}
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
                  if (e.key === 'Enter') {
                    form.submit();
                  }
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
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
  subjectsDraft: state.backoffice.get('subjectsDraft') ?? null,
  actionInProgress: state.backoffice.get('actionInProgress'),
  literature: state.backoffice.get('literature'),
});

export default connect(stateToProps)(SubjectArea);
