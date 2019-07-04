import React from 'react';
import { shallow } from 'enzyme';

import StatusField from '../StatusField';

describe('StatusField', () => {
  it('renders if not update submissions and not cataloger', () => {
    const wrapper = shallow(
      <StatusField isUpdateSubmission={false} isCatalogerLoggedIn={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders if update submissions but not cataloger', () => {
    const wrapper = shallow(
      <StatusField isUpdateSubmission isCatalogerLoggedIn={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders if update submissions and cataloger', () => {
    const wrapper = shallow(
      <StatusField isUpdateSubmission isCatalogerLoggedIn />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders if not update submissions but cataloger', () => {
    const wrapper = shallow(
      <StatusField isUpdateSubmission={false} isCatalogerLoggedIn />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
