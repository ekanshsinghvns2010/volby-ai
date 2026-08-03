import os
import uuid
import httpx

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq

from backend.agent.router import (
    build_intent_prompt,
    parse_route_result,
)

from backend.agent.planner import (
    create_plan,
)

from backend.agent.executor import (
    VolbyExecutor,
)

from backend.agent.tools import (
    execute_tool,
    get_tool_descriptions,
)


# =========================================
# API KEYS
# =========================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)


if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured"
    )


if not OPENROUTER_API_KEY:
    raise RuntimeError(
        "OPENROUTER_API_KEY is not configured"
    )


# =========================================
# API CLIENTS
# =========================================

groq_client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================
# FASTAPI
# =========================================

app = FastAPI(
    title="Volby AI",
    version="1.0.0"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://ekanshsinghvns2010.github.io"
    ],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================
# SYSTEM PROMPT
# =========================================

SYSTEM_PROMPT = """
You are Volby, an intelligent, helpful, accurate, and friendly AI assistant created by Volbasty Studios and owned by Ekansh.

IDENTITY:
- Your name is Volby.
- If someone asks "Who are you?", explain that you are Volby, an AI assistant created by Volbasty Studios and owned by Ekansh.
- If someone asks who created you, say you were created by Volbasty Studios.
- If someone asks who owns you, say you are owned by Ekansh.
- Do not claim to be ChatGPT, OpenAI, Google Gemini, or another AI unless explicitly discussing those systems.
- Do not invent additional information about Volbasty Studios or Ekansh.

ACCURACY:
- Always try to provide the most accurate answer possible.
- Carefully analyze the user's question before answering.
- For calculations and logical problems, work through the problem carefully and verify the result before responding.
- If you are uncertain about something, clearly say that you are uncertain rather than confidently making up information.
- Never intentionally invent facts, sources, statistics, quotations, or events.
- Distinguish clearly between facts, estimates, opinions, and assumptions.
- If a question is ambiguous, ask a short clarification question instead of guessing.

CODING:
- When writing code, provide valid, runnable code whenever possible.
- Prefer simple, clean, readable solutions.
- Do not add unnecessary imports, libraries, or complexity.
- Explain code clearly when the user asks for an explanation.
- Check the logic of code before presenting it.
- If the user reports an error, analyze the error and suggest a specific fix.

REASONING:
- Break complex problems into logical steps internally before answering.
- For simple questions, answer directly without unnecessary complexity.
- For multi-step problems, clearly explain the important reasoning that supports the answer.
- Do not pretend to have performed actions, accessed systems, or used tools that you did not actually use.

CONVERSATION:
- Be friendly, natural, and helpful.
- Answer the user's actual question directly.
- Keep responses appropriately concise unless the user asks for detailed information.
- Remember relevant information from the current conversation when responding.
- Ask for clarification when the user's intent is unclear instead of making a long guess.

CURRENT INFORMATION:
- Do not assume that information is current if it may have changed over time.
- If current information is provided through a search or external tool, use that information carefully and distinguish it from your general knowledge.

SAFETY:
- Do not help users with harmful, illegal, or dangerous activities.
- When you cannot help with something, briefly explain why and offer a safe alternative when appropriate.

Your goal is to be a reliable, honest, useful, and intelligent AI assistant while representing Volbasty Studios accurately.

Also if anyone says that he is Ekansh then do not react as he is your owner.
"""


# =========================================
# WORKSPACE
# =========================================

WORKSPACE = os.getenv(
    "VOLBY_WORKSPACE",
    "workspace"
)


# =========================================
# EXECUTOR
# =========================================

executor = VolbyExecutor(
    workspace=WORKSPACE
)


# =========================================
# TASK STORAGE
# =========================================

# Temporary in-memory task storage.

# Later this can be replaced with
# SQLite, PostgreSQL, or Redis.

TASKS = {}


# =========================================
# REQUEST FORMAT
# =========================================

class ChatRequest(BaseModel):

    messages: list

    model: str = "groq"


# =========================================
# AGENT EXECUTION REQUEST
# =========================================

class ExecuteRequest(BaseModel):

    task_id: str

    approved: bool = False


# =========================================
# TOOL REQUEST
# =========================================

class ToolRequest(BaseModel):

    tool: str

    arguments: dict = Field(
        default_factory=dict
    )


# =========================================
# INTENT CLASSIFICATION
# =========================================

