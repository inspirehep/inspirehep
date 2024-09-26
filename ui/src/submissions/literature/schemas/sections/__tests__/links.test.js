import { object } from 'yup';

import links from '../links';

const schema = object().shape(links);

describe('links section', () => {
  it('validates when pdf_link is a link', async () => {
    expect(
      await schema.isValid({ pdf_link: 'https://example.com/article.pdf' })
    ).toBe(true);
  });

  it('invalidates when pdf_link is not a link', async () => {
    expect(await schema.isValid({ pdf_link: 'whatever' })).toBe(false);
  });

  it('validates when additonal_link is a link', async () => {
    expect(
      await schema.isValid({
        additional_link: 'https://example.com/abstract.html',
      })
    ).toBe(true);
  });

  it('invalidates when additonal_link is not a link', async () => {
    expect(await schema.isValid({ additional_link: 'thing' })).toBe(false);
  });

  it('validates with special characters', async () => {
    expect(
      await schema.isValid({
        pdf_link:
          'http://caod.oriprobe.com/articles/61619219/Some_characterizations_for_the_exponential_φ_expan.pdf',
        additional_link:
          'http://caod.oriprobe.com/articles/61619219/Some_characterizations_for_the_exponential_φ_expan.htm',
      })
    ).toBe(true);
  });
});
