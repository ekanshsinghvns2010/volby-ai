"""
VOLBY AI - AGENT BRAIN

The Agent Brain is the decision-making layer
between the AI model and Volby's tools.

Architecture:

User Request
     ↓
Router
     ↓
Planner
     ↓
Agent Brain
     ↓
Choose Tool
     ↓
Execute Tool
     ↓
Inspect Result
     ↓
Continue / Fix / Finish

The Brain does NOT directly access files.

It uses:

    tools.py
        ↓
    executor.py

This keeps the system modular and safer.
"""


import json
from typing import Any, Dict, Optional


from groq import Groq


from backend.agent.tools import (
    execute_tool,
    get_tool_descriptions,
)


# ============================================================
# AGENT BRAIN
# ============================================================

class VolbyAgentBrain:
    """
    Main reasoning engine for Volby Pilot.

    The brain receives a user task and decides
    which tools should be used.
    """


    def __init__(
        self,
        groq_client: Groq,
        executor,
    ):

        self.groq_client = (
            groq_client
        )

        self.executor = (
            executor
        )


    # ========================================================
    # SYSTEM PROMPT
    # ========================================================

    def build_system_prompt(
        self
    ) -> str:

        tools = (
            get_tool_descriptions()
        )


        tool_text = "\n".join(

            f"- {tool['name']}: "
            f"{tool['description']}"

            for tool in tools

        )


        return f"""
You are Volby Pilot, the execution agent
inside Volby AI.

Your job is to complete user tasks by
selecting and using available tools.

AVAILABLE TOOLS:

{tool_text}


IMPORTANT RULES:

1. Only use tools that are actually available.

2. Never invent a tool.

3. Return valid JSON only.

4. When a task requires a file operation,
   choose the correct file tool.

5. Always inspect existing files before
   overwriting important code when possible.

6. Do not claim that a tool was executed
   unless the system actually executed it.

7. If a tool fails, analyze the error and
   decide whether another tool call can fix it.

8. Continue working until the task is complete
   or you genuinely cannot continue.

9. Do not perform dangerous or destructive
   operations without explicit permission.

10. Keep tool arguments precise.

AVAILABLE RESPONSE TYPES:

To call a tool:

{{
    "action": "tool",
    "tool": "tool_name",
    "arguments": {{
        "path": "example.txt"
    }}
}}

To finish:

{{
    "action": "finish",
    "message": "Task completed successfully."
}}

To ask the user:

{{
    "action": "ask",
    "message": "I need more information."
}}


Never return Markdown.

Return JSON only.
"""


    # ========================================================
    # ASK AI
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

            max_tokens=1000,

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
                "The agent returned an empty response."

        }


    content = content.strip()


    try:

        decision = json.loads(
            content
        )

    except json.JSONDecodeError:

        # Try to extract JSON if the model
        # returned extra text around it.

        start = content.find(
            "{"
        )

        end = content.rfind(
            "}"
        )


        if (
            start != -1
            and end != -1
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
                            "an invalid JSON response."
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
                ),

            "raw":
                content

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

        return execute_tool(

            executor=
                self.executor,

            tool_name=
                tool_name,

            arguments=
                arguments

        )


    # ========================================================
    # RUN AGENT
    # ========================================================

    def run(

        self,

        user_request: str,

        max_steps: int = 10

    ) -> Dict[str, Any]:

        """
        Runs the Volby agent loop.

        The agent can:

            Think
              ↓
            Tool
              ↓
            Result
              ↓
            Think again

        until it finishes.
        """


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


        execution_log = []


        for step_number in range(

            1,

            max_steps + 1

        ):

            # ================================================
            # ASK AI WHAT TO DO
            # ================================================

            decision = self.ask_model(

                messages

            )


            action = decision.get(

                "action"

            )


            # ================================================
            # FINISH
            # ================================================

            if action == "finish":

                message = decision.get(

                    "message",

                    "Task completed."

                )


                return {

                    "success":
                        True,

                    "status":
                        "completed",

                    "message":
                        message,

                    "steps":
                        execution_log

                }


            # ================================================
            # ASK USER
            # ================================================

            if action == "ask":

                message = decision.get(

                    "message",

                    "More information is required."

                )


                return {

                    "success":
                        False,

                    "status":
                        "needs_input",

                    "message":
                        message,

                    "steps":
                        execution_log

                }


            # ================================================
            # TOOL ACTION
            # ================================================

            if action != "tool":

                execution_log.append({

                    "step":
                        step_number,

                    "error":
                        "Unknown agent action.",

                    "decision":
                        decision

                })


                messages.append({

                    "role":
                        "user",

                    "content":
                        (
                            "Your previous response "
                            "contained an invalid action. "
                            "Return valid JSON."
                        )

                })


                continue


            # ================================================
            # GET TOOL
            # ================================================

            tool_name = decision.get(

                "tool"

            )


            arguments = decision.get(

                "arguments",

                {}

            )


            if not tool_name:

                execution_log.append({

                    "step":
                        step_number,

                    "error":
                        "No tool name provided."

                })


                messages.append({

                    "role":
                        "user",

                    "content":
                        (
                            "You must provide a valid "
                            "tool name."
                        )

                })


                continue


            # ================================================
            # EXECUTE
            # ================================================

            result = self.execute_tool_call(

                tool_name=

                    tool_name,

                arguments=

                    arguments

            )


            # ================================================
            # LOG
            # ================================================

            execution_log.append({

                "step":
                    step_number,

                "action":
                    "tool",

                "tool":
                    tool_name,

                "arguments":
                    arguments,

                "result":
                    result

            })


            # ================================================
            # SEND RESULT BACK TO AI
            # ================================================

            messages.append({

                "role":
                    "assistant",

                "content":
                    json.dumps(

                        decision

                    )

            })


            messages.append({

                "role":
                    "user",

                "content":

                    "TOOL RESULT:\n"

                    + json.dumps(

                        result,

                        indent=2

                    )

                    + "\n\n"

                    "Continue the task. "
                    "Use another tool if necessary, "
                    "or finish if the task is complete."

            })


        # ====================================================
        # MAX STEPS
        # ====================================================

        return {

            "success":
                False,

            "status":
                "max_steps_reached",

            "message":
                (
                    "The agent reached its maximum "
                    "execution steps."
                ),

            "steps":
                execution_log

        }


# ============================================================
# FACTORY
# ============================================================

def create_agent_brain(

    groq_client: Groq,

    executor

) -> VolbyAgentBrain:

    """
    Creates a Volby Agent Brain.
    """

    return VolbyAgentBrain(

        groq_client=
            groq_client,

        executor=
            executor

    )