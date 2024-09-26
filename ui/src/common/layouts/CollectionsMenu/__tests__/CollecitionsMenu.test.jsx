import React from 'react';
import { shallow } from 'enzyme';

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
} from '../../../routes';

describe('CollectionsMenu', () => {
  it('renders when home page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={HOME} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when submissions page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={SUBMISSIONS_LITERATURE} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when literature page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={LITERATURE} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when jobs page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${JOBS}/12345`} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when conferences page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${CONFERENCES}/5555`} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when authors page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={AUTHORS} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when seminars page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${SEMINARS}/1`} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders when experiments page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${EXPERIMENTS}/1`} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
