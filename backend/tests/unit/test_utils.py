from inspirehep.utils import chunker


def test_chunker():
    iterable = range(10)

    expected = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9]]
    result = chunker(iterable, 3)

    assert list(result) == expected


def test_chunker_with_min_num_chunks():
    iterable = range(5)

    expected = [[0, 1], [2, 3], [4]]
    result = chunker(iterable, 10, 3)

    assert list(result) == expected


def test_chunker_ignores_min_num_chunks_when_iterable_not_sized():
    iterable = iter(range(5))

    expected = [[0, 1, 2, 3, 4]]
    result = chunker(iterable, 10, 3)

    assert list(result) == expected


def test_chunker_doesnt_make_chunks_larger_than_max_chunk_size():
    iterable = range(5)
    expected = [[0, 1], [2, 3], [4]]
    result = chunker(iterable, 2, 2)

    assert list(result) == expected
