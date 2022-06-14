import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import DataImporter from '../DataImporter';
import LinkLikeButton from '../../../../common/components/LinkLikeButton';

describe('DataImporter', () => {
  it('renders without error while importing', () => {
    const wrapper = shallow(
      <DataImporter
        error={null}
        isImporting
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with error with a message', () => {
    const wrapper = shallow(
      <DataImporter
        error={fromJS({ message: 'error' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with error with message and recid', () => {
    const wrapper = shallow(
      <DataImporter
        error={fromJS({ message: 'error', recid: '12345' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with error without a message', () => {
    const wrapper = shallow(
      <DataImporter
        error={fromJS({ data: 'error' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onImportClick with import value when import button is clicked', () => {
    const importValue = 'arXiv:1001.1234';
    const onImportClick = jest.fn();
    const wrapper = shallow(
      <DataImporter
        error={null}
        isImporting={false}
        onImportClick={onImportClick}
        onSkipClick={jest.fn()}
      />
    );
    wrapper
      .find('[data-test-id="import-input"]')
      .simulate('change', { target: { value: importValue } });
    wrapper.find('[data-test-id="import-button"]').simulate('click');
    expect(onImportClick).toHaveBeenCalledWith(importValue);
  });

  it('calls onSkipClick prop when skip button is clicked', () => {
    const onSkipClick = jest.fn();
    const wrapper = shallow(
      <DataImporter
        error={null}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={onSkipClick}
      />
    );
    wrapper.find(LinkLikeButton).simulate('click');
    expect(onSkipClick).toHaveBeenCalledTimes(1);
  });
});
