import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../common/components/InlineList';

function renderNameVariant(nameVariant: any) {
  return <span>{nameVariant.get('value')}</span>;
}

function extractKeyFromNameVariant(nameVariant: any) {
  return nameVariant.get('value');
}

function InstitutionsNameVariantsList({
  nameVariants
}: any) {
  return (
    <InlineList
      /* @ts-ignore */
      label="Name Variants"
      items={nameVariants}
      extractKey={extractKeyFromNameVariant}
      renderItem={renderNameVariant}
    />
  );
}

InstitutionsNameVariantsList.propTypes = {
  /* @ts-ignore */
  nameVariants: PropTypes.instanceOf(List),
};

export default InstitutionsNameVariantsList;
