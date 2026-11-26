#
# This file is part of INSPIRE.
# Copyright (C) 2014-2017 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

from datetime import date, timedelta

import pytest
from dateutil.relativedelta import relativedelta
from inspirehep.search.query_parser import parser
from inspirehep.search.query_parser.ast import (
    AndOp,
    EmptyQuery,
    ExactMatchValue,
    GreaterEqualThanOp,
    GreaterThanOp,
    Keyword,
    KeywordOp,
    LessEqualThanOp,
    LessThanOp,
    MalformedQuery,
    NestedKeywordOp,
    NotOp,
    OrOp,
    PartialMatchValue,
    QueryWithMalformedPart,
    RangeOp,
    RegexValue,
    Value,
    ValueOp,
)
from inspirehep.search.query_parser.stateful_pypeg_parser import StatefulParser
from inspirehep.search.query_parser.visitors.restructuring_visitor import (
    RestructuringVisitor,
)


@pytest.mark.parametrize(
    ("query_str", "expected_parse_tree"),
    [
        # Find keyword combined with other production rules
        (
            "FIN author:'ellis'",
            KeywordOp(Keyword("author"), PartialMatchValue("ellis")),
        ),
        ('Find author "ellis"', KeywordOp(Keyword("author"), ExactMatchValue("ellis"))),
        ("f author ellis", KeywordOp(Keyword("author"), Value("ellis"))),
        # Invenio like search
        (
            "author:ellis and title:boson",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                KeywordOp(Keyword("title"), Value("boson")),
            ),
        ),
        (
            "unknown_keyword:'bar'",
            KeywordOp(Keyword("unknown_keyword"), PartialMatchValue("bar")),
        ),
        (
            "dotted.keyword:'bar'",
            KeywordOp(Keyword("dotted.keyword"), PartialMatchValue("bar")),
        ),
        # Boolean operator testing (And/Or)
        (
            "author ellis and title 'boson'",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                KeywordOp(Keyword("title"), PartialMatchValue("boson")),
            ),
        ),
        (
            "f a appelquist and date 1983",
            AndOp(
                KeywordOp(Keyword("author"), Value("appelquist")),
                KeywordOp(Keyword("date"), Value("1983")),
            ),
        ),
        (
            "fin a henneaux and citedby a nicolai",
            AndOp(
                KeywordOp(Keyword("author"), Value("henneaux")),
                NestedKeywordOp(
                    Keyword("citedby"), KeywordOp(Keyword("author"), Value("nicolai"))
                ),
            ),
        ),
        (
            "au ellis | title 'boson'",
            OrOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                KeywordOp(Keyword("title"), PartialMatchValue("boson")),
            ),
        ),
        (
            "-author ellis OR title 'boson'",
            OrOp(
                NotOp(KeywordOp(Keyword("author"), Value("ellis"))),
                KeywordOp(Keyword("title"), PartialMatchValue("boson")),
            ),
        ),
        (
            "author ellis & title 'boson'",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                KeywordOp(Keyword("title"), PartialMatchValue("boson")),
            ),
        ),
        # Implicit And
        (
            "author ellis elastic.keyword:'boson'",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                KeywordOp(Keyword("elastic.keyword"), PartialMatchValue("boson")),
            ),
        ),
        (
            "find cn atlas not tc c",
            AndOp(
                KeywordOp(Keyword("collaboration"), Value("atlas")),
                NotOp(KeywordOp(Keyword("type-code"), Value("c"))),
            ),
        ),
        (
            "author:ellis j title:'boson' reference:M.N.1",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis j")),
                AndOp(
                    KeywordOp(Keyword("title"), PartialMatchValue("boson")),
                    KeywordOp(Keyword("cite"), Value("M.N.1")),
                ),
            ),
        ),
        (
            "author ellis - title 'boson'",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                NotOp(KeywordOp(Keyword("title"), PartialMatchValue("boson"))),
            ),
        ),
        (
            "topcite 2+ and skands",
            AndOp(
                KeywordOp(Keyword("topcite"), GreaterEqualThanOp(Value("2"))),
                ValueOp(Value("skands")),
            ),
        ),
        # ##### Boolean operators at terminals level ####
        (
            "author ellis title:boson not higgs",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                AndOp(
                    KeywordOp(Keyword("title"), Value("boson")),
                    NotOp(KeywordOp(Keyword("title"), Value("higgs"))),
                ),
            ),
        ),
        # Negation
        (
            "ellis and not title 'boson'",
            AndOp(
                ValueOp(Value("ellis")),
                NotOp(KeywordOp(Keyword("title"), PartialMatchValue("boson"))),
            ),
        ),
        (
            "-title 'boson'",
            NotOp(KeywordOp(Keyword("title"), PartialMatchValue("boson"))),
        ),
        # Nested expressions
        (
            "author ellis, j. and (title boson or (author /^xi$/ and title foo))",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis, j.")),
                OrOp(
                    KeywordOp(Keyword("title"), Value("boson")),
                    AndOp(
                        KeywordOp(Keyword("author"), RegexValue("^xi$")),
                        KeywordOp(Keyword("title"), Value("foo")),
                    ),
                ),
            ),
        ),
        (
            (
                "author ellis, j. and not (title boson or not (author /^xi$/ and title"
                " foo))"
            ),
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis, j.")),
                NotOp(
                    OrOp(
                        KeywordOp(Keyword("title"), Value("boson")),
                        NotOp(
                            AndOp(
                                KeywordOp(Keyword("author"), RegexValue("^xi$")),
                                KeywordOp(Keyword("title"), Value("foo")),
                            )
                        ),
                    )
                ),
            ),
        ),
        # Metadata search
        (
            'refersto:1347300 and (reference:Ellis or reference "Ellis")',
            AndOp(
                NestedKeywordOp(Keyword("refersto"), ValueOp(Value("1347300"))),
                OrOp(
                    KeywordOp(Keyword("cite"), Value("Ellis")),
                    KeywordOp(Keyword("cite"), ExactMatchValue("Ellis")),
                ),
            ),
        ),
        (
            "exactauthor:M.Vanderhaeghen.1 and ac: 42",
            AndOp(
                KeywordOp(Keyword("exact-author"), Value("M.Vanderhaeghen.1")),
                KeywordOp(Keyword("author-count"), Value("42")),
            ),
        ),
        # Simple phrases
        ("ellis", ValueOp(Value("ellis"))),
        ("'ellis'", ValueOp(PartialMatchValue("ellis"))),
        ("(ellis and smith)", AndOp(ValueOp(Value("ellis")), ValueOp(Value("smith")))),
        # Parenthesized keyword query values (working also with SPIRES operators -
        # doesn't on legacy)
        ("author:(title ellis)", KeywordOp(Keyword("author"), Value("title ellis"))),
        (
            "author (pardo, f AND slavich) OR (author:bernreuther and not date:2017)",
            OrOp(
                AndOp(
                    KeywordOp(Keyword("author"), Value("pardo, f")),
                    KeywordOp(Keyword("author"), Value("slavich")),
                ),
                AndOp(
                    KeywordOp(Keyword("author"), Value("bernreuther")),
                    NotOp(KeywordOp(Keyword("date"), Value("2017"))),
                ),
            ),
        ),
        # Non trivial terminals
        (
            "author smith and not j., ellis or foo",
            AndOp(
                KeywordOp(Keyword("author"), Value("smith")),
                OrOp(
                    NotOp(KeywordOp(Keyword("author"), Value("j., ellis"))),
                    KeywordOp(Keyword("author"), Value("foo")),
                ),
            ),
        ),
        (
            (
                "find title Alternative the Phase-II upgrade of the ATLAS Inner"
                " Detector or na61/shine"
            ),
            OrOp(
                KeywordOp(
                    Keyword("title"),
                    Value(
                        "Alternative the Phase-II upgrade of the ATLAS Inner Detector"
                    ),
                ),
                KeywordOp(Keyword("title"), Value("na61/shine")),
            ),
        ),
        (
            "find (j phys.rev. and vol d85) or (j phys.rev.lett.,62,1825)",
            OrOp(
                KeywordOp(Keyword("journal"), Value("phys.rev.,d85")),
                KeywordOp(Keyword("journal"), Value("phys.rev.lett.,62,1825")),
            ),
        ),
        (
            "title e-10 and -author d'hoker",
            AndOp(
                KeywordOp(Keyword("title"), Value("e-10")),
                NotOp(KeywordOp(Keyword("author"), Value("d'hoker"))),
            ),
        ),
        (
            "a pang，yi and t SU(2)",
            AndOp(
                KeywordOp(Keyword("author"), Value("pang，yi")),
                KeywordOp(Keyword("title"), Value("SU(2)")),
            ),
        ),
        (
            "t e(+)e(-) or e+e- Colliders",
            OrOp(
                KeywordOp(Keyword("title"), Value("e(+)e(-)")),
                KeywordOp(Keyword("title"), Value("e+e- Colliders")),
            ),
        ),
        (
            "title: Si-28(p(pol.),n(pol.))",
            KeywordOp(Keyword("title"), Value("Si-28(p(pol.),n(pol.))")),
        ),
        (
            "t Si28(p→,p→′)Si28(6−,T=1)",
            KeywordOp(Keyword("title"), Value("Si28(p→,p→′)Si28(6−,T=1)")),
        ),
        (
            "t C-12(vec-p,vec-n)N-12 (g.s.,1+)",
            KeywordOp(Keyword("title"), Value("C-12(vec-p,vec-n)N-12 (g.s.,1+)")),
        ),
        # Regex
        (
            "author:/^Ellis, (J|John)$/",
            KeywordOp(Keyword("author"), RegexValue("^Ellis, (J|John)$")),
        ),
        (
            "title:/dense ([^ $]* )?matter/",
            KeywordOp(Keyword("title"), RegexValue("dense ([^ $]* )?matter")),
        ),
        # Nestable keywords
        (
            "referstox:author:s.p.martin.1",
            NestedKeywordOp(
                Keyword("referstox"),
                KeywordOp(Keyword("author"), Value("s.p.martin.1")),
            ),
        ),
        (
            "find a parke, s j and refersto author witten",
            AndOp(
                KeywordOp(Keyword("author"), Value("parke, s j")),
                NestedKeywordOp(
                    Keyword("refersto"), KeywordOp(Keyword("author"), Value("witten"))
                ),
            ),
        ),
        (
            "citedbyx:author:s.p.martin.1",
            NestedKeywordOp(
                Keyword("citedbyx"), KeywordOp(Keyword("author"), Value("s.p.martin.1"))
            ),
        ),
        (
            "citedby:author:s.p.martin.1",
            NestedKeywordOp(
                Keyword("citedby"), KeywordOp(Keyword("author"), Value("s.p.martin.1"))
            ),
        ),
        (
            "-refersto:recid:1374998 and citedby:(A.A.Aguilar.Arevalo.1)",
            AndOp(
                NotOp(
                    NestedKeywordOp(
                        Keyword("refersto"),
                        KeywordOp(Keyword("control_number"), Value("1374998")),
                    )
                ),
                NestedKeywordOp(
                    Keyword("citedby"), ValueOp(Value("A.A.Aguilar.Arevalo.1"))
                ),
            ),
        ),
        (
            "citedby:(author A.A.Aguilar.Arevalo.1 and not a ellis)",
            NestedKeywordOp(
                Keyword("citedby"),
                AndOp(
                    KeywordOp(Keyword("author"), Value("A.A.Aguilar.Arevalo.1")),
                    NotOp(KeywordOp(Keyword("author"), Value("ellis"))),
                ),
            ),
        ),
        (
            "citedby:refersto:recid:1432705",
            NestedKeywordOp(
                Keyword("citedby"),
                NestedKeywordOp(
                    Keyword("refersto"),
                    KeywordOp(Keyword("control_number"), Value("1432705")),
                ),
            ),
        ),
        # Ranges
        (
            "d 2015->2017 and cited:1->9",
            AndOp(
                KeywordOp(Keyword("date"), RangeOp(Value("2015"), Value("2017"))),
                KeywordOp(Keyword("topcite"), RangeOp(Value("1"), Value("9"))),
            ),
        ),
        # Empty query
        ("", EmptyQuery()),
        ("      ", EmptyQuery()),
        # G, GE, LT, LE, E queries
        (
            "date > 2000-10 and date < 2000-12",
            AndOp(
                KeywordOp(Keyword("date"), GreaterThanOp(Value("2000-10"))),
                KeywordOp(Keyword("date"), LessThanOp(Value("2000-12"))),
            ),
        ),
        (
            "date after 10/2000 and date before 2000-12",
            AndOp(
                KeywordOp(Keyword("date"), GreaterThanOp(Value("10/2000"))),
                KeywordOp(Keyword("date"), LessThanOp(Value("2000-12"))),
            ),
        ),
        (
            "date >= nov 2000 and d<=2005",
            AndOp(
                KeywordOp(Keyword("date"), GreaterEqualThanOp(Value("nov 2000"))),
                KeywordOp(Keyword("date"), LessEqualThanOp(Value("2005"))),
            ),
        ),
        (
            "date 1978+ + -ac 100+",
            AndOp(
                KeywordOp(Keyword("date"), GreaterEqualThanOp(Value("1978"))),
                NotOp(
                    KeywordOp(Keyword("author-count"), GreaterEqualThanOp(Value("100")))
                ),
            ),
        ),
        (
            "f a wimpenny and date = 1987",
            AndOp(
                KeywordOp(Keyword("author"), Value("wimpenny")),
                KeywordOp(Keyword("date"), Value("1987")),
            ),
        ),
        # Date specifiers
        (
            "date today - 2 and title foo",
            AndOp(
                KeywordOp(
                    Keyword("date"), Value(str(date.today() - timedelta(days=2)))
                ),
                KeywordOp(Keyword("title"), Value("foo")),
            ),
        ),
        (
            "date today - 0 and title foo",
            AndOp(
                KeywordOp(Keyword("date"), Value(str(date.today()))),
                KeywordOp(Keyword("title"), Value("foo")),
            ),
        ),
        (
            "date today - title foo",
            AndOp(
                KeywordOp(Keyword("date"), Value(str(date.today()))),
                NotOp(KeywordOp(Keyword("title"), Value("foo"))),
            ),
        ),
        (
            "date this month and author ellis",
            AndOp(
                KeywordOp(Keyword("date"), Value(str(date.today()))),
                KeywordOp(Keyword("author"), Value("ellis")),
            ),
        ),
        (
            "date this month - 3 and author ellis",
            AndOp(
                KeywordOp(
                    Keyword("date"), Value(str(date.today() - relativedelta(months=3)))
                ),
                KeywordOp(Keyword("author"), Value("ellis")),
            ),
        ),
        (
            "date yesterday - 2 - ac 100",
            AndOp(
                KeywordOp(
                    Keyword("date"), Value(str(date.today() - relativedelta(days=3)))
                ),
                NotOp(KeywordOp(Keyword("author-count"), Value("100"))),
            ),
        ),
        (
            pytest.param(
                "date last month - 2 + ac < 50",
                AndOp(
                    KeywordOp(
                        Keyword("date"),
                        Value(str(date.today() - relativedelta(months=3))),
                    ),
                    KeywordOp(Keyword("author-count"), LessThanOp(Value("50"))),
                ),
                marks=pytest.mark.xfail(
                    reason="doesn't work on 31st of the month, see INSPIR-2882"
                ),
            )
        ),
        (
            "du > yesterday - 2",
            KeywordOp(
                Keyword("date-updated"),
                GreaterThanOp(Value(str(date.today() - relativedelta(days=3)))),
            ),
        ),
        # Wildcard queries
        (
            "find a 'o*aigh' and t \"alge*\" and date >2013",
            AndOp(
                KeywordOp(
                    Keyword("author"),
                    PartialMatchValue("o*aigh", contains_wildcard=True),
                ),
                AndOp(
                    KeywordOp(Keyword("title"), ExactMatchValue("alge*")),
                    KeywordOp(Keyword("date"), GreaterThanOp(Value("2013"))),
                ),
            ),
        ),
        (
            "a *alge | a alge* | a o*aigh",
            OrOp(
                KeywordOp(Keyword("author"), Value("*alge", contains_wildcard=True)),
                OrOp(
                    KeywordOp(
                        Keyword("author"), Value("alge*", contains_wildcard=True)
                    ),
                    KeywordOp(
                        Keyword("author"), Value("o*aigh", contains_wildcard=True)
                    ),
                ),
            ),
        ),
        (
            "find texkey Hirata:1992*",
            KeywordOp(
                Keyword("texkeys.raw"), Value("Hirata:1992*", contains_wildcard=True)
            ),
        ),
        # Queries for implicit "and" removal
        ("title and foo", AndOp(ValueOp(Value("title")), ValueOp(Value("foo")))),
        ("author takumi doi", KeywordOp(Keyword("author"), Value("takumi doi"))),
        (
            "title cms and title experiment and date 2008",
            AndOp(
                KeywordOp(Keyword("title"), Value("cms")),
                AndOp(
                    KeywordOp(Keyword("title"), Value("experiment")),
                    KeywordOp(Keyword("date"), Value("2008")),
                ),
            ),
        ),
        (
            "author:witten title:foo",
            AndOp(
                KeywordOp(Keyword("author"), Value("witten")),
                KeywordOp(Keyword("title"), Value("foo")),
            ),
        ),
        # Unrecognized queries
        (
            "title γ-radiation and and",
            QueryWithMalformedPart(
                KeywordOp(Keyword("title"), Value("γ-radiation")),
                MalformedQuery(["and", "and"]),
            ),
        ),
        (
            "find j Nucl.Phys.,A531,11",
            KeywordOp(Keyword("journal"), Value("Nucl.Phys.,A531,11")),
        ),
        (
            "find j Nucl.Phys. and j Nucl.Phys.",
            AndOp(
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
            ),
        ),
        (
            "find j Nucl.Phys. and vol A351 and author ellis",
            AndOp(
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.,A351")),
                KeywordOp(Keyword("author"), Value("ellis")),
            ),
        ),
        (
            (
                "find j Nucl.Phys. and vol A351 and author ellis and author smith and"
                " ea john"
            ),
            AndOp(
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.,A351")),
                AndOp(
                    KeywordOp(Keyword("author"), Value("ellis")),
                    AndOp(
                        KeywordOp(Keyword("author"), Value("smith")),
                        KeywordOp(Keyword("exact-author"), Value("john")),
                    ),
                ),
            ),
        ),
        (
            "find j Nucl.Phys. and vol A531",
            KeywordOp(Keyword("journal"), Value("Nucl.Phys.,A531")),
        ),
        (
            "find j Nucl.Phys. and author ellis",
            AndOp(
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
                KeywordOp(Keyword("author"), Value("ellis")),
            ),
        ),
        (
            "find author ellis and j Nucl.Phys. and vol B351 and title Collider",
            AndOp(
                KeywordOp(Keyword("author"), Value("ellis")),
                AndOp(
                    KeywordOp(Keyword("journal"), Value("Nucl.Phys.,B351")),
                    KeywordOp(Keyword("title"), Value("Collider")),
                ),
            ),
        ),
        (
            "find j Nucl.Phys. and not vol A531",
            KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
        ),
        # regression with date keyword followed by string not containing date
        (
            "find da Silva and j Nucl.Phys.",
            AndOp(
                ValueOp(Value("da Silva")),
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
            ),
        ),
        (
            "find j Nucl.Phys. and not vol A531 and a ellis and a john",
            AndOp(
                KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
                AndOp(
                    KeywordOp(Keyword("author"), Value("ellis")),
                    KeywordOp(Keyword("author"), Value("john")),
                ),
            ),
        ),
    ],
)
def test_restructuring_visitor_functionality(query_str, expected_parse_tree):
    print("Parsing: " + query_str)
    stateful_parser = StatefulParser()
    restructuring_visitor = RestructuringVisitor()
    _, parse_tree = stateful_parser.parse(query_str, parser.Query)
    parse_tree = parse_tree.accept(restructuring_visitor)

    assert parse_tree == expected_parse_tree


