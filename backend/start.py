"""
Run this instead of manage.py runserver.
Starts Daphne ASGI server which supports both HTTP and WebSocket.
"""
import sys
import os

# Add backend root to path so all modules resolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from daphne.cli import CommandLineInterface

if __name__ == '__main__':
    sys.argv = [
        'daphne',
        '-b', '0.0.0.0',
        '-p', '8000',
        'servers.asgi:application',
    ]
    CommandLineInterface.entrypoint()
