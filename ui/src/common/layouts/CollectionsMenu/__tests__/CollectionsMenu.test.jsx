import { renderWithRouter } from '../../../../fixtures/render';
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
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={HOME} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when submissions page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={SUBMISSIONS_LITERATURE} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when literature page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={LITERATURE} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when jobs page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={`${JOBS}/12345`} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when conferences page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={`${CONFERENCES}/5555`} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when authors page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={AUTHORS} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when seminars page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={`${SEMINARS}/1`} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when experiments page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={`${EXPERIMENTS}/1`} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when data page', () => {
    const { asFragment } = renderWithRouter(
      <CollectionsMenu currentPathname={`${DATA}/1`} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
