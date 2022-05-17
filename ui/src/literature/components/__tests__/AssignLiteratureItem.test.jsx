import React from 'react';
import { shallow } from 'enzyme';
import AssignLiteratureItem from '../AssignLiteratureItem';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignLiteratureItem', () => {
  it('renders', () => {
    const wrapper = shallow(
      <AssignLiteratureItem controlNumber={123456} currentUserRecordId={123456} onAssign={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click', () => {
    const onAssign = jest.fn();

    const wrapper = shallow(
      <AssignLiteratureItem
        onAssign={onAssign}
        currentUserRecordId={33}
        controlNumber={123456}
      />
    );

    wrapper.find('[data-test-id="assign-literature-item"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({ to: 33, literatureId: 123456 });
  });
});
