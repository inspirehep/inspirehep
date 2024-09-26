export const LATEX_EXAMPLE_1 = `
\\documentclass[12pt]{article}

\\begin {document}
\\begin{flushright}
{\\small
SLAC--PUB--10812\\\\
October 2012\\\\}
\\end{flushright}
                                                                              
\\title{A Really Great Paper with Excellent Bibliography}
\\author{Jane Q. Physicist \\\\
Stanford Linear Accelerator Center \\\\
Stanford University, Stanford, California 94309 \\\\
}

\\maketitle

This paper is pretty eclectic, since it cites a buch of diverse
  things.  Of course, since it has no content, that is perhaps not so
  difficult.

Primarily I want to refer the reader to Brodsky and Wu's recent work on the renormalization 
group\\cite{Brodsky:2012ms}, which is relatively unrelated to the recent
work by Beacom, Bell, and Dodelson \\cite{Beacom:2004yd}.  I should also point out that
the paper by Kreitz and Brooks \\cite{physics/0309027} is being cited here in a
purely self-serving manner.  

There are many papers by Dixon and others that I'd like to point out here
\\cite{hep-th/0501240,hep-th/0412210,JHEP.0412.015}. 
In particular I wish to point out that the work done in
\\cite{JHEP.0412.015} is irrelevant to this paper.  

There are some items in the paper \\cite{Akimov:2012vv} which I would like
to draw your attention to, but it is likely that as above, I may be citing
this for the wrong reasons.


I had better cite the most recent Review of Particle Properties
\\cite{Nakamura:2010zzi}, since that
gets quite a lot of cites, while citing a few papers about stringy topics
\\cite{hep-th/9711200} is also worthwhile.  No paper is complete without a cite to
some extra-dimensional papers like \\cite{hep-ph/9803315,hep-ph/9905221}.
Finally, let me make a mistake citing this paper \\cite{hep-scifi/0101001}.

\\begin{thebibliography}{99}


\\end{thebibliography}


\\end{document}
                    `;

export const LATEX_EXAMPLE_2 = `
%\\cite{Brodsky:2012ms}
\\bibitem{Brodsky:2012ms}
S.~J.~Brodsky and X.~G.~Wu,
%\`\`Self-Consistency Requirements of the Renormalization Group for Setting the Renormalization Scale,''
Phys. Rev. D \\textbf{86} (2012), 054018
doi:10.1103/PhysRevD.86.054018
[arXiv:1208.0700 [hep-ph]].
%53 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{Beacom:2004yd}
\\bibitem{Beacom:2004yd}
J.~F.~Beacom, N.~F.~Bell and S.~Dodelson,
%\`\`Neutrinoless universe,''
Phys. Rev. Lett. \\textbf{93} (2004), 121302
doi:10.1103/PhysRevLett.93.121302
[arXiv:astro-ph/0404585 [astro-ph]].
%143 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{physics/0309027}
\\bibitem{physics/0309027}
P.~A.~Kreitz and T.~C.~Brooks,
%\`\`Subject access through community partnerships: A Case study,''
Sci. Tech. Libraries \\textbf{24} (2003), 153-172
doi:10.1300/J122v24n01_10
[arXiv:physics/0309027 [physics.hist-ph]].
%4 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{hep-th/0501240}
\\bibitem{hep-th/0501240}
Z.~Bern, L.~J.~Dixon and D.~A.~Kosower,
%\`\`On-shell recurrence relations for one-loop QCD amplitudes,''
Phys. Rev. D \\textbf{71} (2005), 105013
doi:10.1103/PhysRevD.71.105013
[arXiv:hep-th/0501240 [hep-th]].
%226 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{hep-th/0412210}
\\bibitem{hep-th/0412210}
Z.~Bern, L.~J.~Dixon and D.~A.~Kosower,
%\`\`All Next-to-maximally-helicity-violating one-loop gluon amplitudes in N=4 super-Yang-Mills theory,''
Phys. Rev. D \\textbf{72} (2005), 045014
doi:10.1103/PhysRevD.72.045014
[arXiv:hep-th/0412210 [hep-th]].
%136 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{JHEP.0412.015}
\\bibitem{JHEP.0412.015}
L.~J.~Dixon, E.~Glover and V.~V.~Khoze,
%\`\`MHV rules for Higgs plus multi-gluon amplitudes,''
JHEP \\textbf{12} (2004), 015
doi:10.1088/1126-6708/2004/12/015
[arXiv:hep-th/0411092 [hep-th]].
%192 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{Akimov:2012vv}
\\bibitem{Akimov:2012vv}
T.~Alexander \\textit{et al.} [DarkSide],
%\`\`Light Yield in DarkSide-10: A Prototype Two-Phase Argon TPC for Dark Matter Searches,''
Astropart. Phys. \\textbf{49} (2013), 44-51
doi:10.1016/j.astropartphys.2013.08.004
[arXiv:1204.6218 [astro-ph.IM]].
%69 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{Nakamura:2010zzi}
\\bibitem{Nakamura:2010zzi}
K.~Nakamura \\textit{et al.} [Particle Data Group],
%\`\`Review of particle physics,''
J. Phys. G \\textbf{37} (2010), 075021
doi:10.1088/0954-3899/37/7A/075021
%6467 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{hep-th/9711200}
\\bibitem{hep-th/9711200}
J.~M.~Maldacena,
%\`\`The Large N limit of superconformal field theories and supergravity,''
Int. J. Theor. Phys. \\textbf{38} (1999), 1113-1133
doi:10.1023/A:1026654312961
[arXiv:hep-th/9711200 [hep-th]].
%15702 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{hep-ph/9803315}
\\bibitem{hep-ph/9803315}
N.~Arkani-Hamed, S.~Dimopoulos and G.~Dvali,
%\`\`The Hierarchy problem and new dimensions at a millimeter,''
Phys. Lett. B \\textbf{429} (1998), 263-272
doi:10.1016/S0370-2693(98)00466-3
[arXiv:hep-ph/9803315 [hep-ph]].
%6724 citations counted in INSPIRE as of 24 Jun 2020

%\\cite{hep-ph/9905221}
\\bibitem{hep-ph/9905221}
L.~Randall and R.~Sundrum,
%\`\`A Large mass hierarchy from a small extra dimension,''
Phys. Rev. Lett. \\textbf{83} (1999), 3370-3373
doi:10.1103/PhysRevLett.83.3370
[arXiv:hep-ph/9905221 [hep-ph]].
%8745 citations counted in INSPIRE as of 24 Jun 2020
                    `;
