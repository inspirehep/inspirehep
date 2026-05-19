import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromJS, Map } from 'immutable';
import { WorkflowStatuses } from '../../../constants';
import SubjectArea from '../SubjectArea';
import { renderWithProviders } from '../../../../fixtures/render';
import { initialState as backofficeInitialState } from '../../../../reducers/backoffice';
import { BACKOFFICE_SET_SUBJECTS } from '../../../../actions/actionTypes';
import { updateLiteratureAction } from '../../../../actions/backoffice';
import { notifyActionError } from '../../../notifications';

jest.mock('../../../../actions/backoffice', () => ({
  ...jest.requireActual('../../../../actions/backoffice'),
  updateLiteratureAction: jest.fn(),
}));

jest.mock('../../../notifications', () => ({
  notifyActionError: jest.fn(),
}));

const defaultProps = {
  workflowId: 'test-workflow-id',
  inspireCategories: [{ term: 'Astrophysics', source: 'curator' }],
};

const getInitialState = (backofficeOverrides: Record<string, any> = {}) => ({
  backoffice: (backofficeInitialState as Map<string, any>).merge(
    fromJS(backofficeOverrides)
  ),
});

const updatableStatuses = [
  WorkflowStatuses.APPROVAL,
  WorkflowStatuses.APPROVAL_CORE_SELECTION,
  WorkflowStatuses.APPROVAL_MERGE,
  WorkflowStatuses.MISSING_SUBJECT_FIELDS,
];

const nonUpdatableStatuses = [
  WorkflowStatuses.APPROVAL_FUZZY_MATCHING,
  WorkflowStatuses.BLOCKED,
  WorkflowStatuses.COMPLETED,
  WorkflowStatuses.ERROR,
  WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES,
  WorkflowStatuses.ERROR_VALIDATION,
  WorkflowStatuses.PROCESSING,
  WorkflowStatuses.RUNNING,
];

describe('SubjectArea', () => {
  it.each(nonUpdatableStatuses)(
    'should not display remove buttons and adding subject form if workflow status is %s',
    (status) => {
      renderWithProviders(<SubjectArea {...defaultProps} status={status} />, {
        initialState: getInitialState(),
      });

      expect(
        screen.queryByRole('button', { name: /remove/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /add/i })
      ).not.toBeInTheDocument();
    }
  );

  it.each(updatableStatuses)(
    'should display remove buttons and adding subject form if workflow status is %s',
    (status) => {
      renderWithProviders(<SubjectArea {...defaultProps} status={status} />, {
        initialState: getInitialState(),
      });

      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    }
  );

  it('should show Save/Cancel buttons when subjectsDraft is set', () => {
    renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      {
        initialState: getInitialState({
          subjectsDraft: [{ term: 'Astrophysics', source: 'curator' }],
        }),
      }
    );

    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cancel changes/i })
    ).toBeInTheDocument();
  });

  it('should not show Save/Cancel buttons when subjectsDraft is null', () => {
    renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      { initialState: getInitialState({ subjectsDraft: null }) }
    );

    expect(
      screen.queryByRole('button', { name: /save changes/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancel changes/i })
    ).not.toBeInTheDocument();
  });

  it('should dispatch setSubjectsDraft without removed subject on remove click', async () => {
    const subjects = [
      { term: 'Astrophysics', source: 'curator' },
      { term: 'Nuclear Physics', source: 'curator' },
    ];
    const { store } = renderWithProviders(
      <SubjectArea
        {...defaultProps}
        status={WorkflowStatuses.APPROVAL}
        inspireCategories={subjects}
      />,
      { initialState: getInitialState() }
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    expect(store.getActions()).toContainEqual({
      type: BACKOFFICE_SET_SUBJECTS,
      payload: [subjects[1]],
    });
  });

  it('should dispatch setSubjectsDraft with new subject on add', async () => {
    const { store } = renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      { initialState: getInitialState() }
    );

    await userEvent.type(screen.getByRole('combobox'), 'Theory-HEP');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(store.getActions()).toContainEqual({
      type: BACKOFFICE_SET_SUBJECTS,
      payload: [
        ...defaultProps.inspireCategories,
        { term: 'Theory-HEP', source: 'curator' },
      ],
    });
  });

  it('should dispatch setSubjectsDraft with resolved shortcut term on add', async () => {
    const { store } = renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      { initialState: getInitialState() }
    );

    await userEvent.type(screen.getByRole('combobox'), 't');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(store.getActions()).toContainEqual({
      type: BACKOFFICE_SET_SUBJECTS,
      payload: [
        ...defaultProps.inspireCategories,
        { term: 'Theory-HEP', source: 'curator' },
      ],
    });
  });

  it('should not be possible to add the same subject twice', async () => {
    renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      { initialState: getInitialState() }
    );

    await userEvent.type(screen.getByRole('combobox'), 'Astrophysics');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(
      await screen.findByText(/astrophysics is already in the list/i)
    ).toBeInTheDocument();
  });

  it('should not be possible to add invalid subject', async () => {
    renderWithProviders(
      <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
      { initialState: getInitialState() }
    );

    await userEvent.type(screen.getByRole('combobox'), 'InvalidSubject');
    await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(
      await screen.findByText(/invalidsubject is not a valid subject/i)
    ).toBeInTheDocument();
  });

  describe('save and cancel actions', () => {
    beforeEach(() => {
      (updateLiteratureAction as jest.Mock).mockImplementation((...args) => ({
        type: 'updateLiteratureAction',
        payload: args,
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should save changes on click when subjects has been updated', async () => {
      const updatedCategories = [
        { term: 'Nuclear Physics', source: 'curator' },
      ];
      renderWithProviders(
        <SubjectArea
          {...defaultProps}
          status={WorkflowStatuses.APPROVAL_CORE_SELECTION}
        />,
        {
          initialState: getInitialState({ subjectsDraft: updatedCategories }),
        }
      );

      await userEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        defaultProps.workflowId,
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: updatedCategories,
          }),
          status: WorkflowStatuses.APPROVAL_CORE_SELECTION,
        })
      );
    });

    it('should cancel changes on click when subjects has been updated', async () => {
      const updatedCategories = [
        { term: 'Nuclear Physics', source: 'curator' },
      ];
      const { store } = renderWithProviders(
        <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
        {
          initialState: getInitialState({ subjectsDraft: updatedCategories }),
        }
      );

      await userEvent.click(
        screen.getByRole('button', { name: /cancel changes/i })
      );

      expect(store.getActions()).toContainEqual({
        type: BACKOFFICE_SET_SUBJECTS,
        payload: null,
      });
      expect(updateLiteratureAction).not.toHaveBeenCalled();
    });

    it('should update status when saving subjects on missing subjects field workflow', async () => {
      const updatedCategories = [{ term: 'Theory-HEP', source: 'curator' }];
      renderWithProviders(
        <SubjectArea
          workflowId={defaultProps.workflowId}
          status={WorkflowStatuses.MISSING_SUBJECT_FIELDS}
          inspireCategories={[]}
        />,
        {
          initialState: getInitialState({ subjectsDraft: updatedCategories }),
        }
      );

      await userEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        defaultProps.workflowId,
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: updatedCategories,
          }),
          status: WorkflowStatuses.APPROVAL,
        })
      );
    });

    it("shouldn't save subjects if subjects field is empty", async () => {
      renderWithProviders(
        <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
        { initialState: getInitialState({ subjectsDraft: [] }) }
      );

      await userEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );

      expect(notifyActionError).toHaveBeenCalledWith('Missing subjects field');
      expect(updateLiteratureAction).not.toHaveBeenCalled();
    });
  });
});
