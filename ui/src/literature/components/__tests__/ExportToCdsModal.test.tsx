import React from 'react';
import { shallow } from 'enzyme';

import ExportToCdsModal from '../ExportToCdsModal';

<<<<<<< Updated upstream

describe('ExportToCdsModal', () => {
  
  it('renders modal for one paper', () => {
    const wrapper = shallow(
      <ExportToCdsModal
        
        onOk={jest.fn()}
        
=======
describe('ExportToCdsModal', () => {
  it('renders modal for one paper', () => {
    const wrapper = shallow(
      <ExportToCdsModal
        onOk={jest.fn()}
>>>>>>> Stashed changes
        onCancel={jest.fn()}
        visible
        selectionSize={1}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders not visible', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2741) FIXME: Property 'visible' is missing in type '{ onOk: any... Remove this comment to see the full error message
      <ExportToCdsModal
<<<<<<< Updated upstream
        
        onOk={jest.fn()}
        
=======
        onOk={jest.fn()}
>>>>>>> Stashed changes
        onCancel={jest.fn()}
        selectionSize={1}
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
