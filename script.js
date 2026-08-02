// ==========================================
// Volby AI - Frontend
// ==========================================


// Your Render backend
const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";


// ==========================================
// Conversation Memory
// ==========================================

// This stores the conversation during the
// current browser session.
const messages = [];


// ==========================================
// Get HTML Elements
// ==========================================

const input =
    document.getElementById("user-input");

const sendButton =
    document.getElementById("send-button");

const chat =
    document.getElementById("chat");


// ==========================================
// Send Message
// ==========================================

async function sendMessage() {

    const text =
        input.value.trim();


    // Don't send empty messages
    if (text === "") {
        return;
    }


    // ======================================
    // Show User Message
    // ======================================

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "message user";

    userMessage.textContent =
        text;

    chat.appendChild(userMessage);


    // Clear input
    input.value = "";


    // Disable button while waiting
    sendButton.disabled = true;


    // ======================================
    // Show Thinking Message
    // ======================================

    const aiMessage =
        document.createElement("div");

    aiMessage.className =
        "message ai";

    aiMessage.textContent =
        "Volby is thinking...";

    chat.appendChild(aiMessage);


    // Scroll to bottom
    chat.scrollTop =
        chat.scrollHeight;


    try {

        // ==================================
        // Add Current User Message
        // ==================================

        messages.push({
            role: "user",
            content: text
        });


        // ==================================
        // Send Entire Conversation
        // ==================================

        const response =
            await fetch(BACKEND_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: messages
                })

            });


        // Check for server error
        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }


        // ==================================
        // Get AI Response
        // ==================================

        const data =
            await response.json();


        // ==================================
        // Save AI Response to Memory
        // ==================================

        messages.push({
            role: "assistant",
            content: data.response
        });


        // ==================================
        // Display Volby's Response
        // ==================================

        aiMessage.textContent =
            data.response;


    } catch (error) {

        console.error(
            "Volby Error:",
            error
        );


        // Remove the user message from
        // memory if the request failed
        messages.pop();


        // Show error
        aiMessage.textContent =
            "Sorry, I couldn't connect to Volby right now. Please try again.";

    }


    // Enable button again
    sendButton.disabled = false;


    // Scroll to bottom
    chat.scrollTop =
        chat.scrollHeight;

}


// ==========================================
// Send When Button Is Clicked
// ==========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// Send When Enter Is Pressed
// ==========================================

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);