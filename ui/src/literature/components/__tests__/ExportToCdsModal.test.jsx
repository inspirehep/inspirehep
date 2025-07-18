import React from 'react';
import { render } from '@testing-library/react';

import { renderWithProviders } from '../../../fixtures/render';
import ExportToCdsModal from '../ExportToCdsModal';

describe('ExportToCdsModal', () => {
  beforeAll(() => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  });

  it('renders modal for one paper', () => {
    const { baseElement } = renderWithProviders(
      <ExportToCdsModal
        onOk={jest.fn()}
        onCancel={jest.fn()}
        visible
        selectionSize={1}
      />
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
