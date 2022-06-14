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

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CollectionsMenu', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when home page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={HOME} />);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when submissions page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={SUBMISSIONS_LITERATURE} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when literature page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={LITERATURE} />);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when jobs page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${JOBS}/12345`} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when conferences page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${CONFERENCES}/5555`} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when authors page', () => {
    const wrapper = shallow(<CollectionsMenu currentPathname={AUTHORS} />);

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when seminars page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${SEMINARS}/1`} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when experiments page', () => {
    const wrapper = shallow(
      <CollectionsMenu currentPathname={`${EXPERIMENTS}/1`} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
