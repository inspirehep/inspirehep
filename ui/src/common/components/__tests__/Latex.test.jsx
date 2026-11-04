import { render } from '@testing-library/react';

import Latex from '../Latex';

describe('Latex', () => {
  it('renders only text', () => {
    const { getByText } = render(<Latex>This does not have latex in it</Latex>);
    expect(getByText('This does not have latex in it')).toBeInTheDocument();
  });

  it('renders text with LaTex in $...$', () => {
    const textWithLatex = 'ATLAS $B_{s} \\rightarrow \\mu^{+} \\mu^{-}$';
    const { queryByText } = render(<Latex>{textWithLatex}</Latex>);
    expect(
      queryByText('ATLAS $B_{s} \\rightarrow \\mu^{+} \\mu^{-}$')
    ).toBeNull();
  });

  it('renders text with broken LaTex by falling back raw text', () => {
    const textWithBrokenLatex = 'ATLAS $B_{{s}$';
    const { getByText } = render(<Latex>{textWithBrokenLatex}</Latex>);
    expect(getByText('ATLAS $B_{{s}$')).toBeInTheDocument();
  });

  it('renders whithout inner html', () => {
    const { container } = render(<Latex />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Latex sanitization', () => {
  it('strips dangerous markup', () => {
    const { container } = render(
      <Latex>
        {'ok <img src=x onerror="alert(1)"><script>alert(1)</script>'}
      </Latex>
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container).toHaveTextContent('ok');
  });

  it('keeps inline formatting tags', () => {
    const { container } = render(<Latex>{'H<sub>2</sub>O <i>x</i>'}</Latex>);
    expect(container.querySelector('sub')).toHaveTextContent('2');
    expect(container.querySelector('i')).toHaveTextContent('x');
  });

  it('does not treat < and > inside math as tags', () => {
    const { container } = render(<Latex>{'if $a<b$ and $x>y$ then'}</Latex>);
    expect(container.querySelectorAll('.katex')).toHaveLength(2);
    expect(container).not.toHaveTextContent('$');
  });

  it('returns non-string children untouched', () => {
    const { getByText } = render(
      <Latex>
        <b>bold</b>
      </Latex>
    );
    expect(getByText('bold')).toBeInTheDocument();
  });
});

describe('Latex HTML from records', () => {
  it('renders seminar abstracts stored as <div> HTML without showing tags', () => {
    const { container } = render(
      <Latex>
        {'<div>Talk about <b>QCD</b></div><div>Second paragraph</div>'}
      </Latex>
    );
    expect(container.querySelectorAll('div')).toHaveLength(2);
    expect(container).toHaveTextContent('Talk about QCDSecond paragraph');
    expect(container).not.toHaveTextContent('<div>');
  });

  it('renders <p> from experiment descriptions', () => {
    const { container } = render(<Latex>{'<p>Description</p>'}</Latex>);
    expect(container.querySelector('p')).toHaveTextContent('Description');
    expect(container).not.toHaveTextContent('<p>');
  });

  it('keeps <sup loc="post"> and drops nothing of the text', () => {
    const { container } = render(
      <Latex>{'Mass<sup loc="post">2</sup> of the pion'}</Latex>
    );
    expect(container.querySelector('sup')).toHaveTextContent('2');
    expect(container).toHaveTextContent('Mass2 of the pion');
  });

  it('renders subscripts and superscripts in titles and keywords', () => {
    const { container } = render(
      <Latex>
        {'Nb<sub>3</sub>Sn and <sup>252</sup>Cf and <i>J</i><sub>1</sub>'}
      </Latex>
    );
    expect(container.querySelectorAll('sub')).toHaveLength(2);
    expect(container.querySelector('sup')).toHaveTextContent('252');
    expect(container.querySelector('i')).toHaveTextContent('J');
    expect(container).toHaveTextContent('Nb3Sn and 252Cf and J1');
  });

  it.each([
    ['<jats:p>', '<jats:p>JATS paragraph</jats:p>', 'JATS paragraph'],
    ['<jats:title>', '<jats:title>Wiley title</jats:title>', 'Wiley title'],
    ['<italic>', 'A <italic>Z</italic> boson', 'A Z boson'],
  ])('does not show raw %s tags', (_, input, text) => {
    const { container } = render(<Latex>{input}</Latex>);
    expect(container).toHaveTextContent(text);
    expect(container.textContent).not.toMatch(/[<>]/);
  });
});

describe('Latex MathML', () => {
  it('renders MathML from APS abstracts', () => {
    const { container } = render(
      <Latex>
        {
          'Decay <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>B</mi><mo>→</mo><mi>K</mi></math> observed'
        }
      </Latex>
    );
    expect(container.getElementsByTagName('math')[0]).toBeDefined();
    expect(container.getElementsByTagName('mi')[0]).toHaveTextContent('B');
    expect(container).toHaveTextContent('observed');
    expect(container.textContent).not.toContain('<math');
  });

  it('keeps APS <mprescripts> and <none>', () => {
    const { container } = render(
      <Latex>
        {
          '<math><mmultiscripts><mi>C</mi><mn>1</mn><none/><mprescripts/><mn>252</mn><none/></mmultiscripts></math>'
        }
      </Latex>
    );
    expect(container.getElementsByTagName('mmultiscripts')[0]).toBeDefined();
    expect(container.getElementsByTagName('mprescripts')[0]).toBeDefined();
    expect(container.getElementsByTagName('none')[0]).toBeDefined();
  });

  it('renders Elsevier MathML with altimg attribute', () => {
    const { container } = render(
      <Latex>
        {'<math altimg="si1.svg"><mi>E</mi><mo>=</mo><mi>m</mi></math>'}
      </Latex>
    );
    expect(container.getElementsByTagName('math')[0]).toBeDefined();
    expect(container.textContent).not.toContain('<math');
  });

  it('renders JATS <inline-formula><mml:math>', () => {
    const { container } = render(
      <Latex>
        {
          'Value <inline-formula><mml:math><mml:mi>x</mml:mi></mml:math></inline-formula> done'
        }
      </Latex>
    );
    expect(container).toHaveTextContent('Value');
    expect(container).toHaveTextContent('done');
    expect(container.textContent).not.toMatch(/[<>]/);
  });

  it('strips script injected inside MathML', () => {
    const { container } = render(
      <Latex>
        {
          '<math><mi>x</mi><script>alert(1)</script><mtext onclick="x()">a</mtext></math>'
        }
      </Latex>
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onclick]')).toBeNull();
  });

  it('forbids style, form and input tags', () => {
    const { container } = render(
      <Latex>
        {'a<style>p{}</style><form><input name="x"><button>b</button></form>z'}
      </Latex>
    );
    expect(container.querySelector('style')).toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });
});

describe('Latex HTML entities', () => {
  it.each([
    ['&ndash;', 'a &ndash; b', 'a – b'],
    ['&Lambda;', '&Lambda; baryon', 'Λ baryon'],
    ['&icirc;', 'M&icirc;', 'Mî'],
    ['&lt;', 'x &lt; y', 'x < y'],
    ['&gt;', 'a --&gt; b', 'a --> b'],
    ['&uuml', 'J&uuml;lich', 'Jülich'],
  ])('decodes %s instead of showing it literally', (_, input, expected) => {
    const { container } = render(<Latex>{input}</Latex>);
    expect(container.textContent).toBe(expected);
  });

  it('decodes entities inside math', () => {
    const { container } = render(
      <Latex>{'$80 &lt; m_{\\ell\\ell} &lt; 100$'}</Latex>
    );
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(container.querySelector('.katex-error')).toBeNull();
    expect(container.textContent).not.toContain('&lt;');
    expect(container.textContent).not.toContain('$');
  });
});

describe('Latex delimiters and fallback', () => {
  it('renders display math with $$...$$', () => {
    const { container } = render(<Latex>see $$E=mc^2$$ here</Latex>);
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
  });

  it('renders \\(...\\) as inline and \\[...\\] as display', () => {
    const { container } = render(<Latex>{'\\(a^2\\) and \\[b^2\\]'}</Latex>);
    expect(container.querySelectorAll('.katex')).toHaveLength(2);
    expect(container.querySelectorAll('.katex-display')).toHaveLength(1);
  });

  it('renders several formulas without duplicating the surrounding text', () => {
    const { container } = render(<Latex>first $a$ middle $b$ last</Latex>);
    expect(container.querySelectorAll('.katex')).toHaveLength(2);
    expect(container.textContent.match(/first/g)).toHaveLength(1);
    expect(container.textContent.match(/middle/g)).toHaveLength(1);
    expect(container.textContent.match(/last/g)).toHaveLength(1);
  });

  it('does not treat braces-balanced $ inside math group as the end', () => {
    const { container } = render(<Latex>{'$\\text{a $ b}$ after'}</Latex>);
    expect(container).toHaveTextContent('after');
  });

  it.each([
    ['caption', 'Fig $\\tb=1.5,5$ shown', 'Fig \\tb=1.5,5 shown'],
    [
      'abstract',
      'energy $10^{17}\\GeV$ reached',
      'energy 10^{17}\\GeV reached',
    ],
    [
      'title',
      '$\\pT$-differential cross section',
      '\\pT-differential cross section',
    ],
  ])(
    'shows the formula source without $ when KaTeX cannot parse a %s formula',
    (_, input, expected) => {
      const { container } = render(<Latex>{input}</Latex>);
      expect(container.textContent).toBe(expected);
    }
  );

  it('keeps valid formulas rendered when another one is broken', () => {
    const { container } = render(<Latex>{'$a^2$ and $\\pT$ end'}</Latex>);
    expect(container.querySelectorAll('.katex')).toHaveLength(1);
    expect(container).toHaveTextContent('\\pT');
    expect(container).toHaveTextContent('end');
  });

  it('renders an unclosed $ as text', () => {
    const { container } = render(<Latex>costs 5$ only</Latex>);
    expect(container.textContent).toBe('costs 5$ only');
  });
});
