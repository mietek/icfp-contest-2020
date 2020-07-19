import sys
import math
import itertools as itt
import typing as t
import collections as c
import sys
import functools as fnt

import requests


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


def _iter_cons_tree(cons_tree: Cons):
    car, cdr = cons_tree

    if isinstance(car, Cons):
        yield list(_iter_cons_tree(car))
    else:
        yield car

    if cdr is not None:
        yield from _iter_cons_tree(cdr)


# It's the notation we use for specifying transmittable data
# without implementing the alien language AST terms:
# `nil` is `None`
# `42` is 42
# `ap ap cons 42 nil` is [42]
# `ap ap cons 1 ap ap cons 2 nil` is `[1, 2]`
DSL = t.Union[None,
              int,
              t.List['DSL']]


def _cons_tree_to_list(cons_tree) -> DSL:
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


def _make_cons_tree(val: DSL):
    if val is None or val == []:
        return None

    elif isinstance(val, int):
        return val

    elif isinstance(val, list):
        head, *rest = val
        return Cons(_make_cons_tree(head), _make_cons_tree(rest))

    else:
        raise ValueError(f"Can't transform {val} of type {type(val)} to cons tree")


if False:
    print(_make_cons_tree(0))
    print(_make_cons_tree([0]))
    print(_make_cons_tree(None))
    print(_make_cons_tree([None]))


def make_request_body(val: DSL) -> str:
    bits = modulate(_make_cons_tree(val))
    return ''.join(map(str, bits))


def parse_response_body(body: str) -> DSL:
    bits = list(map(int, body))
    assert set(bits).issubset({0, 1}), f'Invalid characters in {body}'
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
        return url


def _log_info(msg):
    print(msg)


def send_dsl(val: DSL, server_url, api_key=None):
    '''Send value encoded in the Python DSL, that is:
    `nil` is `None`
    `42` is 42
    `ap ap cons 42 nil` is [42]
    `ap ap cons 1 ap ap cons 2 nil` is `[1, 2]`
    '''
    bit_str = make_request_body(val)
    _log_info(f'Sending {val} encoded as {bit_str}')
    resp = requests.post(url=_request_url(server_url, api_key),
                         data=bit_str.encode())
    resp.raise_for_status()

    resp_dsl = parse_response_body(resp.text)
    _log_info(f'Response: {resp.status_code}, body: {resp.text}, dsl: {resp_dsl}')

    return resp_dsl


# For backwards compatibility
send_val = send_dsl


