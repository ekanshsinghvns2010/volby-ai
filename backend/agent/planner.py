"""
VOLBY AI - VOLBY PILOT PLANNER

The planner converts a user's request into a structured
multi-step execution plan.

The planner does NOT execute tasks.

Architecture:

User Request
      ↓
Router
      ↓
Planner
      ↓
Permission Check
      ↓
Executor
      ↓
Tools
      ↓
Verification
"""

from dataclasses import dataclass, field
from typing import List


# ============================================================
# AGENT PLAN
# ============================================================

@dataclass
class AgentPlan:
    """
    Represents a complete task plan created by Volby Pilot.
    """

    original_request: str

    task_type: str = "unknown"

    steps: List[str] = field(
        default_factory=list
    )

    requires_permission: bool = True

    risk_level: str = "low"


# ============================================================
# TASK TYPE DETECTION
# ============================================================

def detect_task_type(
    message: str
) -> str:
    """
    Detects the likely task category.

    This is a temporary local fallback.

    Later, the AI router will provide the
    task type directly.
    """

    text = message.lower()


    # --------------------------------------------------------
    # WEBSITE
    # --------------------------------------------------------

    website_keywords = [

        "website",

        "web app",

        "webapp",

        "frontend",

        "landing page",

        "html",

        "css",

        "javascript",

        "react",

        "vite",

        "next.js"

    ]


    if any(
        keyword in text
        for keyword in website_keywords
    ):

        return "website"


    # --------------------------------------------------------
    # CODE
    # --------------------------------------------------------

    code_keywords = [

        "code",

        "python",

        "javascript",

        "typescript",

        "java",

        "c++",

        "program",

        "function",

        "class",

        "debug",

        "bug",

        "error",

        "fix my code"

    ]


    if any(
        keyword in text
        for keyword in code_keywords
    ):

        return "code"


    # --------------------------------------------------------
    # FILE
    # --------------------------------------------------------

    file_keywords = [

        "create a file",

        "make a file",

        "edit a file",

        "modify a file",

        "delete a file",

        "rename a file",

        "create folder",

        "create directory",

        "file"

    ]


    if any(
        keyword in text
        for keyword in file_keywords
    ):

        return "file"


    # --------------------------------------------------------
    # TERMINAL
    # --------------------------------------------------------

    terminal_keywords = [

        "run command",

        "run this command",

        "terminal",

        "shell",

        "command line",

        "npm install",

        "pip install",

        "git clone",

        "python main.py",

        "start server"

    ]


    if any(
        keyword in text
        for keyword in terminal_keywords
    ):

        return "terminal"


    # --------------------------------------------------------
    # GITHUB
    # --------------------------------------------------------

    github_keywords = [

        "github",

        "repository",

        "repo",

        "commit",

        "push",

        "pull request",

        "branch"

    ]


    if any(
        keyword in text
        for keyword in github_keywords
    ):

        return "github"


    # --------------------------------------------------------
    # RESEARCH
    # --------------------------------------------------------

    research_keywords = [

        "search the web",

        "research",

        "find the latest",

        "look up",

        "search online",

        "latest information"

    ]


    if any(
        keyword in text
        for keyword in research_keywords
    ):

        return "research"


    # --------------------------------------------------------
    # DEPLOYMENT
    # --------------------------------------------------------

    deployment_keywords = [

        "deploy",

        "deployment",

        "hosting",

        "host my",

        "render",

        "vercel",

        "netlify",

        "production"

    ]


    if any(
        keyword in text
        for keyword in deployment_keywords
    ):

        return "deployment"


    # --------------------------------------------------------
    # UNKNOWN
    # --------------------------------------------------------

    return "unknown"


# ============================================================
# RISK DETECTION
# ============================================================

def detect_risk_level(
    message: str
) -> str:
    """
    Estimates the risk level of an operation.

    This does NOT replace proper security checks.

    It is only used to determine whether Volby
    should request confirmation before execution.
    """

    text = message.lower()


    # --------------------------------------------------------
    # HIGH RISK
    # --------------------------------------------------------

    high_risk_keywords = [

        "delete",

        "remove",

        "destroy",

        "drop database",

        "reset database",

        "format",

        "force push",

        "git reset --hard",

        "rm -rf",

        "shutdown",

        "kill process"

    ]


    if any(
        keyword in text
        for keyword in high_risk_keywords
    ):

        return "high"


    # --------------------------------------------------------
    # MEDIUM RISK
    # --------------------------------------------------------

    medium_risk_keywords = [

        "deploy",

        "publish",

        "push",

        "commit",

        "install",

        "modify",

        "edit",

        "change",

        "update"

    ]


    if any(
        keyword in text
        for keyword in medium_risk_keywords
    ):

        return "medium"


    # --------------------------------------------------------
    # LOW RISK
    # --------------------------------------------------------

    return "low"


