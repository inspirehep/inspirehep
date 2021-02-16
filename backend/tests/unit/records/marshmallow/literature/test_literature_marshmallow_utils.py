# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.literature.utils import latex_encode


def test_latex_encode_returns_none_when_input_is_none():
    assert latex_encode(None) is None


def test_latex_encode_escapes_special_chars():
    text = r" # $ % & \ _ ~ ^"
    expected = r" \# \$ \% \& \textbackslash{} \_ \textasciitilde{} \textasciicircum{}"

    assert expected == latex_encode(text)


def test_latex_encode_do_not_escape_curly_brakcets():
    text = r"Search for Axion Like Particle Production in 400-{GeV} Proton - Copper Interactions"
    expected = r"Search for Axion Like Particle Production in 400-{GeV} Proton - Copper Interactions"
    assert expected == latex_encode(text)


def test_latex_encode_escapes_non_ascii():
    text = "Rapčák"
    expected = r"Rap\v{c}\'ak"

    assert expected == latex_encode(text)


def test_latex_encode_escapes_math_by_default():
    text = r"Paper on $\gamma$-ray bursts and \(\mu\)-neutrinos \o/"
    expected = r"Paper on \$\textbackslash{}gamma\$-ray bursts and \textbackslash{}(\textbackslash{}mu\textbackslash{})-neutrinos \textbackslash{}o/"

    assert expected == latex_encode(text)


def test_latex_encode_preserves_math_when_contains_math_is_true():
    text = r"Paper on $\gamma$-ray bursts and \(\mu\)-neutrinos \o/"
    expected = r"Paper on $\gamma$-ray bursts and \(\mu\)-neutrinos \textbackslash{}o/"

    assert expected == latex_encode(text, contains_math=True)


def test_latex_encode_encodes_the_right_parts_when_contains_math_is_true_and_starts_with_math():
    text = r"$\alpha$ to ω"
    expected = r"$\alpha$ to \ensuremath{\omega}"

    assert expected == latex_encode(text, contains_math=True)


def test_latex_encode_is_correct_when_contains_math_is_true_and_no_math():
    text = r"Paper on γ-ray bursts and μ-neutrinos \o/"
    expected = r"Paper on \ensuremath{\gamma}-ray bursts and \ensuremath{\mu}-neutrinos \textbackslash{}o/"

    assert expected == latex_encode(text, contains_math=True)


def test_latex_encodes_understands_escaped_math_delimiters():
    text = r"How to make $\$ 10^100$ from $\alpha$ to Ω"
    expected = r"How to make $\$ 10^100$ from $\alpha$ to \ensuremath{\Omega}"

    assert expected == latex_encode(text, contains_math=True)
