import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PublicationInfoList from '../PublicationInfoList';

describe('PublicationInfoList', () => {
  it('renders with publicationInfo', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList publicationInfo={publicationInfo} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders without label if labeled false', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList labeled={false} publicationInfo={publicationInfo} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with wrapperClassName', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const wrapper = shallow(
      <PublicationInfoList
        wrapperClassName="test"
        publicationInfo={publicationInfo}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
