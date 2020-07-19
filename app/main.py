import sys
import math
import itertools as itt
import typing as t

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


def demodulate_bits(bits: [bool]) -> t.Tuple[t.Union[int, list],
                                              t.List[bool]]:
    if bits[:2] == [1, 1]:
        # cons cell
        pass

    elif bits[:2] == [0, 1]:
        # positive number
        width_bits = list(_subsequent_ones(bits[2:]))
        n_width_bits = len(width_bits)
        n_number_bits = 4 * n_width_bits
        end_bit_index = 2 + n_width_bits + 1 + n_number_bits
        number_bits = list(_slice_with_fill(bits,
                                            0,
                                            2 + n_width_bits + 1,
                                            end_bit_index))
        return _int_from_bits(number_bits), bits[end_bit_index:]

    elif bits[:2] == [1, 0]:
        # negative number
        pass
    else:
        raise ValueError(f'Invalid starting bits: {bits}')


if False:
    print(demodulate_bits([0, 1, 0]))

    print(demodulate_bits([0, 1, 1, 0, 0, 0, 0, 1]))
    print(demodulate_bits([0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1]))

    print(demodulate_bits([0, 1, 1, 0, 1, 1, 1, 0]))
    print(demodulate_bits([0, 1, 1, 0, 1, 1, 1]))
    print(demodulate_bits([0, 1, 1, 0, 1, 1, 1, 0, 0]))

    print(list(_subsequent_ones([1, 0, 1])))
