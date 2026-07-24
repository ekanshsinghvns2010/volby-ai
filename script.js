// =========================
// Variables
// =========================

let chats = [];


// =========================
// Mobile Sidebar
// =========================

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    sidebar.classList.toggle("open");

}


// =========================
// Send Message
// =========================

function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const text =
        input.value.trim();


    if (!text) {

        return;

    }


    // Remove welcome screen

    const welcome =
        document.getElementById("welcome");

    if (welcome) {

        welcome.remove();

    }


    // Add user message

    addMessage(
        text,
        "user"
    );


    // Save history

    chats.push(text);

    updateHistory();


    // Clear input

    input.value = "";

    input.style.height = "auto";


    // Temporary Volby response

    setTimeout(
        () => {

            addMessage(
                "Hello! I'm Volby, your AI assistant from Volbasty Studios. My AI engine isn't connected yet, but my interface is ready! 🤖",
                "ai"
            );

        },
        600
    );

}


// =========================
// Add Message
// =========================

function addMessage(
    text,
    type
) {

    const chatArea =
        document.getElementById("chatArea");


    const message =
        document.createElement("div");


    message.className =
        `message ${type}-message`;


    const avatar =
        document.createElement("div");


    avatar.className =
        `avatar ${type}-avatar`;


    avatar.textContent =
        type === "user"
            ? "You"
            : "V";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        avatar
    );


    message.appendChild(
        content
    );


    chatArea.appendChild(
        message
    );


    // Scroll to bottom

    chatArea.scrollTo({

        top:
            chatArea.scrollHeight,

        behavior:
            "smooth"

    });

}


// =========================
// Suggestion Buttons
// =========================

function useSuggestion(
    text
) {

    const input =
        document.getElementById(
            "messageInput"
        );


    input.value =
        text;


    input.focus();

}


// =========================
// Enter to Send
// =========================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


// =========================
// New Chat
// =========================

function newChat() {

    const chatArea =
        document.getElementById(
            "chatArea"
        );


    chatArea.innerHTML = `

        <div
            id="welcome"
            class="welcome"
        >

            <div class="welcome-logo">
                V
            </div>

            <h1>
                Hello, I'm Volby.
            </h1>

            <p>
                Your AI assistant from
                <strong>
                    Volbasty Studios
                </strong>.
            </p>

        </div>

    `;

}


// =========================
// Clear Chat
// =========================

function clearChat() {

    newChat();

}


// =========================
// Chat History
// =========================

function updateHistory() {

    const history =
        document.getElementById(
            "historyList"
        );


    history.innerHTML = "";


    chats
        .slice(-10)
        .reverse()
        .forEach(
            chat => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "history-item";


                item.textContent =
                    chat;


                history.appendChild(
                    item
                );

            }
        );

}


// =========================
// Settings
// =========================

function showSettings() {

    const content =
        document.getElementById(
            "modalContent"
        );


    content.innerHTML = `

        <h2>Volby Settings</h2>

        <br>

        <p>
            ⚙️ Settings will be available
            in a future version.
        </p>

        <br>

        <p style="color:#777">

            Volby v1.0

            <br>

            Built by Volbasty Studios

        </p>

    `;


    openModal();

}


// =========================
// About
// =========================

function showAbout() {

    const content =
        document.getElementById(
            "modalContent"
        );


    content.innerHTML = `

        <h2>About Volby</h2>

        <br>

        <p>

            Volby is an AI assistant
            created by Volbasty Studios.

        </p>

        <br>

        <p style="color:#777">

            Our goal is to build useful,
            creative and accessible AI tools.

        </p>

    `;


    openModal();

}


// =========================
// Modal
// =========================

function openModal() {

    document
        .getElementById("modal")
        .classList
        .add("show");

}


function closeModal(
    event
) {

    if (
        !event ||
        event.target.id === "modal"
    ) {

        document
            .getElementById("modal")
            .classList
            .remove("show");

    }

}