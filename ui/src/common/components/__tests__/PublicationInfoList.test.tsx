import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PublicationInfoList from '../PublicationInfoList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PublicationInfoList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with publicationInfo', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList publicationInfo={publicationInfo} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without label if labeled false', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList labeled={false} publicationInfo={publicationInfo} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with wrapperClassName', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName="test"
        publicationInfo={publicationInfo}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
