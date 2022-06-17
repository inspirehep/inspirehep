import React from 'react';
import { shallow } from 'enzyme';

import NumberOfResultsWithSelectedItemsNumber from '../NumberOfResultsWithSelectedItemsNumber';

<<<<<<< Updated upstream

describe('NumberOfResultsWithSelectedItemsNumber', () => {
  
=======
describe('NumberOfResultsWithSelectedItemsNumber', () => {
>>>>>>> Stashed changes
  it('renders selected when selected is more than 1', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={25}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders selected when selected is 1', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={1}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('does not render selected when selected is 0', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={0}
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
