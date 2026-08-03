"""
Volby Pilot Permission Manager

Handles permission decisions before Pilot performs actions.
"""

from dataclasses import dataclass


@dataclass
class PermissionRequest:
    """
    Represents an action that requires user approval.
    """

    action: str
    description: str
    approved: bool = False


def create_permission_request(
    action: str,
    description: str,
) -> PermissionRequest:
    """
    Creates a permission request.

    Pilot never assumes permission is granted.
    """

    return PermissionRequest(
        action=action,
        description=description,
        approved=False,
    )


def approve_permission(
    permission: PermissionRequest,
) -> PermissionRequest:
    """
    Approves a permission request.
    """

    permission.approved = True

    return permission


def deny_permission(
    permission: PermissionRequest,
) -> PermissionRequest:
    """
    Denies a permission request.
    """

    permission.approved = False

    return permission