import json
from typing import Any, Dict, List
from backend.agent.tools import execute_tool

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

    def build_system_prompt(self):

        return """
You are Volby Pilot, an AI agent that can perform tasks using tools.

Your job is to understand the user's request and complete it using
the available tools.

You must return ONLY valid JSON.

You can choose one of these actions:

1. tool
Use this when you need to execute a tool.

Format:

{
    "action": "tool",
    "tool": "TOOL_NAME",
    "arguments": {}
}

2. ask
Use this when you need clarification from the user.

Format:

{
    "action": "ask",
    "message": "Your question"
}

3. final
Use this when the task is complete.

Format:

{
    "action": "final",
    "message": "Explain what was completed"
}

Always use the available tools when they are required.

Never claim that you created or modified a file unless the tool
actually succeeded.

After using a tool, inspect its result and decide what to do next.

Your goal is to complete the user's task accurately.
"""

    # ========================================================
    # ASK MODEL
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

        try:

        result = execute_tool(
            executor=self.executor,
            tool_name=tool_name,
            arguments=arguments
        )

        return result

        except Exception as error:

        return {

            "success":
                False,

            "message":
                "Tool execution failed.",

            "error":
                str(error)

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

        for step in range(
            max_steps
        ):

            try:

                decision = self.ask_model(
                    messages
                )

            except Exception as error:

                return {

                    "success":
                        False,

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
            # FINAL ANSWER
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
                            "Task completed."
                        ),

                    "steps":
                        step + 1

                }

            # =================================================
            # TOOL CALL
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

                        "error":
                            "Agent did not specify a tool.",

                        "steps":
                            step + 1

                    }

                tool_result = (
                    self.execute_tool_call(

                        tool_name,

                        arguments

                    )
                )

                messages.append(

                    {

                        "role":
                            "assistant",

                        "content":
                            json.dumps(
                                decision
                            )

                    }

                )

                messages.append(

                    {

                        "role":
                            "user",

                        "content":
                            (
                                "Tool execution result:\n"
                                + json.dumps(
                                    tool_result,
                                    default=str
                                )
                                + "\n\n"
                                "Continue the task. "
                                "Use another tool if needed, "
                                "or return a final response."
                            )

                    }

                )

                continue

            # =================================================
            # UNKNOWN ACTION
            # =================================================

            return {

                "success":
                    False,

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

        # =====================================================
        # MAX STEPS REACHED
        # =====================================================

        return {

            "success":
                False,

            "status":
                "max_steps_reached",

            "error":
                (
                    "Agent reached the maximum "
                    "number of execution steps."
                ),

            "steps":
                max_steps

        }


# ============================================================
# FACTORY
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