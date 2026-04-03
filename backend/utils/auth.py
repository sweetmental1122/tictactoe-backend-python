import hashlib
import hmac
import uuid
from rest_framework_simplejwt.tokens import RefreshToken
from db.models import User


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hmac.compare_digest(hash_password(password), hashed)


def get_tokens_for_user(user: User) -> dict:
    refresh = RefreshToken()
    refresh['user_id'] = str(user.id)
    refresh['username'] = user.username
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def generate_room_id() -> str:
    return str(uuid.uuid4())[:8].upper()
