import pytest

from app import collision

@pytest.mark.parametrize('start,end,square_origin,square_rad,expected',
                             [((5, 25), (0, -25), (0, 0), 18, True),
                              ((25, 25), (25, -25), (0, 0), 18, False)])
def test_segment_crosses_square(start, end, square_origin, square_rad, expected):
    assert collision.segment_crosses_square(start, end, square_origin, square_rad) == expected
