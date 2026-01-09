import React from 'react';
import { List, Map } from 'immutable';

import UnclickableTag from '../../../common/components/UnclickableTag';

const LiteratureSubjectAreas = ({
  categories,
}: {
  categories: List<Map<string, any>> | undefined;
}) => {
  if (!categories?.size) {
    return null;
  }

  return (
    <>
      {categories.map((category) => {
        const term = category?.get('term');
        if (!term) {
          return null;
        }

        return (
          <div className="mb2" key={term}>
            <UnclickableTag color="blue">{term}</UnclickableTag>
          </div>
        );
      })}
    </>
  );
};

export default LiteratureSubjectAreas;
