import React from 'react';
import { shallow } from 'enzyme';
import ExportToCdsModal from '../ExportToCdsModal';
import ToolAction from '../ToolAction';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ToolAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(
      <ToolAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignToConference={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders disabled', () => {
    const wrapper = shallow(
      <ToolAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssignToConference={jest.fn()}
        disabledBulkAssign
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssignToConference on assign-conference click ', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignToConference = jest.fn();
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={onAssignToConference}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onExportToCds={jest.fn()}
        selectionSize={3}
      />
    );
    wrapper.find('[data-test-id="assign-conference"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssignToConference).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('opens modal on export-to-CDS click ', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssignToConference = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onExportToCds = jest.fn();
    const wrapper = shallow(
      <ToolAction
        onAssignToConference={onAssignToConference}
        onExportToCds={onExportToCds}
        selectionSize={3}
      />
    );
    wrapper.find('[data-test-id="export-to-CDS"]').simulate('click');
    const exportToCdsModal = wrapper.find(ExportToCdsModal);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(exportToCdsModal.prop('visible')).toBe(true);
  });
});
