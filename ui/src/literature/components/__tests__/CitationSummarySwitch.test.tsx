import React from 'react';
import { shallow, mount } from 'enzyme';
import { Switch } from 'antd';

import CitationSummarySwitch from '../CitationSummarySwitch';

<<<<<<< Updated upstream

describe('CitationSummarySwitch', () => {
  
=======
describe('CitationSummarySwitch', () => {
>>>>>>> Stashed changes
  it('renders checked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked
<<<<<<< Updated upstream
        
        onChange={jest.fn()}
        
=======
        onChange={jest.fn()}
>>>>>>> Stashed changes
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders unchecked', () => {
    const wrapper = shallow(
      <CitationSummarySwitch
        checked={false}
<<<<<<< Updated upstream
        
        onChange={jest.fn()}
        
=======
        onChange={jest.fn()}
>>>>>>> Stashed changes
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference={false}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onCitationSummaryUserPreferenceChange on mount', () => {
    
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCitationSummaryUserPreferenceChange on mount', () => {
>>>>>>> Stashed changes
    const onCitationSummaryUserPreferenceChange = jest.fn();
    mount(
      <CitationSummarySwitch
        checked={false}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={
          onCitationSummaryUserPreferenceChange
        }
        citationSummaryEnablingPreference
      />
    );
<<<<<<< Updated upstream
    
    expect(onCitationSummaryUserPreferenceChange).toHaveBeenCalledWith(true);
  });

  
  it('calls onChange on switch change', () => {
    
=======
    expect(onCitationSummaryUserPreferenceChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange on switch change', () => {
>>>>>>> Stashed changes
    const onChange = jest.fn();

    const wrapper = shallow(
      <CitationSummarySwitch
        checked
        onChange={onChange}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
