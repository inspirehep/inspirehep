import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

function renderHierarchy(hierarchy: any) {
  const name = hierarchy.get('name');
  const acronym = hierarchy.get('acronym');
  return (
    <span>
      {name}
      {acronym && <span> ({acronym})</span>}
    </span>
  );
}

function extractKeyFromHierarchy(hierarchy: any) {
  return hierarchy.get('name');
}

function InstitutionHierarchyList({
  hierarchies
}: any) {
  return (
    <InlineList
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      items={hierarchies}
      extractKey={extractKeyFromHierarchy}
      renderItem={renderHierarchy}
      separator={SEPARATOR_MIDDLEDOT}
    />
  );
}

InstitutionHierarchyList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  hierarchies: PropTypes.instanceOf(List),
};

export default InstitutionHierarchyList;
