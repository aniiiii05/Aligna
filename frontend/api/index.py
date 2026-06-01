"""
Vercel serverless entrypoint when the Vercel Root Directory is `frontend`.
"""
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parent
FRONTEND_ROOT = API_DIR.parent

# buildCommand copies ../backend -> frontend/backend before deploy
BACKEND = FRONTEND_ROOT / "backend"
if not (BACKEND / "server.py").is_file():
    BACKEND = FRONTEND_ROOT.parent / "backend"

sys.path.insert(0, str(BACKEND))
sys.path.insert(0, str(FRONTEND_ROOT.parent))

from server import app  # noqa: E402
from mangum import Mangum

handler = Mangum(app, lifespan="off")
