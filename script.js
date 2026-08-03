VOLBY AI - SCRIPT.JS UPDATE INSTRUCTIONS

Use the currently attached working script.js as the source file.

Required changes:
1. Keep the existing Groq model as the default.
2. In the website UI, call the default model: Volby
3. Add the second model and call it: Volby Pro
4. Frontend model IDs sent to the backend:
   - Volby -> "groq"
   - Volby Pro -> "openrouter"
5. The actual provider/model names (Groq, Llama, OpenRouter, GPT) must NOT be shown in the website UI.
6. Save the selected model in localStorage so it persists after refresh.
7. Send the selected model in the POST /chat request:
   {
       messages: messages,
       model: selectedModel
   }
8. Keep all existing functionality unchanged:
   - Supabase authentication
   - persistent login session
   - chat history
   - themes
   - sidebar
   - new chat
   - copy buttons
   - markdown formatting
   - backend URL
9. Do not expose any API keys in script.js.
10. The model selector should be added dynamically by JavaScript so index.html does not need to be changed.

IMPORTANT:
The current backend must support:
- model: "groq"
- model: "openrouter"

Default:
let selectedModel = "groq";

Persist with:
localStorage key: "volby_selected_model"
