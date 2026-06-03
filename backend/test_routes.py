import sys
sys.path.insert(0, ".")
from main import app
print("Registered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', {'GET'})
        print(f"  {methods} {route.path}")
