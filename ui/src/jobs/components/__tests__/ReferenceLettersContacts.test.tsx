import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ReferenceLettersContacts from '../ReferenceLettersContacts';


describe('ReferenceLettersContacts', () => {
  
  it('renders with referenceLetters', () => {
    const referenceLetters = fromJS({
      urls: [
        { value: 'https://qa.inspirehep.net' },
        { value: 'www.google.com', description: 'Google' },
      ],
      emails: ['awi_moni@yahoo.com', 'mariahmoni@gmail.com'],
    });
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <ReferenceLettersContacts referenceLetters={referenceLetters} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
