import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import CollectionLink from '../CollectionLink';

describe('CollectionLink', () => {
  it('renders default', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionLink to="/literature" />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders active', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionLink to="/literature" active />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders new', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionLink to="/literature" newCollection />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders active and new', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionLink to="/literature" active newCollection />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
