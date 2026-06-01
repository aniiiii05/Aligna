"""
Vercel serverless entrypoint when the Vercel Root Directory is `frontend`.
Repo-root deploys use /api/index.py instead.
"""
import sys
from pathlib import Path

# frontend/api/index.py -> repo root is two levels up
ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
sys.path.insert(0, str(ROOT))

from server import app  # noqa: E402
from mangum import Mangum

handler = Mangum(app, lifespan="off")
