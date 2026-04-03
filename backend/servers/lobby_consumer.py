import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from db.models import User
from controller.game_controller import list_all_rooms


class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query = self.scope.get('query_string', b'').decode()
        token_str = ''
        for part in query.split('&'):
            if part.startswith('token='):
                token_str = part.split('=', 1)[1]

        self.user = await self.get_user(token_str)
        if not self.user:
            await self.close()
            return

        await self.channel_layer.group_add('lobby', self.channel_name)
        await self.accept()

        # Send full room list on connect
        rooms = await database_sync_to_async(list_all_rooms)()
        await self.send(json.dumps({'type': 'lobby_update', 'rooms': rooms}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard('lobby', self.channel_name)

    async def receive(self, text_data):
        # Manual refresh request from client
        rooms = await database_sync_to_async(list_all_rooms)()
        await self.send(json.dumps({'type': 'lobby_update', 'rooms': rooms}))

    async def lobby_update(self, event):
        await self.send(json.dumps({'type': 'lobby_update', 'rooms': event['rooms']}))

    @database_sync_to_async
    def get_user(self, token_str):
        try:
            token = AccessToken(token_str)
            return User.objects(id=token['user_id']).first()
        except Exception:
            return None
