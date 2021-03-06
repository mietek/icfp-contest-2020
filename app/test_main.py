import pytest

from app import main


class TestDemodulateBits:
    @pytest.mark.parametrize('bits,num,rest_bits',
                             [([0, 1, 0], 0, []),
                              ([0, 1, 1, 0, 0, 0, 0, 1], 1, []),
                              ([0, 1, 1, 0, 1, 1, 1, 1], 15, []),
                              ([0, 1, 1, 0, 1, 1, 1, 1, 0, 1], 15, [0, 1]),
                              ([0, 1, 1, 0, 1, 1, 1], 14, [])])
    def test_pos_numbers(self, bits, num, rest_bits):
        assert main.demodulate_bits(bits) == (num, rest_bits)

    @pytest.mark.parametrize('bits,num,rest_bits',
                             [([1, 0, 0], 0, []),
                              ([1, 0, 1, 0, 0, 0, 0, 1], -1, []),
                              ([1, 0, 1, 0, 1, 1, 1, 1], -15, [])])
    def test_neg_numbers(self, bits, num, rest_bits):
        assert main.demodulate_bits(bits) == (num, rest_bits)

    @pytest.mark.parametrize('bits,rest_bits',
                             [([0, 0], []),
                              ([0, 0, 0], [0]),
                              ([0, 0, 1], [1])])
    def test_nil(self, bits, rest_bits):
        assert main.demodulate_bits(bits) == (None, rest_bits)

    @pytest.mark.parametrize('bits,val,rest_bits',
                             [([1, 1, 0, 0, 0, 0], main.Cons(None, None), []),
                              ([1, 1, 0, 1, 0, 0, 0], main.Cons(0, None), []),
                              ([1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0], main.Cons(1, None), []),
                              ([1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0], main.Cons(2, None), []),
                              ([1, 1, 0, 1, 0, 0, 1, 0], main.Cons(0, 0), []),
                              ([1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
                               main.Cons(1, main.Cons(2, None)), [])])
    def test_neg_numbers(self, bits, val, rest_bits):
        assert main.demodulate_bits(bits) == (val, rest_bits)


class TestModulate:
    @pytest.mark.parametrize('val,bits',
                             [(0, [0, 1, 0]),
                              (1, [0, 1, 1, 0, 0, 0, 0, 1]),
                              (2, [0, 1, 1, 0, 0, 0, 1, 0]),
                              (15, [0, 1, 1, 0, 1, 1, 1, 1]),
                              (17, [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1]),
                              (-4, [1, 0, 1, 0, 0, 1, 0, 0])])
    def test_numbers(self, val, bits):
        assert main.modulate(val) == bits

    @pytest.mark.parametrize('val,bits',
                             [(main.Cons(None, None), [1, 1, 0, 0, 0, 0]),
                              (main.Cons(1, 2), [1, 1,
                                                 0, 1, 1, 0, 0, 0, 0, 1,
                                                 0, 1, 1, 0, 0, 0, 1, 0]),
                              (main.Cons(1, main.Cons(2, None)),
                               [1, 1,
                                0, 1, 1, 0, 0, 0, 0, 1,
                                1, 1,
                                0, 1, 1, 0, 0, 0, 1, 0,
                                0, 0])])
    def test_cons(self, val, bits):
        assert main.modulate(val) == bits


class TestDSL:
    @pytest.mark.parametrize('dsl', [None,
                                     0,
                                     1,
                                     -1,
                                     [None],
                                     [0],
                                     [1],
                                     [-1],
                                     [1, [2]],
                                     [1, [2], [3]],
                                     [1, [2, [3]]],
                                     [[[1], 2], 3]])
    def test_dsl_round_trip(self, dsl):
        assert main.parse_response_body(main.make_request_body(dsl)) == dsl


@pytest.mark.parametrize('tree,dsl',
                         [(main.Cons(0, None), [0]),
                          (main.Cons(None, None), [None]),
                          (main.Cons(main.Cons(1, None),
                                     main.Cons(main.Cons(2, None),
                                               None)),
                           [[1],
                            [2]]),
                          (main.Cons(1, 2), [1, 2]), # the problematic response data
                          (main.Cons(1, main.Cons(2, None)), [1, 2])
                          ])
def test_cons_tree_to_list(tree, dsl):
    assert main.cons_tree_to_list(tree) == dsl