def test_foo_bar():
    query_str = "find j Nucl.Phys. and not vol A531 and a ellis"
    print("Parsing: " + query_str)
    stateful_parser = StatefulParser()
    restructuring_visitor = RestructuringVisitor()
    _, parse_tree = stateful_parser.parse(query_str, parser.Query)
    parse_tree = parse_tree.accept(restructuring_visitor)
    expected_parse_tree = AndOp(
        KeywordOp(Keyword("journal"), Value("Nucl.Phys.")),
        KeywordOp(Keyword("author"), Value("ellis")),
    )

    assert parse_tree == expected_parse_tree


@pytest.mark.parametrize(
    ("query_str", "expected_parse_tree"),
    [
        (
            "sungtae cho or 1301.7261",
            OrOp(ValueOp(Value("sungtae cho")), ValueOp(Value("1301.7261"))),
        ),
        (
            "raffaele d'agnolo and not cn cms",
            AndOp(
                ValueOp(Value("raffaele d'agnolo")),
                NotOp(KeywordOp(Keyword("collaboration"), Value("cms"))),
            ),
        ),
        ("a kondrashuk", KeywordOp(Keyword("author"), Value("kondrashuk"))),
        ("a r.j.hill.1", KeywordOp(Keyword("author"), Value("r.j.hill.1"))),
        (
            "a fileviez perez,p or p. f. perez",
            OrOp(
                KeywordOp(Keyword("author"), Value("fileviez perez,p")),
                KeywordOp(Keyword("author"), Value("p. f. perez")),
            ),
        ),
        (
            "a espinosa,jose r and not a rodriguez espinosa",
            AndOp(
                KeywordOp(Keyword("author"), Value("espinosa,jose r")),
                NotOp(KeywordOp(Keyword("author"), Value("rodriguez espinosa"))),
            ),
        ),
        (
            "a nilles,h and not tc I",
            AndOp(
                KeywordOp(Keyword("author"), Value("nilles,h")),
                NotOp(KeywordOp(Keyword("type-code"), Value("I"))),
            ),
        ),
        (
            (
                "a rojo,j. or rojo-chacon,j. and not collaboration pierre auger "
                "and not collaboration auger and not t auger and tc p"
            ),
            AndOp(
                OrOp(
                    KeywordOp(Keyword("author"), Value("rojo,j.")),
                    KeywordOp(Keyword("author"), Value("rojo-chacon,j.")),
                ),
                AndOp(
                    NotOp(KeywordOp(Keyword("collaboration"), Value("pierre auger"))),
                    AndOp(
                        NotOp(KeywordOp(Keyword("collaboration"), Value("auger"))),
                        AndOp(
                            NotOp(KeywordOp(Keyword("title"), Value("auger"))),
                            KeywordOp(Keyword("type-code"), Value("p")),
                        ),
                    ),
                ),
            ),
        ),
        (
            "ea wu, xing gang",
            KeywordOp(Keyword("exact-author"), Value("wu, xing gang")),
        ),
        (
            "abstract: part*",
            KeywordOp(Keyword("abstract"), Value("part*", contains_wildcard=True)),
        ),
        (
            (
                "(author:'Hiroshi Okada' OR (author:'H Okada' hep-ph) OR "
                "title: 'Dark matter in supersymmetric U(1(B-L) model' OR "
                "title: 'Non-Abelian discrete symmetry for flavors')"
            ),
            OrOp(
                KeywordOp(Keyword("author"), PartialMatchValue("Hiroshi Okada")),
                OrOp(
                    AndOp(
                        KeywordOp(Keyword("author"), PartialMatchValue("H Okada")),
                        ValueOp(Value("hep-ph")),
                    ),
                    OrOp(
                        KeywordOp(
                            Keyword("title"),
                            PartialMatchValue(
                                "Dark matter in supersymmetric U(1(B-L) model"
                            ),
                        ),
                        KeywordOp(
                            Keyword("title"),
                            PartialMatchValue(
                                "Non-Abelian discrete symmetry for flavors"
                            ),
                        ),
                    ),
                ),
            ),
        ),
        (
            'author:"Takayanagi, Tadashi" or hep-th/0010101',
            OrOp(
                KeywordOp(Keyword("author"), ExactMatchValue("Takayanagi, Tadashi")),
                ValueOp(Value("hep-th/0010101")),
            ),
        ),
        ("ea:matt visser", KeywordOp(Keyword("exact-author"), Value("matt visser"))),
        (
            "citedby:recid:902780",
            NestedKeywordOp(
                Keyword("citedby"),
                KeywordOp(Keyword("control_number"), Value("902780")),
            ),
        ),
        (
            "eprint:arxiv:1706.04080",
            KeywordOp(Keyword("eprint"), Value("arxiv:1706.04080")),
        ),
        ("eprint:1706.04080", KeywordOp(Keyword("eprint"), Value("1706.04080"))),
        (
            "f a ostapchenko not olinto not haungs",
            AndOp(
                KeywordOp(Keyword("author"), Value("ostapchenko")),
                AndOp(
                    NotOp(KeywordOp(Keyword("author"), Value("olinto"))),
                    NotOp(KeywordOp(Keyword("author"), Value("haungs"))),
                ),
            ),
        ),
        ("find cc italy", KeywordOp(Keyword("country"), Value("italy"))),
        (
            "fin date > today",
            KeywordOp(Keyword("date"), GreaterThanOp(Value(str(date.today())))),
        ),
        (
            "find r atlas-conf-*",
            KeywordOp(
                Keyword("reportnumber"), Value("atlas-conf-*", contains_wildcard=True)
            ),
        ),
        (
            'find caption "Diagram for the fermion flow violating process"',
            KeywordOp(
                Keyword("caption"),
                ExactMatchValue("Diagram for the fermion flow violating process"),
            ),
        ),
    ],
)
def test_parsing_output_with_inspire_next_tests(query_str, expected_parse_tree):
    print("Parsing: " + query_str)
    stateful_parser = StatefulParser()
    restructuring_visitor = RestructuringVisitor()
    _, parse_tree = stateful_parser.parse(query_str, parser.Query)
    parse_tree = parse_tree.accept(restructuring_visitor)

    assert parse_tree == expected_parse_tree


def test_convert_simple_value_boolean_query_to_and_boolean_queries():
    parse_tree = parser.SimpleQuery(
        parser.SpiresKeywordQuery(
            parser.InspireKeyword("author"),
            parser.Value(
                parser.SimpleValueBooleanQuery(
                    parser.SimpleValue("foo"),
                    parser.And(),
                    parser.SimpleValueBooleanQuery(
                        parser.SimpleValue("bar"),
                        parser.Or(),
                        parser.SimpleValueNegation(parser.SimpleValue("foobar")),
                    ),
                )
            ),
        )
    )

    expected_parse_tree = AndOp(
        KeywordOp(Keyword("author"), Value("foo")),
        OrOp(
            KeywordOp(Keyword("author"), Value("bar")),
            NotOp(KeywordOp(Keyword("author"), Value("foobar"))),
        ),
    )

    restructuring_visitor = RestructuringVisitor()
    parse_tree = parse_tree.accept(restructuring_visitor)

    assert parse_tree == expected_parse_tree


def test_visit_complex_value_with_new_complex_value_category():
    node = parser.ComplexValue("$foo$")
    restructuring_visitor = RestructuringVisitor()
    parse_tree = node.accept(restructuring_visitor)

    assert parse_tree == Value(node.value)
