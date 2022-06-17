import React from 'react';
import { shallow } from 'enzyme';
import ExportToCdsModal from '../ExportToCdsModal';
import ToolAction from '../ToolAction';

<<<<<<< Updated upstream

jest.mock('react-router-dom', () => ({
  
=======
jest.mock('react-router-dom', () => ({
>>>>>>> Stashed changes
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

<<<<<<< Updated upstream

describe('ToolAction', () => {
  
  it('renders', () => {
    const wrapper = shallow(
      <ToolAction
        
        onAssignToConference={jest.fn()}
        
=======
describe('ToolAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={jest.fn()}
>>>>>>> Stashed changes
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders disabled', () => {
    const wrapper = shallow(
      <ToolAction
        
        onAssignToConference={jest.fn()}
        disabledBulkAssign
        
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={jest.fn()}
        disabledBulkAssign
>>>>>>> Stashed changes
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onAssignToConference on assign-conference click ', () => {
    
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssignToConference on assign-conference click ', () => {
>>>>>>> Stashed changes
    const onAssignToConference = jest.fn();
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={onAssignToConference}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    wrapper.find('[data-test-id="assign-conference"]').simulate('click');
<<<<<<< Updated upstream
    
    expect(onAssignToConference).toHaveBeenCalled();
  });

  
  it('opens modal on export-to-CDS click ', () => {
    
    const onAssignToConference = jest.fn();
    
=======
    expect(onAssignToConference).toHaveBeenCalled();
  });

  it('opens modal on export-to-CDS click ', () => {
    const onAssignToConference = jest.fn();
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(exportToCdsModal.prop('visible')).toBe(true);
  });
});
