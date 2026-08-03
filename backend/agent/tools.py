"""
VOLBY AI - VOLBY PILOT TOOLS

This module provides the tool layer between the AI agent
and the actual executor.

Architecture:

AI
 ↓
Router
 ↓
Planner
 ↓
Tools
 ↓
Executor
 ↓
Workspace

The AI should never directly access the filesystem.
It requests a tool operation.

The executor performs the operation safely.
"""


from typing import Any, Dict

from backend.agent.executor import (
    VolbyExecutor,
    ExecutionResult,
)


# ============================================================
# TOOL DEFINITION
# ============================================================

class VolbyTool:
    """
    Represents a tool available to Volby Pilot.
    """

    def __init__(
        self,
        name: str,
        description: str,
    ):

        self.name = name

        self.description = description


# ============================================================
# AVAILABLE TOOLS
# ============================================================

AVAILABLE_TOOLS = [

    VolbyTool(

        name="list_files",

        description=(
            "List files and directories "
            "inside the Volby workspace."
        )

    ),

    VolbyTool(

        name="read_file",

        description=(
            "Read the contents of a text file "
            "inside the Volby workspace."
        )

    ),

    VolbyTool(

        name="create_file",

        description=(
            "Create a new file inside "
            "the Volby workspace."
        )

    ),

    VolbyTool(

        name="write_file",

        description=(
            "Write or replace the contents "
            "of a file inside the workspace."
        )

    ),

    VolbyTool(

        name="delete_file",

        description=(
            "Delete a file from the workspace. "
            "Requires explicit permission."
        )

    ),

    VolbyTool(

        name="create_directory",

        description=(
            "Create a new directory "
            "inside the workspace."
        )

    ),

    VolbyTool(

        name="file_exists",

        description=(
            "Check whether a file or directory exists."
        )

    ),

]


# ============================================================
# TOOL RESULT
# ============================================================

def format_result(
    result: ExecutionResult
) -> Dict[str, Any]:
    """
    Converts an ExecutionResult into a
    JSON-compatible dictionary.
    """

    return {

        "success":
            result.success,

        "message":
            result.message,

        "data":
            result.data,

        "error":
            result.error,

    }


# ============================================================
# TOOL EXECUTION
# ============================================================

def execute_tool(
    executor: VolbyExecutor,
    tool_name: str,
    arguments: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Execute a requested Volby tool.

    Parameters:

        executor:
            VolbyExecutor instance.

        tool_name:
            Name of the requested tool.

        arguments:
            Arguments required by the tool.

    Returns:

        JSON-compatible result.
    """


    # ========================================================
    # LIST FILES
    # ========================================================

    if tool_name == "list_files":

        directory = arguments.get(
            "directory",
            "."
        )


        result = executor.list_files(

            directory=directory

        )


        return format_result(
            result
        )


    # ========================================================
    # READ FILE
    # ========================================================

    if tool_name == "read_file":

        path = arguments.get(
            "path"
        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.read_file(

            path=path

        )


        return format_result(
            result
        )


    # ========================================================
    # CREATE FILE
    # ========================================================

    if tool_name == "create_file":

        path = arguments.get(
            "path"
        )


        content = arguments.get(

            "content",

            ""

        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.create_file(

            path=path,

            content=content

        )


        return format_result(
            result
        )


    # ========================================================
    # WRITE FILE
    # ========================================================

    if tool_name == "write_file":

        path = arguments.get(
            "path"
        )


        content = arguments.get(

            "content",

            ""

        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.write_file(

            path=path,

            content=content

        )


        return format_result(
            result
        )


    # ========================================================
    # DELETE FILE
    # ========================================================

    if tool_name == "delete_file":

        path = arguments.get(
            "path"
        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.delete_file(

            path=path

        )


        return format_result(
            result
        )


    # ========================================================
    # CREATE DIRECTORY
    # ========================================================

    if tool_name == "create_directory":

        path = arguments.get(
            "path"
        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.create_directory(

            path=path

        )


        return format_result(
            result
        )


    # ========================================================
    # FILE EXISTS
    # ========================================================

    if tool_name == "file_exists":

        path = arguments.get(
            "path"
        )


        if not path:

            return {

                "success":
                    False,

                "message":
                    "Missing required argument: path",

                "error":
                    "path is required"

            }


        result = executor.file_exists(

            path=path

        )


        return format_result(
            result
        )


    # ========================================================
    # UNKNOWN TOOL
    # ========================================================

    return {

        "success":
            False,

        "message":
            "Unknown Volby tool.",

        "error":
            f"Tool '{tool_name}' is not available."

    }


# ============================================================
# TOOL DESCRIPTIONS
# ============================================================

def get_tool_descriptions():
    """
    Returns all available tools in a format
    that can later be passed to an AI model.
    """

    return [

        {

            "name":
                tool.name,

            "description":
                tool.description

        }

        for tool in AVAILABLE_TOOLS

    ]