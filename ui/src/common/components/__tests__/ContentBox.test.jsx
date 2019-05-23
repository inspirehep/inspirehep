import React from 'react';
import { shallow } from 'enzyme';

import ContentBox from '../ContentBox';

describe('ContentBox', () => {
  it('renders ContentBox with actions and title without loading', () => {
    const wrapper = shallow(
      <ContentBox title="Jessica Jones" actions={[<h2 key="pi">PI</h2>]}>
        <div>Defenders</div>
      </ContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders ContentBox with actions and title with loading', () => {
    const wrapper = shallow(
      <ContentBox
        title="Jessica Jones"
        loading
        actions={[<h1 key="pi">PI</h1>]}
      >
        <div>Defenders</div>
      </ContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders ContentBox with actions', () => {
    const wrapper = shallow(
      <ContentBox actions={[<h2 key="pi">PI</h2>]}>
        <div>Defenders</div>
      </ContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders ContentBox without actions', () => {
    const wrapper = shallow(
      <ContentBox>
        <div>Defenders</div>
      </ContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders ContentBox with subTitle and className', () => {
    const wrapper = shallow(
      <ContentBox subTitle="Lame" className="pa3">
        <div>Defenders</div>
      </ContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render ContentBox without children', () => {
    const wrapper = shallow(<ContentBox actions={[<h2 key="pi">PI</h2>]} />);
    expect(wrapper).toMatchSnapshot();
  });
});
