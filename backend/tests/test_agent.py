import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from agent import run_browser_task

@pytest.mark.asyncio
async def test_agent_initializes():
    os.environ["BROWSER_HEADLESS"] = "True"
    
    result = await run_browser_task("Go to google.com and return the page title")
    assert isinstance(result, str)
    assert len(result) > 0
