import { ReferenceBriefPipe } from './reference-brief';
import { FilterByExpressionPipe } from './filter-by-expression.pipe';

export {
  ReferenceBriefPipe,
  FilterByExpressionPipe
};

export const SHARED_PIPES = [
  ReferenceBriefPipe,
  FilterByExpressionPipe
];
