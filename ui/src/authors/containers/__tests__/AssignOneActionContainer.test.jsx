import { fireEvent, waitFor } from '@testing-library/react';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import AssignOneActionContainer from '../AssignOneActionContainer';

import {
  setAssignDrawerVisibility,
  assignPapers,
  setPublicationSelection,
  clearPublicationSelection,
  unassignPapers,
} from '../../../actions/authors';
import { renderWithProviders } from '../../../fixtures/render';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

vi.mock('../../components/AssignAction', async () => {
  const actual = await vi.importActual('../../components/AssignAction');
  return {
    __esModule: true,
    default: jest.fn((props) => <actual.default {...props} />),
  };
});

vi.mock('../../../actions/authors');
mockActionCreator(setAssignDrawerVisibility);
mockActionCreator(assignPapers);
mockActionCreator(unassignPapers);
mockActionCreator(setPublicationSelection);
mockActionCreator(clearPublicationSelection);

describe('AssignOneActionContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects one paper and dispatches setAssignDrawerVisibility with true on assign to another author', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = renderWithProviders(
      <AssignOneActionContainer recordId={paperRecordId} />,
      { store }
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const assignAnotherOption = getByTestId('assign-another');
      expect(assignAnotherOption).toBeInTheDocument();
      fireEvent.click(assignAnotherOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      setAssignDrawerVisibility(true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches assignPapers', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = renderWithProviders(
      <AssignOneActionContainer recordId={paperRecordId} />,
      { store }
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const assignOption = getByTestId('assign-self');
      expect(assignOption).toBeInTheDocument();
      fireEvent.click(assignOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      assignPapers({ from: 123, to: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('selects one paper and dispatches unassignPapers', async () => {
    const store = getStore();
    const paperRecordId = 12345;
    const { getByTestId } = renderWithProviders(
      <AssignOneActionContainer recordId={paperRecordId} />,
      { store }
    );

    const dropdownTrigger = getByTestId('btn-claim');
    fireEvent.mouseOver(dropdownTrigger);

    await waitFor(() => {
      const unassignOption = getByTestId('unassign');
      expect(unassignOption).toBeInTheDocument();
      fireEvent.click(unassignOption);
    });

    const expectedActions = [
      clearPublicationSelection(),
      setPublicationSelection([paperRecordId], true),
      unassignPapers({ from: 123 }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
