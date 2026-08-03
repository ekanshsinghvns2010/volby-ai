"""
Volby Pilot Request Router

First version of AI-powered intent routing.
"""

from typing import Literal


RequestMode = Literal["chat", "agent"]


def build_intent_prompt(message: str) -> str:
    """
    Creates a prompt for an AI model to classify
    whether the user wants normal conversation
    or wants Volby Pilot to perform an action.
    """

    return f"""
Classify the user's request into exactly one category:

CHAT
- The user wants information, explanation, advice,
  brainstorming, conversation, learning, or an answer.
- The user is not asking the AI to perform an external action.

AGENT
- The user wants the AI to perform an action,
  operate a tool, modify something, create something,
  manage something, send something, schedule something,
  or complete a real-world or computer task.

Important:
- "How do I organize my study schedule?" = CHAT
- "Organize my Downloads folder." = AGENT
- "Can you explain how to organize files?" = CHAT
- "Organize these files for me." = AGENT
- "Build me a website." = AGENT
- "What is a website?" = CHAT

Return ONLY one word:
CHAT
or
AGENT

User request:
{message}
"""


def parse_intent_result(result: str) -> RequestMode:
    """
    Converts the model's classification into
    a safe internal routing decision.
    """

    if not result:
        return "chat"

    result = result.strip().upper()

    if result == "AGENT":
        return "agent"

    return "chat"