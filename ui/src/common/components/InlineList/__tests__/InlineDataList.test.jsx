import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import InlineDataList from '../InlineDataList';

describe('InlineList', () => {
  it('renders items seperated by default', () => {
    const items = fromJS(['foo', 'bar']);
    const { getByText } = render(
      <InlineDataList
        items={items}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('bar')).toBeInTheDocument();
    expect(getByText(',')).toBeInTheDocument();
  });

  it('renders item without separator', () => {
    const items = fromJS(['foo', 'bar']);
    const { queryByText } = render(
      <InlineDataList
        separateItems={false}
        items={items}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(queryByText(',')).toBeNull();
  });

  it('renders wrapper with class', () => {
    const items = fromJS(['foo', 'bar']);
    const { getByTestId } = render(
      <InlineDataList
        wrapperClassName="di"
        items={items}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(getByTestId('inline-data-list')).toHaveClass('di');
  });

  it('renders items (array) without separator', () => {
    const items = ['foo', 'bar'];
    const { queryByText } = render(
      <InlineDataList
        separateItems={false}
        items={items}
        renderItem={(item) => <span>{item}</span>}
      />
    );

    expect(queryByText(',')).toBeNull();
  });

  it('renders with all props set', () => {
    const items = fromJS([
      { id: 1, value: 'foo' },
      { id: 2, value: 'bar' },
    ]);
    const { getByText } = render(
      <InlineDataList
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item) => item.get('id')}
        renderItem={(item) => <span>{item.get('value')}</span>}
      />
    );
    expect(getByText('Test:')).toBeInTheDocument();
    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('bar')).toBeInTheDocument();
    expect(getByText('Suffix')).toBeInTheDocument();
  });

  it('renders with all props set (array)', () => {
    const items = [
      { id: 1, value: 'foo' },
      { id: 2, value: 'bar' },
    ];
    const { getByText } = render(
      <InlineDataList
        label="Test"
        suffix={<span>Suffix</span>}
        items={items}
        extractKey={(item) => item.id}
        renderItem={(item) => <span>{item.value}</span>}
      />
    );
    expect(getByText('Test:')).toBeInTheDocument();
    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('bar')).toBeInTheDocument();
    expect(getByText('Suffix')).toBeInTheDocument();
  });

  it('does not render if items are null', () => {
    const { container } = render(
      <InlineDataList
        label="Test"
        suffix={<span>Suffix</span>}
        items={null}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render if empty array passed', () => {
    const { container } = render(
      <InlineDataList
        label="Test"
        suffix={<span>Suffix</span>}
        items={[]}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render if empty list passed', () => {
    const { container } = render(
      <InlineDataList
        label="Test"
        suffix={<span>Suffix</span>}
        items={fromJS([])}
        renderItem={(item) => <span>{item}</span>}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
