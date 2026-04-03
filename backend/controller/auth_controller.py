from db.models import User
from utils.auth import hash_password, verify_password, get_tokens_for_user


def register_user(username: str, email: str, password: str):
    if User.objects(username=username).first():
        return None, 'Username already exists'
    if User.objects(email=email).first():
        return None, 'Email already exists'
    user = User(username=username, email=email, password=hash_password(password))
    user.save()
    tokens = get_tokens_for_user(user)
    return {'user': user.to_dict(), 'tokens': tokens}, None


def login_user(username: str, password: str):
    user = User.objects(username=username).first()
    if not user or not verify_password(password, user.password):
        return None, 'Invalid credentials'
    tokens = get_tokens_for_user(user)
    return {'user': user.to_dict(), 'tokens': tokens}, None
