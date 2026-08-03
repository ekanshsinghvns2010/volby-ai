"""
Volby Pilot Task Planner

Converts an agent request into a simple structured task plan.
"""

from dataclasses import dataclass, field


@dataclass
class AgentPlan:
    """
    Represents a plan created by Volby Pilot.
    """

    original_request: str
    steps: list[str] = field(default_factory=list)
    requires_permission: bool = True


def create_plan(message: str) -> AgentPlan:
    """
    Creates an initial plan for an agent request.

    This is the first basic version.
    Later, the AI model will generate more intelligent
    multi-step plans.
    """

    request = message.strip()

    if not request:
        return AgentPlan(
            original_request="",
            steps=[],
            requires_permission=False,
        )

    return AgentPlan(
        original_request=request,
        steps=[
            f"Understand the requested action: {request}",
            "Check required permissions",
            "Execute the approved action",
            "Report the result to the user",
        ],
        requires_permission=True,
    )