import React from 'react';
import { shallow } from 'enzyme';
import ExportToCdsModal from '../ExportToCdsModal';
import ToolAction from '../ToolAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('ToolAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={jest.fn()}
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={jest.fn()}
        disabledBulkAssign
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssignToConference on assign-conference click ', () => {
    const onAssignToConference = jest.fn();
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={onAssignToConference}
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    wrapper.find('[data-test-id="assign-conference"]').simulate('click');
    expect(onAssignToConference).toHaveBeenCalled();
  });

  it('opens modal on export-to-CDS click ', () => {
    const onAssignToConference = jest.fn();
    const onExportToCds = jest.fn();
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={onAssignToConference}
        onExportToCds={onExportToCds}
        selectionSize={3}
      />
    );
    wrapper.find('[data-test-id="export-to-CDS"]').simulate('click');
    const exportToCdsModal = wrapper.find(ExportToCdsModal);
    expect(exportToCdsModal.prop('visible')).toBe(true);
  });
});
