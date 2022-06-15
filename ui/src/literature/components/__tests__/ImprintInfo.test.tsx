import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ImprintInfo from '../ImprintInfo';

<<<<<<< Updated upstream

describe('ImprintInfo', () => {
  
=======
describe('ImprintInfo', () => {
>>>>>>> Stashed changes
  it('renders imprints with date', () => {
    const imprint = fromJS([
      {
        date: '2004',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with place', () => {
    const imprint = fromJS([
      {
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with publisher', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with date and publisher', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with date and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with publisher and place', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders imprints with date, publisher, and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });
>>>>>>> Stashed changes
  it('renders multiple imprints', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
      {
        date: '2010',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });

  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders date with month and day', () => {
    const imprint = fromJS([
      {
        date: '2018-06-17',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
