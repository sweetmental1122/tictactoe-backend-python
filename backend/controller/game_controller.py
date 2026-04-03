from db.models import User, GameRoom
from utils.auth import generate_room_id
from utils.game_logic import check_winner
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _broadcast_lobby():
    """Push updated room list to all lobby WebSocket subscribers."""
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            'lobby',
            {'type': 'lobby_update', 'rooms': list_all_rooms()}
        )


def create_room(creator: User, name: str = ''):
    room = GameRoom(
        room_id=generate_room_id(),
        name=name.strip() or f"{creator.username}'s Room",
        creator=creator,
        players=[creator],
        current_turn=creator,
        status='waiting',
    )
    room.save()
    _broadcast_lobby()
    return room.to_dict(), None


def join_room(room_id: str, user: User):
    room = GameRoom.objects(room_id=room_id).first()
    if not room:
        return None, 'Room not found'
    if room.status != 'waiting':
        return None, 'Room is not available'
    if len(room.players) >= 2:
        return None, 'Room is full'
    if user in room.players:
        return None, 'Already in room'
    room.players.append(user)
    room.status = 'active'
    room.save()
    _broadcast_lobby()
    return room.to_dict(), None


def make_move(room_id: str, user: User, position: int):
    room = GameRoom.objects(room_id=room_id).first()
    if not room:
        return None, 'Room not found'
    if room.status != 'active':
        return None, 'Game is not active'
    if room.current_turn.id != user.id:
        return None, 'Not your turn'
    if position < 0 or position > 8:
        return None, 'Invalid position'
    if room.board[position] != '':
        return None, 'Cell already taken'

    symbol = 'X' if user.id == room.creator.id else 'O'
    room.board[position] = symbol

    result = check_winner(room.board)
    if result:
        room.status = 'finished'
        if result != 'draw':
            room.winner = user
        _broadcast_lobby()
    else:
        other = [p for p in room.players if p.id != user.id]
        room.current_turn = other[0] if other else user

    room.save()
    return room.to_dict(), None


def get_room(room_id: str):
    room = GameRoom.objects(room_id=room_id).first()
    if not room:
        return None, 'Room not found'
    return room.to_dict(), None


def list_all_rooms():
    rooms = GameRoom.objects().order_by('-created_at')
    return [r.to_dict() for r in rooms]
