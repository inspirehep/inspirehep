import authorUiSchema from '../uiSchema/authorUiSchema';
import bookUiSchema from '../uiSchema/literature/bookUiSchema';
import literatureUiSchema from '../uiSchema/literature/literatureUiSchema';
import proceedingsUiSchema from '../uiSchema/literature/proceedingsUiSchema';
import thesisUiSchema from '../uiSchema/literature/thesisUiSchema';

export function getSchemaNameFromUrl(schemaUrl?: string): string {
  if (!schemaUrl) {
    return '';
  }
  const typeWithFileExt = schemaUrl.slice(
    schemaUrl.lastIndexOf('/') + 1,
    schemaUrl.length
  );
  return typeWithFileExt.slice(0, typeWithFileExt.lastIndexOf('.'));
}

const getUiSchemaForLiterature = (documentType?: string) => {
  switch (documentType) {
    case 'thesis':
      return thesisUiSchema;
    case 'proceedings':
      return proceedingsUiSchema;
    case 'book':
      return bookUiSchema;
    default:
      return literatureUiSchema;
  }
};

export const getUiSchema = (schemaUrl?: string, documentType?: string) => {
  const recordType = getSchemaNameFromUrl(schemaUrl);
  switch (recordType) {
    case 'authors':
      return authorUiSchema;
    case 'hep':
      return getUiSchemaForLiterature(documentType);
    default:
      return literatureUiSchema;
  }
};
