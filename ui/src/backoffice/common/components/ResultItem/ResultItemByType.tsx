import {
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
} from '../../../../common/constants';
import AuthorResultItem from '../../../authors/components/AuthorResultItem';
import LiteratureResultItem from '../../../literature/components/LiteratureResultItem';

const ResultItemByType = ({ item, type }: { item: any; type: string }) => {
  switch (type) {
    case AUTHORS_PID_TYPE:
      return <AuthorResultItem item={item} />;
    case LITERATURE_PID_TYPE:
      return <LiteratureResultItem item={item} />;
    default:
      return null;
  }
};

export default ResultItemByType;
