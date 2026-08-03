import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromJS, Map } from 'immutable';
import {
  statusesWithUpdatableSubjects,
  WorkflowStatuses,
} from '../../../constants';
import SubjectArea from '../SubjectArea';
import { renderWithProviders } from '../../../../fixtures/render';
import { initialState as backofficeInitialState } from '../../../../reducers/backoffice';
import { updateLiteratureAction } from '../../../../actions/backoffice';
import { notifyActionError } from '../../../notifications';

vi.mock('../../../../actions/backoffice', async () => {
  const actual = await vi.importActual('../../../../actions/backoffice');
  return {
    ...(actual as object),
    updateLiteratureAction: vi.fn(),
  };
});

vi.mock('../../../notifications', () => ({
  notifyActionError: vi.fn(),
}));

const defaultProps = {
  workflowId: 'test-workflow-id',
  inspireCategories: [{ term: 'Astrophysics', source: 'curator' }],
  disableActions: false,
};

const getInitialState = (backofficeOverrides: Record<string, any> = {}) => ({
  backoffice: (backofficeInitialState as Map<string, any>).merge(
    fromJS(backofficeOverrides)
  ),
});

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

  it.each(statusesWithUpdatableSubjects)(
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

  describe('update actions', () => {
    beforeEach(() => {
      (updateLiteratureAction as jest.Mock).mockImplementation((...args) => ({
        type: 'updateLiteratureAction',
        payload: args,
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should dispatch updateLiteratureAction without removed subject on remove click', async () => {
      const subjects = [
        { term: 'Astrophysics', source: 'curator' },
        { term: 'Nuclear Physics', source: 'curator' },
      ];
      renderWithProviders(
        <SubjectArea
          {...defaultProps}
          status={WorkflowStatuses.APPROVAL}
          inspireCategories={subjects}
        />,
        { initialState: getInitialState() }
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await userEvent.click(removeButtons[0]);

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        defaultProps.workflowId,
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: [
              { term: 'Nuclear Physics', source: 'curator' },
            ],
          }),
        })
      );
    });

    it('should dispatch updateLiteratureAction with new subject on add', async () => {
      renderWithProviders(
        <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
        { initialState: getInitialState() }
      );

      await userEvent.type(screen.getByRole('combobox'), 'Theory-HEP');
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        defaultProps.workflowId,
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: [
              ...defaultProps.inspireCategories,
              { term: 'Theory-HEP', source: 'curator' },
            ],
          }),
        })
      );
    });

    it('should dispatch updateLiteratureAction with resolved shortcut term on add', async () => {
      renderWithProviders(
        <SubjectArea {...defaultProps} status={WorkflowStatuses.APPROVAL} />,
        { initialState: getInitialState() }
      );

      await userEvent.type(screen.getByRole('combobox'), 't');
      await userEvent.click(screen.getByRole('button', { name: /^add$/i }));

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        defaultProps.workflowId,
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: [
              ...defaultProps.inspireCategories,
              { term: 'Theory-HEP', source: 'curator' },
            ],
          }),
        })
      );
    });

    it("shouldn't remove last subject", async () => {
      renderWithProviders(
        <SubjectArea
          {...defaultProps}
          status={WorkflowStatuses.APPROVAL}
          inspireCategories={[{ term: 'Nuclear Physics', source: 'curator' }]}
        />,
        { initialState: getInitialState() }
      );

      await userEvent.click(screen.getByRole('button', { name: /remove/i }));

      expect(notifyActionError).toHaveBeenCalledWith(
        'Cannot have empty subjects field'
      );
      expect(updateLiteratureAction).not.toHaveBeenCalled();
    });
  });
});
