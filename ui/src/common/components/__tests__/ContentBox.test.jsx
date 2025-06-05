import React from 'react';
import { render } from '@testing-library/react';

import ContentBox from '../ContentBox';

describe('ContentBox', () => {
  it('renders ContentBox with actions and title without loading', () => {
    const { getByText } = render(
      <ContentBox
        title="Jessica Jones"
        leftActions={[<h2 key="pi">PI</h2>]}
        rightActions={[<h2 key="pi2">PI2</h2>]}
      >
        <div>Defenders</div>
      </ContentBox>
    );
    expect(getByText('Jessica Jones')).toBeInTheDocument();
    expect(getByText('Defenders')).toBeInTheDocument();
    expect(getByText('PI')).toBeInTheDocument();
    expect(getByText('PI2')).toBeInTheDocument();
  });

  it('renders ContentBox with actions and title with loading', () => {
    const { container, getByText } = render(
      <ContentBox
        title="Jessica Jones"
        loading
        leftActions={[<h1 key="pi">PI</h1>]}
      >
        <div>Defenders</div>
      </ContentBox>
    );
    const loadingElement = container.querySelector('.ant-card-loading');
    expect(getByText('Jessica Jones')).toBeInTheDocument();
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders ContentBox with actions', () => {
    const { getByText } = render(
      <ContentBox
        leftActions={[<h2 key="pi">PI</h2>]}
        rightActions={[<h2 key="pi2">PI2</h2>]}
      >
        <div>Defenders</div>
      </ContentBox>
    );
    expect(getByText('Defenders')).toBeInTheDocument();
    expect(getByText('PI')).toBeInTheDocument();
    expect(getByText('PI2')).toBeInTheDocument();
  });

  it('renders ContentBox without actions', () => {
    const { getByText, queryByText } = render(
      <ContentBox>
        <div>Defenders</div>
      </ContentBox>
    );
    expect(getByText('Defenders')).toBeInTheDocument();
    expect(queryByText('PI')).toBeNull();
  });

  it('renders ContentBox with subTitle and className', () => {
    const { container, getByText } = render(
      <ContentBox subTitle="Lame" className="pa3">
        <div>Defenders</div>
      </ContentBox>
    );
    expect(getByText('Lame')).toBeInTheDocument();
    expect(getByText('Defenders')).toBeInTheDocument();
    const className = container.querySelector('.pa3');
    expect(className).toBeInTheDocument();
  });

  it('does not render ContentBox without children', () => {
    const { queryByText } = render(
      <ContentBox leftActions={[<h2 key="pi">PI</h2>]} />
    );
    expect(queryByText('PI')).toBeNull();
  });
});