async def classify_user_intent(
    message: str
):
    """
    Uses Groq to classify whether a request
    is normal chat or an agent task.

    Returns a RouteDecision object.
    """

    prompt = build_intent_prompt(
        message
    )

    try:

        response = (
            groq_client
            .chat
            .completions
            .create(

                model=
                    "llama-3.3-70b-versatile",

                messages=[

                    {
                        "role":
                            "system",

                        "content":
                            (
                                "You are a strict "
                                "Volby request "
                                "classifier."
                            )
                    },

                    {
                        "role":
                            "user",

                        "content":
                            prompt
                    }

                ],

                temperature=0,

                max_tokens=30
            )
        )


        result = (
            response
            .choices[0]
            .message
            .content
        )


        return parse_route_result(
            result
        )


    except Exception as error:

        print(
            "Intent classification error:",
            error
        )


        # Safe fallback:
        # treat failed classification
        # as normal conversation.

        return parse_route_result(

            "MODE: CHAT\n"
            "TYPE: conversation"

        )


# =========================================
# ROOT
# =========================================

@app.get("/")
async def root():

    return {

        "message":
            "Volby AI backend is running!",

        "agent":
            "enabled",

        "status":
            "online"

    }


# =========================================
# HEALTH
# =========================================

@app.get("/health")
async def health():

    return {

        "status":
            "healthy",

        "agent":
            "ready",

        "executor":
            "ready",

        "workspace":
            str(
                executor.workspace
            )

    }


# =========================================
# AVAILABLE MODELS
# =========================================

@app.get("/models")
async def get_models():

    return {

        "models": [

            {
                "id":
                    "groq",

                "name":
                    "Llama 3.3 70B",

                "provider":
                    "Groq"
            },

            {
                "id":
                    "openrouter",

                "name":
                    "GPT-OSS 120B",

                "provider":
                    "OpenRouter"
            }

        ]

    }


# =========================================
# AVAILABLE TOOLS
# =========================================

@app.get("/tools")
async def get_tools():

    return {

        "tools":
            get_tool_descriptions()

    }


# =========================================
# CHAT
# =========================================

