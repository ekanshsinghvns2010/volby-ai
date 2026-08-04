import json
from typing import Any, Dict

from backend.agent.tools import (
    execute_tool,
)


# ============================================================
# VOLBY AGENT BRAIN
# ============================================================

class VolbyAgentBrain:

    def __init__(
        self,
        groq_client,
        executor
    ):

        self.groq_client = groq_client

        self.executor = executor


    # ========================================================
    # SYSTEM PROMPT
    # ========================================================

    def build_system_prompt(
        self
    ):

        return """
You are Volby Pilot, an intelligent AI coding and computer task agent.

Your job is to understand the user's request and complete the task
using the available tools.

You can work with files inside the Volby workspace.

AVAILABLE TOOLS:

- list_files
- read_file
- create_file
- write_file
- delete_file
- create_directory
- file_exists

IMPORTANT:

When the user asks you to create, modify, read, or verify files,
you MUST use the appropriate tool.

Never claim that a file was created unless the tool actually
reports success.

When creating a website, you can create multiple files such as:

- index.html
- style.css
- script.js

You can create folders when necessary.

After creating or modifying files, use file_exists or read_file
to verify that the operation succeeded.

You should continue working until the user's task is complete.

Return ONLY valid JSON.

There are three possible actions.

ACTION 1: TOOL

Use this when you need to execute a tool.

Format:

{
    "action": "tool",
    "tool": "create_file",
    "arguments": {
        "path": "index.html",
        "content": "<!DOCTYPE html>..."
    }
}

ACTION 2: ASK

Use this when you genuinely need clarification.

Format:

{
    "action": "ask",
    "message": "What should the website be called?"
}

ACTION 3: FINAL

Use this when the task is completely finished.

Format:

{
    "action": "final",
    "message": "The website was created successfully."
}

Do not say a task is complete if it has not actually been completed.

Always use tools when tools are required.
"""


    # ========================================================
    # ASK GROQ
    # ========================================================

    def ask_model(
        self,
        messages
    ) -> Dict[str, Any]:

        response = (
            self.groq_client
            .chat
            .completions
            .create(

                model=
                    "llama-3.3-70b-versatile",

                messages=
                    messages,

                temperature=0,

                max_tokens=2000,

                response_format={
                    "type":
                        "json_object"
                }

            )
        )


        content = (

            response
            .choices[0]
            .message
            .content

        )


        if not content:

            return {

                "action":
                    "ask",

                "message":
                    "The AI returned an empty response."

            }


        content = content.strip()


        # ====================================================
        # PARSE JSON
        # ====================================================

        try:

            decision = json.loads(
                content
            )


        except json.JSONDecodeError:

            # Try to extract JSON if the model
            # accidentally returned extra text.

            start = content.find(
                "{"
            )

            end = content.rfind(
                "}"
            )


            if (
                start != -1
                and end > start
            ):

                try:

                    decision = json.loads(

                        content[
                            start:
                            end + 1
                        ]

                    )


                except json.JSONDecodeError:

                    return {

                        "action":
                            "ask",

                        "message":
                            (
                                "The agent returned "
                                "invalid JSON."
                            ),

                        "raw":
                            content

                    }


            else:

                return {

                    "action":
                        "ask",

                    "message":
                        (
                            "The agent returned "
                            "an invalid response."
                        ),

                    "raw":
                        content

                }


        # ====================================================
        # VALIDATE RESULT
        # ====================================================

        if not isinstance(
            decision,
            dict
        ):

            return {

                "action":
                    "ask",

                "message":
                    (
                        "The agent response "
                        "was not a valid object."
                    )

            }


        return decision


    # ========================================================
    # EXECUTE TOOL
    # ========================================================

    def execute_tool_call(
        self,
        tool_name: str,
        arguments: Dict[str, Any]
    ):

        try:

            result = execute_tool(

                executor=
                    self.executor,

                tool_name=
                    tool_name,

                arguments=
                    arguments

            )


            return result


        except Exception as error:

            return {

                "success":
                    False,

                "message":
                    "Tool execution failed.",

                "error":
                    str(
                        error
                    )

            }


    # ========================================================
    # RUN AGENT
    # ========================================================

    def run(
        self,
        user_request: str,
        max_steps: int = 10
    ) -> Dict[str, Any]:

        messages = [

            {

                "role":
                    "system",

                "content":
                    self.build_system_prompt()

            },

            {

                "role":
                    "user",

                "content":
                    user_request

            }

        ]


        # ====================================================
        # AGENT LOOP
        # ====================================================

        for step in range(
            max_steps
        ):


            # =================================================
            # ASK AI WHAT TO DO
            # =================================================

            try:

                decision = self.ask_model(

                    messages

                )


            except Exception as error:

                return {

                    "success":
                        False,

                    "status":
                        "error",

                    "error":
                        (
                            "Agent model error: "
                            + str(
                                error
                            )
                        ),

                    "steps":
                        step + 1

                }


            # =================================================
            # GET ACTION
            # =================================================

            action = decision.get(
                "action"
            )


            # =================================================
            # ASK USER
            # =================================================

            if action == "ask":

                return {

                    "success":
                        True,

                    "status":
                        "needs_input",

                    "message":
                        decision.get(

                            "message",

                            "The agent needs more information."

                        ),

                    "steps":
                        step + 1

                }


            # =================================================
            # FINAL
            # =================================================

            if action == "final":

                return {

                    "success":
                        True,

                    "status":
                        "completed",

                    "message":
                        decision.get(

                            "message",

                            "Task completed successfully."

                        ),

                    "steps":
                        step + 1

                }


            # =================================================
            # TOOL
            # =================================================

            if action == "tool":

                tool_name = decision.get(
                    "tool"
                )


                arguments = decision.get(

                    "arguments",

                    {}

                )


                if not tool_name:

                    return {

                        "success":
                            False,

                        "status":
                            "error",

                        "error":
                            (
                                "The agent did not "
                                "specify a tool."
                            ),

                        "steps":
                            step + 1

                    }


                # =============================================
                # EXECUTE TOOL
                # =============================================

                tool_result = (
                    self.execute_tool_call(

                        tool_name=
                            tool_name,

                        arguments=
                            arguments

                    )
                )


                # =============================================
                # ADD AI DECISION TO MEMORY
                # =============================================

                messages.append(

                    {

                        "role":
                            "assistant",

                        "content":
                            json.dumps(

                                decision,

                                default=str

                            )

                    }

                )


                # =============================================
                # ADD TOOL RESULT TO MEMORY
                # =============================================

                messages.append(

                    {

                        "role":
                            "user",

                        "content":
                            (
                                "The tool "
                                + tool_name
                                + " was executed.\n\n"

                                "Tool result:\n"

                                + json.dumps(

                                    tool_result,

                                    default=str

                                )

                                + "\n\n"

                                "Analyze this result. "
                                "If the task is not complete, "
                                "use another tool. "
                                "If the task is complete, "
                                "return a final response."
                            )

                    }

                )


                # Continue agent loop.

                continue


            # =================================================
            # UNKNOWN ACTION
            # =================================================

            return {

                "success":
                    False,

                "status":
                    "error",

                "error":
                    (
                        "Unknown agent action: "
                        + str(
                            action
                        )
                    ),

                "agent_response":
                    decision,

                "steps":
                    step + 1

            }


        # ====================================================
        # MAX STEPS
        # ====================================================

        return {

            "success":
                False,

            "status":
                "max_steps_reached",

            "error":
                (
                    "The agent reached the maximum "
                    "number of execution steps."
                ),

            "steps":
                max_steps

        }


# ============================================================
# CREATE AGENT BRAIN
# ============================================================

def create_agent_brain(
    groq_client,
    executor
):

    return VolbyAgentBrain(

        groq_client=
            groq_client,

        executor=
            executor

    )