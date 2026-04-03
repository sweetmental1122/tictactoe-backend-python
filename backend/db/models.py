import mongoengine as me
from datetime import datetime


class User(me.Document):
    username = me.StringField(required=True, unique=True, max_length=50)
    email = me.StringField(required=True, unique=True)
    password = me.StringField(required=True)  # hashed
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'users'}

    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'created_at': str(self.created_at),
        }


class GameRoom(me.Document):
    room_id = me.StringField(required=True, unique=True)
    name = me.StringField(default='')
    creator = me.ReferenceField(User, required=True)
    players = me.ListField(me.ReferenceField(User), max_length=2)
    board = me.ListField(me.StringField(), default=lambda: [''] * 9)
    current_turn = me.ReferenceField(User, null=True)
    winner = me.ReferenceField(User, null=True)
    status = me.StringField(
        choices=['waiting', 'active', 'finished'],
        default='waiting'
    )
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'gamerooms'}

    def to_dict(self):
        return {
            'room_id': self.room_id,
            'name': self.name or self.room_id,
            'creator': self.creator.username if self.creator else None,
            'players': [p.username for p in self.players],
            'board': self.board,
            'current_turn': self.current_turn.username if self.current_turn else None,
            'winner': self.winner.username if self.winner else None,
            'status': self.status,
            'created_at': str(self.created_at),
        }
