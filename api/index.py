"""
Vercel serverless entrypoint for Aligna FastAPI backend.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))
sys.path.insert(0, str(ROOT))

from server import app  # noqa: E402
from mangum import Mangum

handler = Mangum(app, lifespan="off")