# ============================================================
# PLAN GENERATORS
# ============================================================

def create_code_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for coding tasks.
    """

    return [

        "Understand the requested code change.",

        "Inspect the relevant project files.",

        "Identify dependencies and existing architecture.",

        "Implement the required code changes.",

        "Review the code for syntax and logical errors.",

        "Run available tests or validation checks.",

        "Report the changes and any remaining issues."

    ]


def create_file_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for file operations.
    """

    return [

        "Identify the requested file or directory operation.",

        "Inspect the current project structure.",

        "Check whether the target already exists.",

        "Create, edit, rename, or remove the requested file.",

        "Verify that the resulting file structure is correct.",

        "Report the completed operation."

    ]


def create_website_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for website development.
    """

    return [

        "Understand the website requirements.",

        "Inspect the existing project structure if available.",

        "Determine the required frontend technology.",

        "Create or modify the website files.",

        "Implement the requested UI and functionality.",

        "Check for broken links, missing assets, and code errors.",

        "Test the website locally when execution access is available.",

        "Prepare the project for deployment."

    ]


def create_terminal_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for terminal operations.
    """

    return [

        "Understand the requested terminal operation.",

        "Check the current working environment.",

        "Validate the requested command.",

        "Request permission if the operation can modify the system.",

        "Execute the command in the authorized environment.",

        "Inspect the command output.",

        "Handle errors if the command fails.",

        "Report the result."

    ]


def create_github_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for GitHub operations.
    """

    return [

        "Identify the target GitHub repository.",

        "Inspect the relevant repository files or branches.",

        "Determine the requested repository operation.",

        "Prepare the required changes.",

        "Review the changes before publishing.",

        "Request permission before modifying remote repository state.",

        "Apply the authorized GitHub operation.",

        "Verify the result."

    ]


def create_research_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for research tasks.
    """

    return [

        "Understand the research question.",

        "Identify reliable sources.",

        "Search for relevant current information.",

        "Compare information across reliable sources.",

        "Check important facts and dates.",

        "Summarize the findings clearly.",

        "Provide source references when available."

    ]


def create_deployment_plan(
    request: str
) -> List[str]:
    """
    Creates a plan for deployment tasks.
    """

    return [

        "Inspect the project structure.",

        "Identify the application type and runtime.",

        "Check required dependencies.",

        "Verify environment variables and configuration.",

        "Prepare the deployment configuration.",

        "Request permission before publishing or deploying.",

        "Deploy using the authorized platform.",

        "Check deployment logs and application health.",

        "Report the deployment URL and result."

    ]


# ============================================================
# MAIN PLANNER
# ============================================================

def create_plan(
    message: str,
    task_type: str | None = None
) -> AgentPlan:
    """
    Creates a structured AgentPlan.

    Parameters:

        message:
            The original user request.

        task_type:
            Optional task type provided by the router.

    Returns:

        AgentPlan
    """

    request = message.strip()


    # ========================================================
    # EMPTY REQUEST
    # ========================================================

    if not request:

        return AgentPlan(

            original_request="",

            task_type="unknown",

            steps=[],

            requires_permission=False,

            risk_level="low"

        )


    # ========================================================
    # DETECT TASK TYPE
    # ========================================================

    if not task_type:

        task_type = detect_task_type(
            request
        )


    # ========================================================
    # DETECT RISK
    # ========================================================

    risk_level = detect_risk_level(
        request
    )


    # ========================================================
    # SELECT PLAN
    # ========================================================

    if task_type == "code":

        steps = create_code_plan(
            request
        )


    elif task_type == "file":

        steps = create_file_plan(
            request
        )


    elif task_type == "website":

        steps = create_website_plan(
            request
        )


    elif task_type == "terminal":

        steps = create_terminal_plan(
            request
        )


    elif task_type == "github":

        steps = create_github_plan(
            request
        )


    elif task_type == "research":

        steps = create_research_plan(
            request
        )


    elif task_type == "deployment":

        steps = create_deployment_plan(
            request
        )


    else:

        steps = [

            "Understand the user's requested task.",

            "Determine which tools are required.",

            "Create an execution strategy.",

            "Verify the result.",

            "Report the result to the user."

        ]


    # ========================================================
    # PERMISSION LOGIC
    # ========================================================

    # For now, every real agent task requires permission.

    # Later, Volby can use granular permissions:

    # READ
    # WRITE
    # EXECUTE
    # NETWORK
    # DEPLOY
    # GITHUB_WRITE

    requires_permission = True


    # ========================================================
    # RETURN PLAN
    # ========================================================

    return AgentPlan(

        original_request=request,

        task_type=task_type,

        steps=steps,

        requires_permission=requires_permission,

        risk_level=risk_level

    )