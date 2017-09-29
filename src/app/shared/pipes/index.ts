import { ReferenceBriefPipe } from './reference-brief';
import { FilterByExpressionPipe } from './filter-by-expression.pipe';
import { KeysPipe } from './keys.pipe';

export {
  ReferenceBriefPipe,
  FilterByExpressionPipe,
  KeysPipe
};

export const SHARED_PIPES = [
  ReferenceBriefPipe,
  FilterByExpressionPipe,
  KeysPipe
];
