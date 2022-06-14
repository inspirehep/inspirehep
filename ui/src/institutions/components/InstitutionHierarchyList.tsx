import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

function renderHierarchy(hierarchy) {
  const name = hierarchy.get('name');
  const acronym = hierarchy.get('acronym');
  return (
    <span>
      {name}
      {acronym && <span> ({acronym})</span>}
    </span>
  );
}

function extractKeyFromHierarchy(hierarchy) {
  return hierarchy.get('name');
}

function InstitutionHierarchyList({ hierarchies }) {
  return (
    <InlineList
      items={hierarchies}
      extractKey={extractKeyFromHierarchy}
      renderItem={renderHierarchy}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

InstitutionHierarchyList.propTypes = {
  hierarchies: PropTypes.instanceOf(List),
};

export default InstitutionHierarchyList;
