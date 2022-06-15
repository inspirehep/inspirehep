import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { shallow } from 'enzyme';

import CiteAllAction from '../CiteAllAction';
import DropdownMenu from '../../../common/components/DropdownMenu';
import { MAX_CITEABLE_RECORDS } from '../../constants';
import http from '../../../common/http';
import { downloadTextAsFile } from '../../../common/utils';

<<<<<<< Updated upstream

jest.mock('../../../common/utils');

const mockHttp = new MockAdapter(http.httpClient);

=======
jest.mock('../../../common/utils');

const mockHttp = new MockAdapter(http.httpClient);
>>>>>>> Stashed changes
describe('CiteAllAction', () => {
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(text... Remove this comment to see the full error message
    downloadTextAsFile.mockClear();
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('renders with less than max citeable records results', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; query: { q: strin... Remove this comment to see the full error message
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with disabled', () => {
    const wrapper = shallow(
      <CiteAllAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; query: { q: strin... Remove this comment to see the full error message
        numberOfResults={MAX_CITEABLE_RECORDS + 1}
        query={{ q: 'ac>2000' }}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with loading', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; query: { q: strin... Remove this comment to see the full error message
      <CiteAllAction numberOfResults={12} query={{ q: 'ac>2000' }} />
    );
    wrapper.setState({
      loading: true,
    });
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('calls downloadTextAsFile with correct data when option is clicked', async () => {
    mockHttp
      .onGet(
        `/literature?sort=mostcited&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
        null,
        {
          Accept: 'application/vnd+inspire.latex.eu+x-latex',
        }
      )
      .replyOnce(200, 'Test');
    const wrapper = shallow(
      <CiteAllAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; query: { sort: st... Remove this comment to see the full error message
        numberOfResults={12}
        query={{ sort: 'mostcited', q: 'query' }}
      />
    );
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    await wrapper.find(DropdownMenu).prop('onClick')({
      key: 'application/vnd+inspire.latex.eu+x-latex',
    });
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(downloadTextAsFile).toHaveBeenCalledWith(
      'Test',
      'INSPIRE-CiteAll.tex',
      'application/x-latex'
    );
  });

<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  it('calls downloadTextAsFile with correct data omitting page and size when option is clicked', async () => {
    mockHttp
      .onGet(
        `/literature?sort=mostrecent&q=query&page=1&size=${MAX_CITEABLE_RECORDS}`,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
        null,
        {
          Accept: 'application/vnd+inspire.latex.eu+x-latex',
        }
      )
      .replyOnce(200, 'Test');
    const wrapper = shallow(
      <CiteAllAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; query: { sort: st... Remove this comment to see the full error message
        numberOfResults={12}
        query={{ sort: 'mostrecent', q: 'query', page: 10, size: 100 }}
      />
    );
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    await wrapper.find(DropdownMenu).prop('onClick')({
      key: 'application/vnd+inspire.latex.eu+x-latex',
    });
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(downloadTextAsFile).toHaveBeenCalledWith(
      'Test',
      'INSPIRE-CiteAll.tex',
      'application/x-latex'
    );
  });
});
