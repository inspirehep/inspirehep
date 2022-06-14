import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import DataImporter from '../DataImporter';
import LinkLikeButton from '../../../../common/components/LinkLikeButton';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DataImporter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without error while importing', () => {
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: null; isImporting: true; onImportCl... Remove this comment to see the full error message
        error={null}
        isImporting
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onImportClick={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSkipClick={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with error with a message', () => {
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: any; isImporting: boolean; onImport... Remove this comment to see the full error message
        error={fromJS({ message: 'error' })}
        isImporting={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onImportClick={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSkipClick={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with error with message and recid', () => {
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: any; isImporting: boolean; onImport... Remove this comment to see the full error message
        error={fromJS({ message: 'error', recid: '12345' })}
        isImporting={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onImportClick={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSkipClick={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with error without a message', () => {
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: any; isImporting: boolean; onImport... Remove this comment to see the full error message
        error={fromJS({ data: 'error' })}
        isImporting={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onImportClick={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSkipClick={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onImportClick with import value when import button is clicked', () => {
    const importValue = 'arXiv:1001.1234';
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onImportClick = jest.fn();
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: null; isImporting: boolean; onImpor... Remove this comment to see the full error message
        error={null}
        isImporting={false}
        onImportClick={onImportClick}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSkipClick={jest.fn()}
      />
    );
    wrapper
      .find('[data-test-id="import-input"]')
      .simulate('change', { target: { value: importValue } });
    wrapper.find('[data-test-id="import-button"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onImportClick).toHaveBeenCalledWith(importValue);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onSkipClick prop when skip button is clicked', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSkipClick = jest.fn();
    const wrapper = shallow(
      <DataImporter
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ error: null; isImporting: boolean; onImpor... Remove this comment to see the full error message
        error={null}
        isImporting={false}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onImportClick={jest.fn()}
        onSkipClick={onSkipClick}
      />
    );
    wrapper.find(LinkLikeButton).simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSkipClick).toHaveBeenCalledTimes(1);
  });
});
