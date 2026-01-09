import { List, Map } from 'immutable';
import {
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
} from '../../../../common/constants';
import AuthorSubjectAreas from '../../../authors/components/AuthorSubjectAreas';
import LiteratureSubjectAreas from '../../../literature/components/LiteratureSubjectAreas';

const SubjectAreasByType = ({
  categories,
  type,
}: {
  categories: List<string> | List<Map<string, any>> | undefined;
  type: string;
}) => {
  switch (type) {
    case AUTHORS_PID_TYPE:
      return <AuthorSubjectAreas categories={categories as List<string>} />;
    case LITERATURE_PID_TYPE:
      return (
        <LiteratureSubjectAreas
          categories={categories as List<Map<string, any>>}
        />
      );
    default:
      return null;
  }
};

export default SubjectAreasByType;
