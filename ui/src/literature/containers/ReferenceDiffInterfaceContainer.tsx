import React from 'react';
import { connect, RootStateOrAny } from 'react-redux';

import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchReferencesDiff,
} from '../../actions/literature';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import ReferenceDiffInterface from '../components/ReferenceDiffInterface/ReferenceDiffInterface';

const mapStateToProps = (state: RootStateOrAny) => ({
  record: state.literature.get('data'),
  authors: state.literature.get('authors'),
  supervisors: state.literature.get('supervisors'),
  loggedIn: state.user.get('loggedIn'),
  hasAuthorProfile:
    state.user.getIn(['data', 'profile_control_number']) !== null,
  previousReference: state.literature.getIn([
    'referencesDiff',
    'previousVersion',
  ]),
  currentReference: state.literature.getIn([
    'referencesDiff',
    'currentVersion',
  ]),
  referenceId: state.literature.getIn(['referencesDiff', 'referenceId']),
  error: state.literature.get('errorReferencesDiff'),
  loading: state.literature.get('loadingReferencesDiff'),
});

const ReferenceDiffInterfaceContainer = connect(mapStateToProps)(
  ReferenceDiffInterface
);

export default withRouteActionsDispatcher(ReferenceDiffInterfaceContainer, {
  routeParamSelector: (args) => args,
  routeActions: (args) => [
    fetchLiterature(args.id),
    fetchLiteratureAuthors(args.id),
    fetchReferencesDiff(args.id, args.old!, args.new!),
  ],
  loadingStateSelector: (state) =>
    !state.literature.hasIn(['data', 'metadata']),
});
