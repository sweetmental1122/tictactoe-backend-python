import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from db.models import User
from controller.game_controller import make_move, get_room


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'game_{self.room_id}'

        query = self.scope.get('query_string', b'').decode()
        token_str = ''
        for part in query.split('&'):
            if part.startswith('token='):
                token_str = part.split('=', 1)[1]

        self.user = await self.get_user(token_str)
        if not self.user:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        room_data, _ = await database_sync_to_async(get_room)(self.room_id)
        await self.send(json.dumps({'type': 'room_state', 'data': room_data}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        msg = json.loads(text_data)
        if msg.get('type') == 'move':
            position = msg.get('position')
            data, error = await database_sync_to_async(make_move)(
                self.room_id, self.user, position
            )
            if error:
                await self.send(json.dumps({'type': 'error', 'message': error}))
                return
            await self.channel_layer.group_send(
                self.group_name,
                {'type': 'game_update', 'data': data}
            )

    async def game_update(self, event):
        await self.send(json.dumps({'type': 'room_state', 'data': event['data']}))

    @database_sync_to_async
    def get_user(self, token_str):
        try:
            token = AccessToken(token_str)
            return User.objects(id=token['user_id']).first()
        except Exception:
            return None
