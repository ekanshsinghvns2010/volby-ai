// ==========================================
// VOLBY AI
// MAIN JAVASCRIPT
// ==========================================


// ==========================================
// BACKEND
// ==========================================

const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";


// ==========================================
// MEMORY
// ==========================================

// Conversation memory for current session

let messages = [];


// ==========================================
// GET ELEMENTS
// ==========================================

const input =
    document.getElementById("user-input");

const sendButton =
    document.getElementById("send-button");

const messagesContainer =
    document.getElementById("messages-container");

const welcomeScreen =
    document.getElementById("welcome-screen");

const characterCount =
    document.getElementById("character-count");

const themeButton =
    document.getElementById("theme-button");

const themeMenu =
    document.getElementById("theme-menu");

const newChatButton =
    document.getElementById("new-chat-button");

const headerNewChat =
    document.getElementById("header-new-chat");

const clearChatButton =
    document.getElementById("clear-chat-button");

const openSidebar =
    document.getElementById("open-sidebar");

const closeSidebar =
    document.getElementById("close-sidebar");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");


// ==========================================
// THEME SYSTEM
// ==========================================

const savedTheme =
    localStorage.getItem("volby-theme")
    || "midnight";


document.body.dataset.theme =
    savedTheme;


function setTheme(theme) {

    document.body.dataset.theme =
        theme;

    localStorage.setItem(
        "volby-theme",
        theme
    );

    themeMenu.classList.add(
        "hidden"
    );
}


document
    .querySelectorAll(".theme-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const theme =
                    button.dataset.theme;

                setTheme(theme);

            }
        );

    });


// Open theme menu

themeButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        themeMenu.classList.toggle(
            "hidden"
        );

    }
);


// Close theme menu when clicking outside

document.addEventListener(
    "click",
    event => {

        if (
            !themeMenu.contains(event.target)
            &&
            !themeButton.contains(event.target)
        ) {

            themeMenu.classList.add(
                "hidden"
            );

        }

    }
);


// ==========================================
// SIDEBAR
// ==========================================

function openSidebarMenu() {

    sidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.remove(
        "hidden"
    );

}


function closeSidebarMenu() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.add(
        "hidden"
    );

}


openSidebar.addEventListener(
    "click",
    openSidebarMenu
);


closeSidebar.addEventListener(
    "click",
    closeSidebarMenu
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebarMenu
);


// ==========================================
// AUTO GROW TEXTAREA
// ==========================================

function resizeInput() {

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            160
        ) + "px";

}


input.addEventListener(
    "input",
    () => {

        resizeInput();

        characterCount.textContent =
            `${input.value.length} / 10000`;

    }
);


// ==========================================
// SCROLL
// ==========================================

function scrollToBottom() {

    const chat =
        document.getElementById("chat");

    chat.scrollTop =
        chat.scrollHeight;

}


// ==========================================
// SHOW / HIDE WELCOME
// ==========================================

function updateWelcomeScreen() {

    if (messages.length > 0) {

        welcomeScreen.classList.add(
            "hidden"
        );

    } else {

        welcomeScreen.classList.remove(
            "hidden"
        );

    }

}


// ==========================================
// ADD USER MESSAGE
// ==========================================

function addUserMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row user";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        "👤";


    const content =
        document.createElement("div");

    content.className =
        "message-content";

    content.textContent =
        text;


    row.appendChild(
        content
    );

    row.appendChild(
        avatar
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();

}


// ==========================================
// THINKING MESSAGE
// ==========================================

function createThinkingMessage() {

    const row =
        document.createElement("div");

    row.className =
        "message-row ai";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        "🤖";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const thinking =
        document.createElement("div");

    thinking.className =
        "thinking";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement("span");

        thinking.appendChild(
            dot
        );

    }


    content.appendChild(
        thinking
    );


    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();


    return {
        row,
        content
    };

}


// ==========================================
// ADD AI MESSAGE
// ==========================================

function addAIMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row ai";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        "🤖";


    const wrapper =
        document.createElement("div");


    const content =
        document.createElement("div");

    content.className =
        "message-content";

    content.textContent =
        text;


    const actions =
        document.createElement("div");

    actions.className =
        "message-actions";


    const copyButton =
        document.createElement("button");

    copyButton.className =
        "message-action";

    copyButton.textContent =
        "📋 Copy";


    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard
                    .writeText(text);

                copyButton.textContent =
                    "✓ Copied";

                setTimeout(
                    () => {

                        copyButton.textContent =
                            "📋 Copy";

                    },
                    1500
                );

            } catch {

                copyButton.textContent =
                    "Copy failed";

            }

        }
    );


    actions.appendChild(
        copyButton
    );


    wrapper.appendChild(
        content
    );

    wrapper.appendChild(
        actions
    );


    row.appendChild(
        avatar
    );

    row.appendChild(
        wrapper
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();

}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const text =
        input.value.trim();


    // Don't send empty message

    if (
        text === ""
        ||
        sendButton.disabled
    ) {

        return;

    }


    // Hide welcome screen

    welcomeScreen.classList.add(
        "hidden"
    );


    // Show user message

    addUserMessage(
        text
    );


    // Add to memory

    messages.push({

        role: "user",

        content: text

    });


    // Clear input

    input.value = "";

    input.style.height =
        "auto";

    characterCount.textContent =
        "0 / 10000";


    // Disable send

    sendButton.disabled =
        true;


    // Thinking animation

    const thinking =
        createThinkingMessage();


    try {


        // ==================================
        // SEND TO BACKEND
        // ==================================

        const response =
            await fetch(
                BACKEND_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            messages:
                                messages

                        })

                }
            );


        // Server error

        if (
            !response.ok
        ) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        // Get response

        const data =
            await response.json();


        const answer =
            data.response;


        // Remove thinking

        thinking.row.remove();


        // Add AI response to memory

        messages.push({

            role: "assistant",

            content: answer

        });


        // Display response

        addAIMessage(
            answer
        );


    } catch (error) {


        console.error(
            "Volby Error:",
            error
        );


        // Remove thinking

        thinking.row.remove();


        // Remove failed user message

        messages.pop();


        // Show error

        addAIMessage(
            "Sorry, I couldn't connect to Volby right now. Please try again."
        );

    }


    // Enable send

    sendButton.disabled =
        false;


    input.focus();

}


// ==========================================
// SEND BUTTON
// ==========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// ==========================================
// ENTER KEY
// ==========================================

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
            &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ==========================================
// SUGGESTION CARDS
// ==========================================

document
    .querySelectorAll(
        ".suggestion-card"
    )
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const prompt =
                    card.dataset.prompt;

                input.value =
                    prompt;

                resizeInput();

                characterCount.textContent =
                    `${input.value.length} / 10000`;

                input.focus();

            }
        );

    });


// ==========================================
// NEW CHAT
// ==========================================

function startNewChat() {

    messages = [];

    messagesContainer.innerHTML =
        "";

    input.value =
        "";

    input.style.height =
        "auto";

    characterCount.textContent =
        "0 / 10000";

    updateWelcomeScreen();

    closeSidebarMenu();

    input.focus();

}


newChatButton.addEventListener(
    "click",
    startNewChat
);


if (headerNewChat) {

    headerNewChat.addEventListener(
        "click",
        startNewChat
    );

}


// ==========================================
// CLEAR CONVERSATION
// ==========================================

clearChatButton.addEventListener(
    "click",
    () => {

        if (
            messages.length === 0
        ) {

            return;

        }


        const confirmed =
            confirm(
                "Clear this conversation?"
            );


        if (
            confirmed
        ) {

            startNewChat();

        }

    }
);


// ==========================================
// INITIALIZE
// ==========================================

updateWelcomeScreen();

input.focus();