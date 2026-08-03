"""
VOLBY AI - VOLBY PILOT ROUTER

This module decides what kind of task the user is requesting.

The router does NOT execute tasks.
It only decides:
    1. Is this normal chat or an agent task?
    2. What type of agent task is it?

Supported task types:
    - conversation
    - code
    - file
    - website
    - terminal
    - github
    - research
    - deployment
    - unknown

Future architecture:

User
    ↓
Volby Core
    ↓
Router
    ↓
Planner
    ↓
Permission Manager
    ↓
Executor
    ↓
Tools
    ↓
Verification
    ↓
Final Response
"""

from dataclasses import dataclass
from typing import Literal


# ============================================================
# TYPES
# ============================================================

RequestMode = Literal[
    "chat",
    "agent"
]


TaskType = Literal[
    "conversation",
    "code",
    "file",
    "website",
    "terminal",
    "github",
    "research",
    "deployment",
    "unknown"
]


# ============================================================
# ROUTE DECISION
# ============================================================

@dataclass(frozen=True)
class RouteDecision:
    """
    Represents the result of routing a user request.
    """

    mode: RequestMode

    task_type: TaskType

    confidence: float = 0.0


# ============================================================
# INTENT PROMPT
# ============================================================

def build_intent_prompt(
    message: str
) -> str:
    """
    Creates a prompt for the AI model.

    The AI returns:
        MODE: CHAT or AGENT
        TYPE: task category
    """

    return f"""
You are the Volby AI request router.

Your job is to classify the user's request.

Return EXACTLY two lines.

MODE: CHAT or AGENT
TYPE: conversation, code, file, website, terminal, github, research, deployment, or unknown


============================================================
MODE DEFINITIONS
============================================================

CHAT

Use CHAT when the user only wants:

- Information
- Explanation
- Advice
- Learning
- Brainstorming
- General conversation
- A question answered

The AI does not need to perform an external action.


AGENT

Use AGENT when the user wants Volby to:

- Create something
- Modify something
- Fix something
- Write or edit code
- Create or edit files
- Build a website
- Work with GitHub
- Run terminal commands
- Research current information
- Deploy something
- Perform a multi-step computer task


============================================================
TASK TYPES
============================================================

conversation

General conversation or information.


code

Programming tasks.

Examples:

- Fix my Python code
- Write a FastAPI backend
- Debug this JavaScript
- Create a Discord bot
- Explain this error and fix it


file

File operations.

Examples:

- Create main.py
- Edit my HTML file
- Create a folder structure
- Rename this file
- Read this configuration file


website

Website development.

Examples:

- Build me a website
- Create a landing page
- Add a login page
- Fix my website UI
- Make my website responsive


terminal

Terminal or command-line tasks.

Examples:

- Run pip install
- Start my local server
- Run npm install
- Check the Python version
- Execute this command


github

GitHub operations.

Examples:

- Create a GitHub repository
- Update my repository
- Commit my changes
- Push my code
- Inspect my GitHub project


research

Information that requires external research.

Examples:

- Find the latest Python version
- Search the web for this error
- Research the best free hosting
- Find current API documentation


deployment

Deployment and hosting.

Examples:

- Deploy my website
- Deploy my FastAPI backend
- Configure Render
- Fix my deployment
- Connect my frontend and backend


unknown

Use unknown if the request does not clearly fit another category.


============================================================
IMPORTANT EXAMPLES
============================================================

User:
"What is Python?"

MODE: CHAT
TYPE: conversation


User:
"How do I create a Python file?"

MODE: CHAT
TYPE: conversation


User:
"Create a Python file called main.py."

MODE: AGENT
TYPE: file


User:
"Fix my Python code."

MODE: AGENT
TYPE: code


User:
"Build me a website."

MODE: AGENT
TYPE: website


User:
"Run npm install."

MODE: AGENT
TYPE: terminal


User:
"Update my GitHub repository."

MODE: AGENT
TYPE: github


User:
"Find the latest FastAPI documentation."

MODE: AGENT
TYPE: research


User:
"Deploy my backend to Render."

MODE: AGENT
TYPE: deployment


============================================================
USER REQUEST
============================================================

{message}
"""


# ============================================================
# PARSE ROUTER RESULT
# ============================================================

def parse_route_result(
    result: str
) -> RouteDecision:
    """
    Converts the AI router response into
    a safe RouteDecision object.

    This function is intentionally defensive.

    If the AI returns an unexpected response,
    Volby safely falls back to CHAT.
    """

    # --------------------------------------------------------
    # EMPTY RESULT
    # --------------------------------------------------------

    if not result:

        return RouteDecision(
            mode="chat",
            task_type="conversation",
            confidence=0.0
        )


    # --------------------------------------------------------
    # NORMALIZE
    # --------------------------------------------------------

    text = result.strip()

    upper_text = text.upper()

    lower_text = text.lower()


    # --------------------------------------------------------
    # DEFAULT VALUES
    # --------------------------------------------------------

    mode: RequestMode = "chat"

    task_type: TaskType = "conversation"

    confidence = 0.5


    # ========================================================
    # DETECT MODE
    # ========================================================

    if (
        "MODE: AGENT" in upper_text
        or "MODE:AGENT" in upper_text
    ):

        mode = "agent"

        confidence = 0.8


    elif (
        "MODE: CHAT" in upper_text
        or "MODE:CHAT" in upper_text
    ):

        mode = "chat"

        confidence = 0.9


    # ========================================================
    # DETECT TASK TYPE
    # ========================================================

    task_types = [

        "conversation",

        "code",

        "file",

        "website",

        "terminal",

        "github",

        "research",

        "deployment",

        "unknown"

    ]


    for category in task_types:

        if (
            f"TYPE: {category}"
            in lower_text
        ):

            task_type = category

            break


        if (
            f"TYPE:{category}"
            in lower_text
        ):

            task_type = category

            break


    # ========================================================
    # SAFETY RULE
    # ========================================================

    # If the model says CHAT,
    # the task type should normally be conversation.

    if mode == "chat":

        task_type = "conversation"


    # ========================================================
    # RETURN
    # ========================================================

    return RouteDecision(

        mode=mode,

        task_type=task_type,

        confidence=confidence

    )


# ============================================================
# BACKWARD COMPATIBILITY
# ============================================================

def classify_with_result(
    result: str
) -> str:
    """
    Backward-compatible function.

    Your current main.py already imports this function.

    It returns only:

        chat

    or:

        agent

    This means you can upgrade router.py first
    without immediately breaking main.py.
    """

    decision = parse_route_result(
        result
    )

    return decision.mode


# ============================================================
# PUBLIC ROUTER API
# ============================================================

def route_request(
    result: str
) -> RouteDecision:
    """
    Public routing function.

    Future versions of main.py should use this
    instead of classify_with_result().

    Example:

        decision = route_request(ai_result)

        if decision.mode == "agent":

            if decision.task_type == "code":
                ...

            elif decision.task_type == "file":
                ...

            elif decision.task_type == "terminal":
                ...
    """

    return parse_route_result(
        result
    )