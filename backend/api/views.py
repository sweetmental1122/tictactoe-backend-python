from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

from controller.auth_controller import register_user, login_user
from controller.game_controller import (
    create_room, join_room, make_move, get_room, list_all_rooms
)
from api.middleware import get_user_from_token
from rest_framework.exceptions import AuthenticationFailed


def ok(data, status=200):
    return JsonResponse({'success': True, 'data': data}, status=status)


def err(msg, status=400):
    return JsonResponse({'success': False, 'error': msg}, status=status)


# ── Auth ──────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def signup(request):
    body = json.loads(request.body)
    data, error = register_user(
        body.get('username', ''),
        body.get('email', ''),
        body.get('password', ''),
    )
    if error:
        return err(error)
    return ok(data, 201)


@csrf_exempt
@require_http_methods(['POST'])
def signin(request):
    body = json.loads(request.body)
    data, error = login_user(body.get('username', ''), body.get('password', ''))
    if error:
        return err(error, 401)
    return ok(data)


# ── Game Room ─────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def create_game_room(request):
    try:
        user = get_user_from_token(request)
    except AuthenticationFailed as e:
        return err(str(e), 401)
    body = json.loads(request.body) if request.body else {}
    data, error = create_room(user, body.get('name', ''))
    if error:
        return err(error)
    return ok(data, 201)


@csrf_exempt
@require_http_methods(['POST'])
def join_game_room(request, room_id):
    try:
        user = get_user_from_token(request)
    except AuthenticationFailed as e:
        return err(str(e), 401)
    data, error = join_room(room_id, user)
    if error:
        return err(error)
    return ok(data)


@csrf_exempt
@require_http_methods(['POST'])
def game_move(request, room_id):
    try:
        user = get_user_from_token(request)
    except AuthenticationFailed as e:
        return err(str(e), 401)
    body = json.loads(request.body)
    data, error = make_move(room_id, user, int(body.get('position', -1)))
    if error:
        return err(error)
    return ok(data)


@require_http_methods(['GET'])
def room_detail(request, room_id):
    try:
        user = get_user_from_token(request)
    except AuthenticationFailed as e:
        return err(str(e), 401)
    data, error = get_room(room_id)
    if error:
        return err(error, 404)
    return ok(data)


@require_http_methods(['GET'])
def rooms_list(request):
    try:
        get_user_from_token(request)
    except AuthenticationFailed as e:
        return err(str(e), 401)
    return ok(list_all_rooms())
