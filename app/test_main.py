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