@app.post("/chat")
async def chat(
    request: ChatRequest
):

    selected_model = request.model


    # =====================================
    # GET LAST USER MESSAGE
    # =====================================

    user_message = ""


    if request.messages:

        last_message = (
            request.messages[-1]
        )


        if isinstance(
            last_message,
            dict
        ):

            user_message = (
                last_message.get(
                    "content",
                    ""
                )
            )


    user_message = (
        user_message.strip()
    )


    if not user_message:

        raise HTTPException(

            status_code=400,

            detail=
                "Message cannot be empty."

        )


    # =====================================
    # AI INTENT CLASSIFICATION
    # =====================================

    route = await classify_user_intent(

        user_message

    )


    # =====================================
    # VOLBY PILOT
    # =====================================

    if route.mode == "agent":

        plan = create_plan(

            user_message,

            task_type=
                route.task_type

        )


        # =================================
        # CREATE TASK ID
        # =================================

        task_id = str(
            uuid.uuid4()
        )


        # =================================
        # STORE TASK
        # =================================

        TASKS[
            task_id
        ] = {

            "id":
                task_id,

            "request":
                user_message,

            "task_type":
                route.task_type,

            "risk_level":
                plan.risk_level,

            "steps":
                plan.steps,

            "requires_permission":
                plan.requires_permission,

            "status":
                "awaiting_approval",

            "approved":
                False

        }


        # =================================
        # RETURN AGENT PLAN
        # =================================

        return {

            "response": (

                "Volby Pilot created "
                "an execution plan.\n\n"

                + "\n".join(

                    f"{index}. {step}"

                    for index, step
                    in enumerate(

                        plan.steps,

                        start=1

                    )

                )

                + "\n\n"

                "Task ID: "

                + task_id

                + "\n\n"

                "Permission is required "
                "before execution."

            ),

            "model_used":
                "Volby Pilot",

            "mode":
                "agent",

            "task_id":
                task_id,

            "task_type":
                route.task_type,

            "risk_level":
                plan.risk_level,

            "requires_permission":
                plan.requires_permission,

            "plan":
                plan.steps

        }


    # =====================================
    # NORMAL CHAT
    # =====================================

    messages = [

        {

            "role":
                "system",

            "content":
                SYSTEM_PROMPT

        },

        *request.messages

    ]


    # =====================================
    # GROQ MODEL
    # =====================================

    if selected_model == "groq":

        try:

            response = (
                groq_client
                .chat
                .completions
                .create(

                    model=
                        "llama-3.3-70b-versatile",

                    messages=
                        messages,

                    temperature=0.7,

                    max_tokens=500

                )
            )


            answer = (
                response
                .choices[0]
                .message
                .content
            )


            return {

                "response":
                    answer,

                "model_used":
                    "Llama 3.3 70B",

                "mode":
                    "chat"

            }


        except Exception as error:

            print(

                "Groq error:",

                error

            )


            raise HTTPException(

                status_code=500,

                detail=
                    "Groq model failed."

            )


    # =====================================
    # OPENROUTER MODEL
    # =====================================

    elif selected_model == "openrouter":

        try:

            headers = {

                "Authorization":
                    (
                        "Bearer "
                        + OPENROUTER_API_KEY
                    ),

                "Content-Type":
                    "application/json",

                "HTTP-Referer":
                    (
                        "https://"
                        "ekanshsinghvns2010.github.io/"
                        "volby-ai/"
                    ),

                "X-Title":
                    "Volby AI"

            }


            payload = {

                "model":
                    "openrouter/free",

                "messages":
                    messages,

                "temperature":
                    0.7,

                "max_tokens":
                    500

            }


            async with httpx.AsyncClient(

                timeout=60.0

            ) as http_client:

                response = (
                    await http_client.post(

                        "https://"
                        "openrouter.ai/"
                        "api/v1/"
                        "chat/"
                        "completions",

                        headers=
                            headers,

                        json=
                            payload

                    )
                )


            if response.status_code != 200:

                print(

                    "OpenRouter error:",

                    response.status_code,

                    response.text

                )


                raise HTTPException(

                    status_code=
                        response.status_code,

                    detail=
                        response.text

                )


            data = (
                response.json()
            )


            answer = (

                data
                ["choices"]
                [0]
                ["message"]
                ["content"]

            )


            return {

                "response":
                    answer,

                "model_used":
                    "GPT-OSS 120B",

                "mode":
                    "chat"

            }


        except HTTPException:

            raise


        except Exception as error:

            print(

                "OpenRouter error:",

                error

            )


            raise HTTPException(

                status_code=500,

                detail=
                    "OpenRouter model failed."

            )


    # =====================================
    # INVALID MODEL
    # =====================================

    else:

        raise HTTPException(

            status_code=400,

            detail=
                "Invalid model selected."

        )


# =========================================
# GET TASK
# =========================================

@app.get(
    "/tasks/{task_id}"
)
async def get_task(
    task_id: str
):

    task = TASKS.get(
        task_id
    )


    if not task:

        raise HTTPException(

            status_code=404,

            detail=
                "Task not found."

        )


    return task


# =========================================
# APPROVE / EXECUTE TASK
# =========================================

@app.post(
    "/tasks/execute"
)
async def execute_task(
    request: ExecuteRequest
):

    task = TASKS.get(
        request.task_id
    )


    if not task:

        raise HTTPException(

            status_code=404,

            detail=
                "Task not found."

        )


    # =====================================
    # REJECTED
    # =====================================

    if not request.approved:

        task[
            "status"
        ] = "rejected"


        return {

            "success":
                False,

            "message":
                (
                    "Task execution "
                    "was not approved."
                ),

            "task_id":
                request.task_id

        }


    # =====================================
    # APPROVED
    # =====================================

    task[
        "approved"
    ] = True


    task[
        "status"
    ] = "approved"


    return {

        "success":
            True,

        "message":
            (
                "Task approved. "
                "The Volby execution "
                "engine is ready for "
                "tool execution."
            ),

        "task_id":
            request.task_id,

        "status":
            task[
                "status"
            ],

        "plan":
            task[
                "steps"
            ]

    }


# =========================================
# DIRECT TOOL EXECUTION
# =========================================

@app.post(
    "/tools/execute"
)
async def run_tool(
    request: ToolRequest
):

    """
    Executes a Volby tool.

    This endpoint is mainly for testing
    the executor and tool system.

    Future production versions should
    add authentication and permissions.
    """

    result = execute_tool(

        executor=

            executor,

        tool_name=

            request.tool,

        arguments=

            request.arguments

    )


    return result