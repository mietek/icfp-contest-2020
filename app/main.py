import sys
import math
import itertools as itt
import typing as t
import collections as c

import requests


def main():
    server_url = sys.argv[1]
    player_key = sys.argv[2]
    print('ServerUrl: %s; PlayerKey: %s' % (server_url, player_key))

    res = requests.post(server_url, data=player_key)
    if res.status_code != 200:
        print('Unexpected server response:')
        print('HTTP code:', res.status_code)
        print('Response body:', res.text)
        exit(2)
    print('Server response:', res.text)


if __name__ == '__main__':
    main()


def _subsequent_ones(bits):
    for bit in bits:
        if bit:
            yield bit
        else:
            break


def _int_from_bits(bits: [bool]):
    if not bits:
        return 0
    return int(''.join(str(b) for b in bits), 2)


def _slice_with_fill(seq, fill, start, end):
    filled = itt.chain(seq, itt.repeat(fill))
    return itt.islice(filled, start, end)


def _demodulate_number(bits):
    '''Demodulate bits knowing that it's a positive or negative number, not a list.
    Uses `bits` without two initial "type bits".
    '''
    width_bits = list(_subsequent_ones(bits))
    n_width_bits = len(width_bits)
    n_number_bits = 4 * n_width_bits
    end_bit_index = n_width_bits + 1 + n_number_bits
    number_bits = list(_slice_with_fill(bits,
                                        0,
                                        n_width_bits + 1,
                                        end_bit_index))
    return _int_from_bits(number_bits), bits[end_bit_index:]


Cons = c.namedtuple('Cons', ['car', 'cdr'])


def demodulate_bits(bits: [bool]) -> t.Tuple[t.Union[int, Cons, None],
                                              t.List[bool]]:
    if bits[:2] == [0, 0]:
        # nil
        return None, bits[2:]

    elif bits[:2] == [0, 1]:
        # positive number
        return _demodulate_number(bits[2:])

    elif bits[:2] == [1, 0]:
        # negative number
        num, rest_bits = _demodulate_number(bits[2:])
        return -num, rest_bits

    elif bits[:2] == [1, 1]:
        # cons cell
        val1, rest1 = demodulate_bits(bits[2:])
        val2, rest2 = demodulate_bits(rest1)
        return Cons(val1, val2), rest2

    else:
        raise ValueError(f'Invalid starting bits: {bits}')


def _iter_cons_tree(cons_tree):
    car, cdr = cons_tree
    yield car
    if cdr is not None:
        yield from _iter_cons_tree(cdr)


def _cons_tree_to_list(cons_tree):
    return list(_iter_cons_tree(cons_tree))


if False:
    print(_cons_tree_to_list(Cons(2, None)))

    print(_cons_tree_to_list(Cons(1, Cons(2, None))))


def _bits_from_int(num):
    return list(map(int, f'{num:b}'))


def _binary_length(num):
    return len(_bits_from_int(num))


def _width_bits_length(num):
    return math.ceil(_binary_length(num) / 4)


def _modulate_number(num) -> [bool]:
    '''Returns modulated bits for the number, without the initial 2 "type bits".
    This allows using it for both positive and negative numbers.
    '''
    num = abs(num)
    n_width_bits = _width_bits_length(num)
    n_placeholder_bits = n_width_bits * 4 - _binary_length(num)

    return ([1] * n_width_bits +
            [0] +
            [0] * n_placeholder_bits +
            _bits_from_int(num))


def modulate(val: t.Union[int, Cons, None]) -> [bool]:
    if val is None:
        return [0, 0]

    elif isinstance(val, int):
        if val == 0:
            return [0, 1, 0]
        elif val > 0:
            return [0, 1] + _modulate_number(val)
        else:
            return [1, 0] + _modulate_number(val)

    elif isinstance(val, Cons):
        car, cdr = val
        return [1, 1] + modulate(car) + modulate(cdr)

    else:
        raise ValueError(f"Can't modulate value {val} of type {type(val)}")


def _make_cons_tree(val):
    if val is None or val == []:
        return None

    elif isinstance(val, int):
        return val

    elif isinstance(val, list):
        head, *rest = val
        return Cons(_make_cons_tree(head), _make_cons_tree(rest))

    else:
        raise ValueError("Can't transform {head} of type {type(head)} to cons tree")


if False:
    print(_make_cons_tree(0))
    print(_make_cons_tree([0]))
    print(_make_cons_tree(None))
    print(_make_cons_tree([None]))


def make_request_body(val: t.Union[int, list, None]) -> str:
    bits = modulate(_make_cons_tree(val))
    return ''.join(map(str, bits))


def parse_response_body(body: str):
    bits = list(map(int, body))
    assert set(bits) == {0, 1}, f'Invalid characters in {body}'
    demodulated, _ = demodulate_bits(bits)
    if isinstance(demodulated, Cons):
        return _cons_tree_to_list(demodulated)
    else:
        return demodulated


if False:
    print(make_request_body([1]))

    print(make_request_body(1))

    print(make_request_body([0]))

    print(parse_response_body('1101000'))
    print(parse_response_body('110110001011011111111111111110111101110101100000100110111000010001000101100100100010000000110000'))

    print(parse_response_body('1101100001110111110011100111010001100'))

    print(make_request_body([2, 1113939892088752268, None]))


def _request_url(server_url, api_key=None):
    url = f'{server_url}/aliens/send'
    if api_key is not None:
        return url + f'?apiKey={api_key}'
    else:
        url


def send_val(val, server_url, api_key=None):
    resp = requests.post(url=_request_url(server_url, api_key),
                         data=make_request_body(val).encode())
    resp.raise_for_status()

    return parse_response_body(resp.text)


if False:
    # __api_key = '<PUT API KEY HERE>'
    print(send_val([0], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_val([1], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_val([1, None, None], 'https://icfpc2020-api.testkontur.ru', __api_key))
