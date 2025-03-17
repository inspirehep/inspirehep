import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import ExpandableInlineList from '../ExpandableInlineList';

describe('ExpandableInlineList', () => {
  it('renders only 10 by default with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const { getAllByRole, getByRole } = render(
      <ExpandableInlineList items={items} renderItem={(item) => item} />
    );
    expect(getAllByRole('listitem')).toHaveLength(10);
    expect(getByRole('button')).toHaveTextContent('Show all (11)');
  });

  it('renders only limited amount with expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const { getAllByRole, getByRole } = render(
      <ExpandableInlineList
        limit={3}
        items={items}
        renderItem={(item) => item}
      />
    );
    expect(getAllByRole('listitem')).toHaveLength(3);
    expect(getByRole('button')).toHaveTextContent('Show all (5)');
  });

  it('renders all on expand toggle', () => {
    const items = fromJS([1, 2, 3, 4, 5]);
    const { getAllByRole, getByRole } = render(
      <ExpandableInlineList
        limit={3}
        items={items}
        renderItem={(item) => item}
      />
    );
    expect(getAllByRole('listitem')).toHaveLength(3);
    getByRole('button').click();
    expect(getAllByRole('listitem')).toHaveLength(5);
  });
});