if False:
    # __api_key = '<PUT API KEY HERE>'
    print(send_dsl([0], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_dsl([1], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_dsl([1, None, None], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_dsl([1, None, None], 'https://icfpc2020-api.testkontur.ru', __api_key))
    print(send_dsl([1, 0], 'https://icfpc2020-api.testkontur.ru', __api_key))

    print(send_dsl([2, 1113939892088752268, None], 'https://icfpc2020-api.testkontur.ru', __api_key))


def _countdown_request_dsl():
    return [0]


def _create_request_dsl():
    '''https://message-from-space.readthedocs.io/en/latest/game.html#create
    '''
    return [1, 0]


def _join_request_dsl(player_key: int):
    '''https://message-from-space.readthedocs.io/en/latest/game.html#join
    '''
    return [2, player_key, None]


def _start_request_dsl(player_key: int, x0, x1, x2, x3):
    '''https://message-from-space.readthedocs.io/en/latest/game.html#start
    `x0`...`x3` - "initial ship parameters", whatever that means. Probably positive ints.
    '''
    return [3, player_key, [x0, x1, x2, x3]]


def _commands_request_dsl(player_key: int, commands: t.List[t.List[DSL]]):
    '''https://message-from-space.readthedocs.io/en/latest/game.html#commands
    Each command in `commands` is a list of shape `[type, ship_id, ...]` where ... is command-specific parameters.
    '''
    return [4, player_key, commands]


DSLVector = t.List[int]


def _accelerate_command_dsl(ship_id: int, vector: DSLVector):
    '''Accelerates ship identified by `ship_id` to the direction opposite to `vector`.'''
    return [0, ship_id, vector]


def _detonate_command_dsl(ship_id: int):
    '''Detonates `ship_id`'''
    return [1, ship_id]


def _shoot_command_dsl(ship_id: int, target: DSLVector, x3):
    '''`target` is a vector with coordinates of the shooting target.
    `x3` is unknown.
    '''
    return [2, ship_id, target, x3]


def _parse_create_response(resp) -> (int, int):
    '''Returns attacker, defender player key'''
    (success,
     ((attacker_flag, attacker_key),
      (defender_flag, defender_key))) = resp

    assert success == 1, f'Invalid create response {resp}'
    assert attacker_flag == 0, f'Invalid create response {resp}'
    assert defender_flag == 1, f'Invalid create response {resp}'

    return attacker_key, defender_key


def _parse_game_stage(game_stage: DSL):
    if game_stage == 0:
        return 'not_started_yet'
    elif game_stage == 1:
        return 'already_started'
    elif game_stage == 2:
        return 'finished'
    else:
        raise ValueError(f'Invalid game stage: {game_stage}')


def _parse_role(role):
    if role == 0:
        return 'attacker'
    elif role == 1:
        return 'defender'
    else:
        raise ValueError(f'Invalid game role: {role}')


def _parse_static_game_info(info):
    if info is None:
        return None

    x0, role, x2, x3, x4 = info
    return {'role': _parse_role(role),
            'x0': x0,
            'x2': x2,
            'x3': x3,
            'x4': x4}


def _parse_game_state(state):
    if state is None:
        return None

    game_tick, x1, ships_and_commands = state
    return {'game_tick': game_tick,
            'x1': x1,
            'ships_and_commands': ships_and_commands}


def _parse_game_response(game_resp: DSL):
    if game_resp == [0]:
        return {'success': False}
    else:
        success, game_stage, static_game_info, game_state = game_resp
        assert success == 1, f'Invalid `success` in game response {game_resp}'

        return {'success': success,
                'game_stage': _parse_game_stage(game_stage),
                'static_game_info': _parse_static_game_info(static_game_info),
                'game_state': _parse_game_state(game_state)}


TEST_SERVER_URL = 'https://icfpc2020-api.testkontur.ru'
API_KEY = '69169703bf0e41f99bec6790ff8ec971'


def send_to_test(dsl):
    return send_dsl(dsl, TEST_SERVER_URL, API_KEY)


def send_create(sender_f=None):
    if sender_f is None:
        sender_f = send_to_test

    return _parse_create_response(sender_f(_create_request_dsl()))


def send_join(player_key, sender_f=None):
    if sender_f is None:
        sender_f = send_to_test

    return _parse_game_response(sender_f(_join_request_dsl(player_key)))


def send_start(player_key, x0, x1, x2, x3, sender_f=None):
    # NOTE(Alex): I couldn't verify if this works yet because our requests hang up.
    if sender_f is None:
        sender_f = send_to_test

    return _parse_game_response(sender_f(_start_request_dsl(player_key, x0, x1, x2, x3)))


def send_commands(player_key, commands, sender_f=None):
    # NOTE(Alex): I couldn't verify if this works yet because our requests hang up.
    if sender_f is None:
        sender_f = send_to_test

    return _parse_game_response(sender_f(_commands_request_dsl(player_key, commands)))


if False:
    print(send_to_test(_countdown_request_dsl()))

    print(_parse_create_response(send_dsl(_create_request_dsl(),
                                          TEST_SERVER_URL, API_KEY)))

    print(send_to_test(_countdown_request_dsl()))

    print(send_create())

    print(send_join(6046928247735128822))

    print(send_join(1371299487238040913))


def main():
    server_url = sys.argv[1]
    player_key = sys.argv[2]
    print(f'server_url = {server_url}, player_key = {player_key}')

    player_key = int(player_key)

    sender_f = fnt.partial(send_dsl, server_url=server_url, api_key=None)

    print(f'Joining as {player_key}')
    send_join(player_key,
              sender_f=sender_f)

    print(f'Starting with arbitrary ship parameters')
    send_start(player_key,
               x0=42,
               x1=0,
               x2=0,
               x3=1,
               sender_f=sender_f)

    # TODO: use game_response and send commands
    print("There nothing more here, exiting.")


if __name__ == '__main__':
    main()
