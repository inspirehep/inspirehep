import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ThesisInfo from '../ThesisInfo';

<<<<<<< Updated upstream

describe('ThesisInfo', () => {
  
=======
describe('ThesisInfo', () => {
>>>>>>> Stashed changes
  it('renders full thesis info', () => {
    const thesisInfo = fromJS({
      degreeType: 'phd',
      date: '11-11-2011',
      defense_date: '12-12-2012',
      institutions: [
        {
          name: 'Institution 1',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with defense date', () => {
    const thesisInfo = fromJS({
      date: '11-11-2011',
      defense_date: '12-12-2012',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with date and without defense date', () => {
    const thesisInfo = fromJS({
      date: '11-11-2011',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders without any date', () => {
    const thesisInfo = fromJS({
      institutions: [
        {
          name: 'Institution 1',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders empty if null', () => {
    const wrapper = shallow(<ThesisInfo />);
    
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if null', () => {
    const wrapper = shallow(<ThesisInfo />);
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
