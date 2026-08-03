"""
Volby Pilot Request Router

Determines whether a user message should be handled
as a normal Volby conversation or as an agent task.
"""

AGENT_TRIGGERS = (
    "create",
    "make",
    "build",
    "organize",
    "move",
    "rename",
    "delete",
    "send",
    "schedule",
    "open",
    "close",
    "download",
    "upload",
    "install",
    "run",
    "execute",
    "edit",
    "modify",
    "change",
    "fix",
)


def is_agent_request(message: str) -> bool:
    """
    Returns True when a message appears to request
    an action rather than a normal conversational answer.
    """

    if not message:
        return False

    text = message.strip().lower()

    return any(
        text.startswith(trigger)
        or f" {trigger} " in text
        for trigger in AGENT_TRIGGERS
    )


def route_request(message: str) -> str:
    """
    Returns either 'chat' or 'agent'.
    """

    if is_agent_request(message):
        return "agent"

    return "chat"