import { onlyOn, skipOn } from '@cypress/skip-test';

describe('Literature Search', () => {
  onlyOn('electron', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('LiteratureSearch');
    });

    it('matches image snapshot for cataloger', () => {
      cy.login('cataloger');
      cy.registerRoute();
      cy.visit('/literature?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.matchSnapshots('LiteratureSearchCataloger');
      cy.logout();
    });
  });

  skipOn('electron', () => {
    it('displays correct searchRank', () => {
      cy.registerRoute();
      cy.visit('/literature?ui-citation-summary=true');
      cy.waitForRoute();
      cy.waitForSearchResults();
      cy.get('[data-test-id="literature-result-rank"]')
        .first()
        .should('have.text', '#1');
    });
  });
});

describe('Literature Detail', () => {
  onlyOn('electron', () => {
    it('matches image snapshot', () => {
      cy.registerRoute();
      cy.visit('/literature/1235543');
      cy.waitForRoute();
      cy.matchSnapshots('LiteratureDetail');
    });
  });
});

describe('Literature Submission', () => {
  beforeEach(() => {
    cy.login('cataloger');
  });

  onlyOn('electron', () => {
    it('matches image snapshot for article form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('article');
      cy.matchSnapshots('ArticleSubmission', { skipMobile: true });
    });

    it('matches image snapshot for thesis form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('thesis');
      cy.matchSnapshots('ThesisSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('book');
      cy.matchSnapshots('BookSubmission', { skipMobile: true });
    });

    it('matches image snapshot for book chapter form', () => {
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('bookChapter');
      cy.matchSnapshots('BookChapterSubmission', { skipMobile: true });
    });
  });

  skipOn('electron', () => {
    it('submits a new thesis', () => {
      const formData = {
        pdf_link: 'https://uni.eu/docs/thesis.pdf',
        title: 'Cool Research',
        subjects: ['Accelerators', 'Experiment-HEP'],
        abstract: 'This contains some cool stuff about a super big thing',
        authors: [{ full_name: 'Urhan, Harun', affiliation: 'CERN' }],
        degree_type: 'phd',
        submission_date: '2018-11',
        defense_date: '2019-01-01',
        institution: 'University of Geneva',
        supervisors: [{ full_name: 'Tsanakoglu, Ioannis', affiliation: 'CERN' }],
      };
  
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('thesis');
      cy.testSubmission({
        formData,
        collection: 'literature',
        submissionType: 'workflow'
      })
    });
  
    it('submits a new article', () => {
      const formData = {
        pdf_link:
          'http://caod.oriprobe.com/articles/61619219/Some_characterizations_for_the_exponential_φ_expan.html',
        title: 'Cool Article',
        subjects: ['Accelerators', 'Experiment-Nucl'],
        abstract: 'This explains some cool stuff about a thing',
        authors: [
          { full_name: 'Urhan, Harun', affiliation: 'CERN' },
          { full_name: 'Urhan, Ahmet' },
        ],
        experiment: 'CERN-LEP-L3',
        journal_title: 'Cool Journal',
        volume: 'Vol.1',
        issue: '20',
        year: '2014',
        comments: 'very private thing',
        proceedings_info: 'very private proceeding',
        conference_info: 'very private conference',
      };
  
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('article');
      cy.contains('Conference Info').click();
      cy.contains('Proceedings Info').click();
      cy.contains('Comments').click();
      cy.testSubmission({
        formData,
        collection: 'literature',
        submissionType: 'workflow'
      });
    });
  
    it('submits a new book', () => {
      const formData = {
        title: 'Nostalgic Rhythms',
        subjects: ['Accelerators'],
        authors: [{ full_name: 'Paparrigopoulos, Panos' }],
        publisher: 'CERN Library',
        publication_date: '2018-06',
        publication_place: 'Geneva, Switzerland',
      };
  
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('book');
      cy.testSubmission({
        formData,
        collection: 'literature',
        submissionType: 'workflow'
      })
    });
  
    it('submits a new book chapter', () => {
      const formData = {
        title: 'Cool Dev Livre: Chapitre 2',
        subjects: ['Computing'],
        language: 'fr',
        authors: [{ full_name: 'Urhan, Harun' }],
        start_page: '200',
        end_page: '300',
      };
  
      cy.visit('/submissions/literature');
      cy.selectLiteratureDocType('bookChapter');
      cy.testSubmission({
        formData,
        collection: 'literature',
        submissionType: 'workflow'
      })
    });
  });

  afterEach(() => {
    cy.logout();
  });
});
