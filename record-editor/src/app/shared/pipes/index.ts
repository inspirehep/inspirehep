import { ReferenceBriefPipe } from './reference-brief';
import { FilterByExpressionPipe } from './filter-by-expression.pipe';
import { KeysPipe } from './keys.pipe';
import { ApiToDetailUrlPipe } from './api-to-detail-url';

export const SHARED_PIPES = [
  ReferenceBriefPipe,
  FilterByExpressionPipe,
  KeysPipe,
  ApiToDetailUrlPipe,
];
