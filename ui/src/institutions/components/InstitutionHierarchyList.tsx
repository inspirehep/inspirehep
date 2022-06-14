import React from 'react';
import { List } from 'immutable';
import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

function renderHierarchy(hierarchy: $TSFixMe) {
  const name = hierarchy.get('name');
  const acronym = hierarchy.get('acronym');
  return (
    <span>
      {name}
      {acronym && <span> ({acronym})</span>}
    </span>
  );
}

function extractKeyFromHierarchy(hierarchy: $TSFixMe) {
  return hierarchy.get('name');
}

type Props = {
    hierarchies?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function InstitutionHierarchyList({ hierarchies }: Props) {
  return (
    <InlineList
      items={hierarchies}
      extractKey={extractKeyFromHierarchy}
      renderItem={renderHierarchy}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

export default InstitutionHierarchyList;
