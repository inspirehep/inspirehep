import React from 'react';
import { shallow } from 'enzyme';
import { Modal, Button } from 'antd';

import CiteModalAction from '../CiteModalAction';
import citeArticle from '../../citeArticle';
import SelectBox from '../../../common/components/SelectBox';
import ListItemAction from '../../../common/components/ListItemAction';
import { CITE_FORMAT_VALUES } from '../../constants';

<<<<<<< Updated upstream

jest.mock('../../citeArticle');


=======
jest.mock('../../citeArticle');

>>>>>>> Stashed changes
describe('CiteModalAction', () => {
  beforeAll(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
    citeArticle.mockImplementation(
      (format: any, recordId: any) => `Cite ${recordId} in ${format}`
    );
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('renders with all props', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
<<<<<<< Updated upstream
        
        onCiteFormatChange={jest.fn()}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onCiteFormatChange on format change', () => {
    
=======
        onCiteFormatChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCiteFormatChange on format change', () => {
>>>>>>> Stashed changes
    const onCiteFormatChangeProp = jest.fn();
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={CITE_FORMAT_VALUES[0]}
        onCiteFormatChange={onCiteFormatChangeProp}
      />
    );
    wrapper.find(SelectBox).prop('onChange')(CITE_FORMAT_VALUES[1]);
<<<<<<< Updated upstream
    
    expect(onCiteFormatChangeProp).toHaveBeenCalledWith(CITE_FORMAT_VALUES[1]);
  });

  
=======
    expect(onCiteFormatChangeProp).toHaveBeenCalledWith(CITE_FORMAT_VALUES[1]);
  });

>>>>>>> Stashed changes
  it('sets modalVisible true on cite click and calls setCiteContentFor with initialCiteFormat if first time', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
<<<<<<< Updated upstream
        
        onCiteFormatChange={jest.fn()}
      />
    );
    
=======
        onCiteFormatChange={jest.fn()}
      />
    );
>>>>>>> Stashed changes
    const setCiteContentFor = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setCiteContentFor' does not exist on typ... Remove this comment to see the full error message
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCiteClick();
<<<<<<< Updated upstream
    
    expect(wrapper.state('modalVisible')).toBe(true);
    
    expect(setCiteContentFor).toHaveBeenCalledWith(initialCiteFormat);
  });

  
=======
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(setCiteContentFor).toHaveBeenCalledWith(initialCiteFormat);
  });

>>>>>>> Stashed changes
  it('sets modalVisible true on cite click but does not call setCiteContentFor if citeContent is present', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
<<<<<<< Updated upstream
        
        onCiteFormatChange={jest.fn()}
      />
    );
    
=======
        onCiteFormatChange={jest.fn()}
      />
    );
>>>>>>> Stashed changes
    const setCiteContentFor = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setCiteContentFor' does not exist on typ... Remove this comment to see the full error message
    wrapper.instance().setCiteContentFor = setCiteContentFor;
    wrapper.setState({ citeContent: 'CONTENT' });
    wrapper.update();
    const onCiteClick = wrapper
      .find(ListItemAction)
      .find(Button)
      .prop('onClick');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCiteClick();
<<<<<<< Updated upstream
    
    expect(wrapper.state('modalVisible')).toBe(true);
    
    expect(setCiteContentFor).not.toHaveBeenCalled();
  });

  
=======
    expect(wrapper.state('modalVisible')).toBe(true);
    expect(setCiteContentFor).not.toHaveBeenCalled();
  });

>>>>>>> Stashed changes
  it('shows an alert with the error message when there is an error in setCiteContentFor', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCiteFormatChange={jest.fn()}
      />
    );
    const errorMessage = 'There is an error';
    wrapper.setState({ errorMessage });
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('sets citeContent for selected format setCiteContentFor', async () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCiteFormatChange={jest.fn()}
      />
    );
    const setCiteContentFor = wrapper.find(SelectBox).prop('onChange');
    await setCiteContentFor('application/vnd+inspire.latex.us+x-latex');
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.state('citeContent')).toEqual(
      'Cite 12345 in application/vnd+inspire.latex.us+x-latex'
    );
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('sets modalVisible false onModalCancel', () => {
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCiteFormatChange={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'modalVisible' does not exist on type 'Re... Remove this comment to see the full error message
    wrapper.instance().state.modalVisible = true;
    wrapper.update();
    const onModalCancel = wrapper.find(Modal).prop('onCancel');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onModalCancel();
<<<<<<< Updated upstream
    
    expect(wrapper.state('modalVisible')).toBe(false);
  });

  
=======
    expect(wrapper.state('modalVisible')).toBe(false);
  });

>>>>>>> Stashed changes
  it('renders with loading', () => {
    const initialCiteFormat = 'application/x-bibtex';
    const wrapper = shallow(
      <CiteModalAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ recordId: number; initialCiteFormat: strin... Remove this comment to see the full error message
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onCiteFormatChange={jest.fn()}
      />
    );
    wrapper.setState({ loading: true });
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
