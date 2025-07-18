import { renderWithRouter } from '../../../../fixtures/render';
import CollectionLink from '../CollectionLink';

describe('CollectionLink', () => {
  it('renders default', () => {
    const { asFragment } = renderWithRouter(
      <CollectionLink to="/literature" />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders active', () => {
    const { asFragment } = renderWithRouter(
      <CollectionLink to="/literature" active />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders new', () => {
    const { asFragment } = renderWithRouter(
      <CollectionLink to="/literature" newCollection />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders active and new', () => {
    const { asFragment } = renderWithRouter(
      <CollectionLink to="/literature" active newCollection />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
