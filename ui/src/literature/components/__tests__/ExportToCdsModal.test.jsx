import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import ExportToCdsModal from '../ExportToCdsModal';
import { getStore } from '../../../fixtures/store';

describe('ExportToCdsModal', () => {
  beforeAll(() => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  });

  it('renders modal for one paper', () => {
    const { baseElement } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <ExportToCdsModal
            onOk={jest.fn()}
            onCancel={jest.fn()}
            visible
            selectionSize={1}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('renders not visible', () => {
    const { baseElement } = render(
      <ExportToCdsModal
        onOk={jest.fn()}
        onCancel={jest.fn()}
        selectionSize={1}
        visible={false}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });
});
