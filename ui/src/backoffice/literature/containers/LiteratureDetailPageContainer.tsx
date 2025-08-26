import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActionCreator, Action } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { push } from 'connected-react-router';

import { fetchLiteratureRecord } from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../common/routes';
import ContentBox from '../../../common/components/ContentBox';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../search/constants';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';

type LiteratureDetailPageContainerProps = {
  dispatch: ActionCreator<Action>;
  record: Map<string, any>;
  loading: boolean;
};

const LiteratureDetailPageContainer = ({
  dispatch,
  record,
  loading,
}: LiteratureDetailPageContainerProps) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchLiteratureRecord(id));
  }, []);

  const data = record?.get('data');
  const title = data?.getIn(['titles', 0, 'title']);

  return (
    <>
      <DocumentHead
        title={`${title} - Backoffice`}
        description="Explore detailed information about the record."
      />
      <div
        className="__DetailPageContainer__"
        data-testid="backoffice-detail-page"
      >
        <Breadcrumbs
          title1="Search literature"
          href1="literature/search"
          title2={title || 'Details'}
          namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
        />
        <LoadingOrChildren loading={loading}>
          <EmptyOrChildren
            data={record}
            title={
              <>
                Record not found <br />
                <LinkLikeButton
                  onClick={() => dispatch(push(BACKOFFICE_LITERATURE_SEARCH))}
                >
                  <p>Go to search page</p>
                </LinkLikeButton>
              </>
            }
          >
            <ContentBox fullHeight={false} className="md-pb3">
              <h2>{title}</h2>
            </ContentBox>
          </EmptyOrChildren>
        </LoadingOrChildren>
      </div>
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  record: state.backoffice.get('literature'),
  loading: state.backoffice.get('loading'),
});

export default connect(stateToProps)(LiteratureDetailPageContainer);
