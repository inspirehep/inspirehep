import React from 'react';
import { List } from 'immutable';

import UnclickableTag from '../../../common/components/UnclickableTag';

const AuthorSubjectAreas = ({
  categories,
}: {
  categories: List<string> | undefined;
}) => {
  if (!categories?.size) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <div className="mb2" key={category}>
          <UnclickableTag color="blue">{category}</UnclickableTag>
        </div>
      ))}
    </>
  );
};

export default AuthorSubjectAreas;
