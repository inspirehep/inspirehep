import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceItem from '../ReferenceItem';

<<<<<<< Updated upstream

describe('ReferenceItem', () => {
  
=======
describe('ReferenceItem', () => {
>>>>>>> Stashed changes
  it('renders with full reference', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      arxiv_eprints: [{ value: '123456' }],
      control_number: 12345,
      label: 123,
      authors: [{ full_name: 'Author' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ReferenceItem reference={reference} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders unlinked reference (no control_number)', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      authors: [{ full_name: 'Author' }],
      arxiv_eprints: [{ value: '123456' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ReferenceItem reference={reference} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders misc if present', () => {
    const reference = fromJS({
      misc: 'A Misc',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ReferenceItem reference={reference} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('does not render misc if title present', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ReferenceItem reference={reference} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
