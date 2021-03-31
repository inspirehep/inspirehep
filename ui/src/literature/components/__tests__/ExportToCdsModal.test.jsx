import React from 'react';
import { shallow } from 'enzyme';

import ExportToCdsModal from '../ExportToCdsModal';

describe('ExportToCdsModal', () => {
  it('renders modal for one paper', () => {
    const wrapper = shallow(
      <ExportToCdsModal
        onOk={jest.fn()}
        onCancel={jest.fn()}
        visible
        selectionSize={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders not visible', () => {
    const wrapper = shallow(
      <ExportToCdsModal
        onOk={jest.fn()}
        onCancel={jest.fn()}
        selectionSize={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
