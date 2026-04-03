from django.urls import path
from api.views import (
    signup, signin,
    create_game_room, join_game_room,
    game_move, room_detail, rooms_list,
)

urlpatterns = [
    # Auth
    path('api/auth/signup/', signup),
    path('api/auth/signin/', signin),

    # Game
    path('api/rooms/', rooms_list),
    path('api/rooms/create/', create_game_room),
    path('api/rooms/<str:room_id>/', room_detail),
    path('api/rooms/<str:room_id>/join/', join_game_room),
    path('api/rooms/<str:room_id>/move/', game_move),
]
