import { List } from 'immutable';
import UnclickableTag from '../../../common/components/UnclickableTag';

const LiteratureDocumentTypes = ({
  documentTypes,
}: {
  documentTypes?: List<string>;
}) => {
  if (!documentTypes?.size) return null;

  return (
    <>
      {documentTypes.map((docType: string) => (
        <UnclickableTag key={docType}>
          {docType.charAt(0).toUpperCase() + docType.slice(1)}
        </UnclickableTag>
      ))}
    </>
  );
};

export default LiteratureDocumentTypes;
