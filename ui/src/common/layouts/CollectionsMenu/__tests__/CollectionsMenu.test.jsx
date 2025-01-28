import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollectionsMenu from '../CollectionsMenu';
import {
  HOME,
  LITERATURE,
  JOBS,
  CONFERENCES,
  AUTHORS,
  SUBMISSIONS_LITERATURE,
  SEMINARS,
  EXPERIMENTS,
  DATA,
} from '../../../routes';

describe('CollectionsMenu', () => {
  it('renders when home page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={HOME} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when submissions page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={SUBMISSIONS_LITERATURE} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when literature page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={LITERATURE} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when jobs page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={`${JOBS}/12345`} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when conferences page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={`${CONFERENCES}/5555`} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when authors page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={AUTHORS} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when seminars page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={`${SEMINARS}/1`} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when experiments page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu currentPathname={`${EXPERIMENTS}/1`} />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when data page', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <CollectionsMenu
          currentPathname={`${DATA}/1`}
          canAccessDataCollection
        />
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
