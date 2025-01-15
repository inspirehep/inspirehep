/* eslint-disable no-case-declarations */
import { fromJS, Set } from 'immutable';

import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
  REFERENCES_DIFF_REQUEST,
  REFERENCES_DIFF_SUCCESS,
  REFERENCES_DIFF_ERROR,
  LITERATURE_AUTHORS_ERROR,
  LITERATURE_AUTHORS_REQUEST,
  LITERATURE_AUTHORS_SUCCESS,
  CLEAR_STATE,
  LITERATURE_SELECTION_SET,
  LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
  LITERATURE_SELECTION_CLEAR,
  LITERATURE_SET_ASSIGN_LITERATURE_ITEM_DRAWER_VISIBILITY,
  LITERATURE_ALL_AUTHORS_REQUEST,
  LITERATURE_ALL_AUTHORS_SUCCESS,
  LITERATURE_ALL_AUTHORS_ERROR,
  LITERATURE_SET_CURATE_DRAWER_VISIBILITY,
} from '../actions/actionTypes';
import {
  onRequest,
  onSuccess,
  onError,
  initialState as initialRecordState,
} from './recordsFactory';

export const initialState = fromJS({
  loadingReferences: false,
  errorReferences: null,
  references: [],
  loadingReferencesDiff: false,
  errorReferencesDiff: null,
  referencesDiff: [],
  totalReferences: 0,
  pageReferences: 1,
  loadingAuthors: false,
  errorAuthors: null,
  authors: [],
  errorAllAuthors: null,
  allAuthors: [],
  supervisors: [],
  literatureSelection: Set(),
  isAssignDrawerVisible: false,
  assignDetailViewDrawerVisible: null,
  referenceDrawer: null,
}).merge(initialRecordState);

const literatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case LITERATURE_REQUEST:
      return onRequest(state);
    case LITERATURE_SUCCESS:
      return onSuccess(state, action);
    case LITERATURE_ERROR:
      return onError(state, action);
    case LITERATURE_REFERENCES_REQUEST:
      return state
        .set('loadingReferences', true)
        .set('pageReferences', fromJS(action.payload));
    case LITERATURE_REFERENCES_SUCCESS:
      return state
        .set('loadingReferences', false)
        .set('references', fromJS(action.payload.metadata.references))
        .set('errorReferences', initialState.get('errorReferences'))
        .set('totalReferences', action.payload.metadata.references_count);
    case LITERATURE_REFERENCES_ERROR:
      return state
        .set('loadingReferences', false)
        .set('errorReferences', fromJS(action.payload.error))
        .set('references', initialState.get('references'))
        .set('totalReferences', initialState.get('totalReferences'));
    case REFERENCES_DIFF_REQUEST:
      return state.set('loadingReferencesDiff', true);
    case REFERENCES_DIFF_SUCCESS:
      return state
        .set('loadingReferencesDiff', false)
        .set('referencesDiff', {
          previousVersion: fromJS(JSON.parse(action.payload.previous_version)),
          currentVersion: fromJS(JSON.parse(action.payload.current_version)),
          referenceId: fromJS(action.payload.reference_index),
        })
        .set('errorReferencesDiff', initialState.get('errorReferences'));
    case REFERENCES_DIFF_ERROR:
      return state
        .set('loadingReferencesDiff', false)
        .set('errorReferencesDiff', fromJS(action.payload.error))
        .set('referencesDiff', initialState.get('referencesDiff'));
    case LITERATURE_AUTHORS_REQUEST:
      return state.set('loadingAuthors', true);
    case LITERATURE_AUTHORS_SUCCESS:
      return state
        .set('loadingAuthors', false)
        .set('authors', fromJS(action.payload.metadata.authors))
        .set('supervisors', fromJS(action.payload.metadata.supervisors))
        .set('errorAuthors', initialState.get('errorAuthors'));
    case LITERATURE_AUTHORS_ERROR:
      return state
        .set('loadingAuthors', false)
        .set('errorAuthors', fromJS(action.payload.error))
        .set('authors', initialState.get('authors'));
    case LITERATURE_ALL_AUTHORS_REQUEST:
      return state.set('loadingAllAuthors', true);
    case LITERATURE_ALL_AUTHORS_SUCCESS:
      return state
        .set('loadingAllAuthors', false)
        .set('allAuthors', fromJS(action.payload.metadata.authors))
        .set('errorAllAuthors', initialState.get('errorAuthors'));
    case LITERATURE_ALL_AUTHORS_ERROR:
      return state
        .set('loadingAllAuthors', false)
        .set('errorAllAuthors', fromJS(action.payload.error))
        .set('allAuthors', initialState.get('allAuthors'));
    case LITERATURE_SELECTION_CLEAR:
      return state.set('literatureSelection', Set());
    case LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY:
      return state.set('isAssignDrawerVisible', action.payload.visible);
    case LITERATURE_SET_ASSIGN_LITERATURE_ITEM_DRAWER_VISIBILITY:
      return state.set(
        'assignLiteratureItemDrawerVisible',
        action.payload.literatureId
      );
    case LITERATURE_SET_CURATE_DRAWER_VISIBILITY:
      return state.set('referenceDrawer', action.payload.referenceId);
    case LITERATURE_SELECTION_SET:
      const { literatureIds, selected } = action.payload;
      const selectionUpdate = Set(literatureIds);
      const currentSelection = state.get('literatureSelection');
      const nextSelection = selected
        ? currentSelection.union(selectionUpdate)
        : currentSelection.subtract(selectionUpdate);
      return state.set('literatureSelection', nextSelection);
    default:
      return state;
  }
};

export default literatureReducer;
