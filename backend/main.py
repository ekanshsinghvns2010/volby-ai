import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq


# Get Groq API key from environment variable
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY is not configured")


# Create Groq client
client = Groq(api_key=api_key)


# Create FastAPI app
app = FastAPI()


# Allow requests from your GitHub Pages website
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ekanshsinghvns2010.github.io"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Message format received from the website
class ChatRequest(BaseModel):
    message: str


# Test endpoint
@app.get("/")
async def root():
    return {
        "message": "Volby AI backend is running!"
    }


# Chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are Volby, a helpful AI assistant."
            },
            {
                "role": "user",
                "content": request.message
            }
        ],
        temperature=0.7,
        max_tokens=500
    )

    answer = response.choices[0].message.content

    return {
        "response": answer
    }