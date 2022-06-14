// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object } from 'yup';

import links from '../links';

const schema = object().shape(links);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('links section', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when pdf_link is a link', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      await schema.isValid({ pdf_link: 'https://example.com/article.pdf' })
    ).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when pdf_link is not a link', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(await schema.isValid({ pdf_link: 'whatever' })).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when additonal_link is a link', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      await schema.isValid({
        additional_link: 'https://example.com/abstract.html',
      })
    ).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when additonal_link is not a link', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(await schema.isValid({ additional_link: 'thing' })).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates with special characters', async (done: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(
      await schema.isValid({
        pdf_link:
          'http://caod.oriprobe.com/articles/61619219/Some_characterizations_for_the_exponential_φ_expan.pdf',
        additional_link:
          'http://caod.oriprobe.com/articles/61619219/Some_characterizations_for_the_exponential_φ_expan.htm',
      })
    ).toBe(true);
    done();
  });
});
