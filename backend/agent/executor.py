"""
VOLBY AI - VOLBY PILOT EXECUTOR

The Executor is responsible for executing approved tasks.

Current capabilities:
    - Read files
    - Create files
    - Write files
    - List project files
    - Check whether files exist

Future capabilities:
    - Code editing
    - Terminal execution
    - GitHub operations
    - Web research
    - Website development
    - Deployment
    - Mobile worker communication

IMPORTANT:

The executor only operates inside the configured workspace.

It must never allow arbitrary path traversal outside
the workspace directory.

Architecture:

User
    ↓
Router
    ↓
Planner
    ↓
Permission
    ↓
Executor
    ↓
Tools
    ↓
Verification
"""


import os
from pathlib import Path
from dataclasses import dataclass
from typing import Optional


# ============================================================
# EXECUTION RESULT
# ============================================================

@dataclass
class ExecutionResult:
    """
    Represents the result of a tool execution.
    """

    success: bool

    message: str

    data: Optional[dict] = None

    error: Optional[str] = None


# ============================================================
# EXECUTOR
# ============================================================

class VolbyExecutor:
    """
    Main Volby Pilot execution engine.

    All file operations are restricted to the workspace.
    """

    def __init__(
        self,
        workspace: str = "workspace"
    ):

        self.workspace = Path(
            workspace
        ).resolve()


        # Create workspace if it does not exist.

        self.workspace.mkdir(
            parents=True,
            exist_ok=True
        )


    # ========================================================
    # SECURITY
    # ========================================================

    def _safe_path(
        self,
        relative_path: str
    ) -> Path:
        """
        Converts a relative path into a safe
        absolute path inside the workspace.

        Prevents:

            ../

        path traversal attacks.
        """

        if not relative_path:

            raise ValueError(
                "File path cannot be empty."
            )


        requested_path = Path(
            relative_path
        )


        # Prevent absolute paths.

        if requested_path.is_absolute():

            raise ValueError(
                "Absolute paths are not allowed."
            )


        full_path = (
            self.workspace
            / requested_path
        ).resolve()


        # Ensure the resolved path is still
        # inside the workspace.

        try:

            full_path.relative_to(
                self.workspace
            )

        except ValueError:

            raise ValueError(
                "Access outside the Volby workspace is not allowed."
            )


        return full_path


    # ========================================================
    # FILE EXISTS
    # ========================================================

    def file_exists(
        self,
        path: str
    ) -> ExecutionResult:
        """
        Checks whether a file or directory exists.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            exists = safe_path.exists()


            return ExecutionResult(

                success=True,

                message=(
                    "Path exists."
                    if exists
                    else "Path does not exist."
                ),

                data={

                    "path": path,

                    "exists": exists

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message="Failed to check path.",

                error=str(error)

            )


    # ========================================================
    # READ FILE
    # ========================================================

    def read_file(
        self,
        path: str
    ) -> ExecutionResult:
        """
        Reads a text file.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            if not safe_path.exists():

                return ExecutionResult(

                    success=False,

                    message="File does not exist.",

                    error=(
                        f"File not found: {path}"
                    )

                )


            if not safe_path.is_file():

                return ExecutionResult(

                    success=False,

                    message="Path is not a file.",

                    error=(
                        f"Not a file: {path}"
                    )

                )


            content = safe_path.read_text(
                encoding="utf-8"
            )


            return ExecutionResult(

                success=True,

                message="File read successfully.",

                data={

                    "path": path,

                    "content": content

                }

            )


        except UnicodeDecodeError:

            return ExecutionResult(

                success=False,

                message="File is not a UTF-8 text file.",

                error=(
                    "Binary or unsupported encoding."
                )

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message="Failed to read file.",

                error=str(error)

            )


    # ========================================================
    # CREATE FILE
    # ========================================================

    def create_file(
        self,
        path: str,
        content: str = ""
    ) -> ExecutionResult:
        """
        Creates a new file.

        Existing files are NOT overwritten.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            if safe_path.exists():

                return ExecutionResult(

                    success=False,

                    message=(
                        "File already exists."
                    ),

                    error=(
                        f"File already exists: {path}"
                    )

                )


            # Create parent directories.

            safe_path.parent.mkdir(

                parents=True,

                exist_ok=True

            )


            safe_path.write_text(

                content,

                encoding="utf-8"

            )


            return ExecutionResult(

                success=True,

                message=(
                    "File created successfully."
                ),

                data={

                    "path": path,

                    "size": len(content)

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message="Failed to create file.",

                error=str(error)

            )


    # ========================================================
    # WRITE FILE
    # ========================================================

    def write_file(
        self,
        path: str,
        content: str
    ) -> ExecutionResult:
        """
        Writes content to a file.

        This operation can overwrite an existing file.
        Permission should be checked before calling it.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            # Create parent directories.

            safe_path.parent.mkdir(

                parents=True,

                exist_ok=True

            )


            safe_path.write_text(

                content,

                encoding="utf-8"

            )


            return ExecutionResult(

                success=True,

                message=(
                    "File written successfully."
                ),

                data={

                    "path": path,

                    "size": len(content)

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message="Failed to write file.",

                error=str(error)

            )


    # ========================================================
    # DELETE FILE
    # ========================================================

    def delete_file(
        self,
        path: str
    ) -> ExecutionResult:
        """
        Deletes a file.

        This should always require explicit permission.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            if not safe_path.exists():

                return ExecutionResult(

                    success=False,

                    message="File does not exist.",

                    error=(
                        f"File not found: {path}"
                    )

                )


            if not safe_path.is_file():

                return ExecutionResult(

                    success=False,

                    message="Path is not a file.",

                    error=(
                        f"Cannot delete non-file: {path}"
                    )

                )


            safe_path.unlink()


            return ExecutionResult(

                success=True,

                message=(
                    "File deleted successfully."
                ),

                data={

                    "path": path

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message="Failed to delete file.",

                error=str(error)

            )


    # ========================================================
    # LIST FILES
    # ========================================================

    def list_files(
        self,
        directory: str = "."
    ) -> ExecutionResult:
        """
        Lists files and directories inside a workspace path.
        """

        try:

            safe_directory = self._safe_path(
                directory
            )


            if not safe_directory.exists():

                return ExecutionResult(

                    success=False,

                    message=(
                        "Directory does not exist."
                    ),

                    error=(
                        f"Directory not found: {directory}"
                    )

                )


            if not safe_directory.is_dir():

                return ExecutionResult(

                    success=False,

                    message=(
                        "Path is not a directory."
                    ),

                    error=(
                        f"Not a directory: {directory}"
                    )

                )


            items = []


            for item in sorted(
                safe_directory.iterdir()
            ):

                relative = item.relative_to(
                    self.workspace
                )


                items.append({

                    "name": item.name,

                    "path": str(
                        relative
                    ),

                    "type": (
                        "directory"
                        if item.is_dir()
                        else "file"
                    )

                })


            return ExecutionResult(

                success=True,

                message=(
                    "Directory listed successfully."
                ),

                data={

                    "directory": directory,

                    "items": items

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message=(
                    "Failed to list directory."
                ),

                error=str(error)

            )


    # ========================================================
    # CREATE DIRECTORY
    # ========================================================

    def create_directory(
        self,
        path: str
    ) -> ExecutionResult:
        """
        Creates a directory.
        """

        try:

            safe_path = self._safe_path(
                path
            )


            if safe_path.exists():

                return ExecutionResult(

                    success=False,

                    message=(
                        "Path already exists."
                    ),

                    error=(
                        f"Path already exists: {path}"
                    )

                )


            safe_path.mkdir(

                parents=True,

                exist_ok=False

            )


            return ExecutionResult(

                success=True,

                message=(
                    "Directory created successfully."
                ),

                data={

                    "path": path

                }

            )


        except Exception as error:

            return ExecutionResult(

                success=False,

                message=(
                    "Failed to create directory."
                ),

                error=str(error)

            )


# ============================================================
# DEFAULT EXECUTOR
# ============================================================

def create_executor(
    workspace: str = "workspace"
) -> VolbyExecutor:
    """
    Creates a VolbyExecutor instance.
    """

    return VolbyExecutor(
        workspace=workspace
    )