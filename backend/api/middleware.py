from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed
from db.models import User


def get_user_from_token(request):
    """Extract and validate JWT, return User document."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise AuthenticationFailed('No token provided')
    token_str = auth.split(' ')[1]
    try:
        token = AccessToken(token_str)
        user_id = token['user_id']
    except Exception:
        raise AuthenticationFailed('Invalid or expired token')
    user = User.objects(id=user_id).first()
    if not user:
        raise AuthenticationFailed('User not found')
    return user
