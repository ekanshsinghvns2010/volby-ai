/* ========================================= */
/* VOLBY AI - FRONTEND */
/* ========================================= */


/* ========================================= */
/* BACKEND */
/* ========================================= */

const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";


/* ========================================= */
/* ELEMENTS */
/* ========================================= */

const body =
    document.body;

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");

const menuButton =
    document.getElementById("menu-button");

const closeSidebar =
    document.getElementById("close-sidebar");

const newChatButton =
    document.getElementById("new-chat-button");

const historyList =
    document.getElementById("history-list");

const emptyHistory =
    document.getElementById("empty-history");

const messagesContainer =
    document.getElementById("messages");

const welcomeScreen =
    document.getElementById("welcome-screen");

const input =
    document.getElementById("user-input");

const sendButton =
    document.getElementById("send-button");

const characterCount =
    document.getElementById("character-count");

const themeButtons =
    document.querySelectorAll(".theme-circle");

const aboutButton =
    document.getElementById("about-button");

const aboutModal =
    document.getElementById("about-modal");

const closeAbout =
    document.getElementById("close-about");

const suggestions =
    document.querySelectorAll(".suggestion");


/* ========================================= */
/* MEMORY */
/* ========================================= */

let messages = [];

let chatHistory =
    JSON.parse(
        localStorage.getItem(
            "volby_chat_history"
        )
    ) || [];


/* ========================================= */
/* THEME */
/* ========================================= */

const savedTheme =
    localStorage.getItem(
        "volby_theme"
    ) || "midnight";


setTheme(savedTheme);


function setTheme(theme) {

    body.dataset.theme =
        theme;

    localStorage.setItem(
        "volby_theme",
        theme
    );


    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === theme
            );

        }
    );

}


/* Theme buttons */

themeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                setTheme(
                    button.dataset.theme
                );

            }
        );

    }
);


/* ========================================= */
/* SIDEBAR */
/* ========================================= */

function openSidebar() {

    sidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.add(
        "active"
    );

}


function closeSidebarMenu() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "active"
    );

}


menuButton.addEventListener(
    "click",
    openSidebar
);


closeSidebar.addEventListener(
    "click",
    closeSidebarMenu
);


sidebarOverlay.addEventListener(
    "click",
    closeSidebarMenu
);


/* ========================================= */
/* NEW CHAT */
/* ========================================= */

newChatButton.addEventListener(
    "click",
    () => {

        messages = [];

        messagesContainer
            .innerHTML = "";

        messagesContainer
            .appendChild(
                welcomeScreen
            );

        input.value = "";

        updateCharacterCount();

        closeSidebarMenu();

        input.focus();

    }
);


/* ========================================= */
/* CHARACTER COUNT */
/* ========================================= */

input.addEventListener(
    "input",
    () => {

        updateCharacterCount();

        autoResize();

    }
);


function updateCharacterCount() {

    characterCount.textContent =
        `${input.value.length} / 10000`;

}


/* ========================================= */
/* AUTO RESIZE INPUT */
/* ========================================= */

function autoResize() {

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            160
        ) + "px";

}


/* ========================================= */
/* ADD MESSAGE */
/* ========================================= */

function addMessage(
    content,
    role
) {

    welcomeScreen.style.display =
        "none";


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row " +
        role;


    const message =
        document.createElement(
            "div"
        );

    message.className =
        "message " +
        role;

    message.textContent =
        content;


    row.appendChild(
        message
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();


    return message;

}


/* ========================================= */
/* THINKING MESSAGE */
/* ========================================= */

function addThinkingMessage() {

    welcomeScreen.style.display =
        "none";


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row ai";


    const message =
        document.createElement(
            "div"
        );

    message.className =
        "message ai";


    message.innerHTML = `

        <div class="thinking">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    row.appendChild(
        message
    );


    messagesContainer.appendChild(
        row
    );


    scrollToBottom();


    return row;

}


/* ========================================= */
/* SEND MESSAGE */
/* ========================================= */

async function sendMessage() {


    const text =
        input.value.trim();


    if (
        text === "" ||
        sendButton.disabled
    ) {

        return;

    }


    /* Add user message */

    messages.push({

        role: "user",

        content: text

    });


    addMessage(
        text,
        "user"
    );


    /* Clear input */

    input.value = "";

    updateCharacterCount();

    autoResize();


    /* Disable sending */

    sendButton.disabled =
        true;


    /* Thinking */

    const thinking =
        addThinkingMessage();


    try {


        /* Send conversation */

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


        if (
            !response.ok
        ) {

            throw new Error(
                "Server Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        const answer =
            data.response ||
            "I couldn't generate a response.";


        /* Remove thinking */

        thinking.remove();


        /* Add AI response */

        messages.push({

            role: "assistant",

            content: answer

        });


        const aiMessage =
            addMessage(
                answer,
                "ai"
            );


        /* Add copy button */

        const actions =
            document.createElement(
                "div"
            );

        actions.className =
            "message-actions";


        const copyButton =
            document.createElement(
                "button"
            );

        copyButton.className =
            "copy-button";

        copyButton.textContent =
            "Copy";


        copyButton.addEventListener(
            "click",
            async () => {

                await navigator.clipboard
                    .writeText(
                        answer
                    );

                copyButton.textContent =
                    "Copied!";


                setTimeout(
                    () => {

                        copyButton.textContent =
                            "Copy";

                    },
                    1500
                );

            }
        );


        actions.appendChild(
            copyButton
        );


        aiMessage.appendChild(
            actions
        );


        /* Save chat */

        saveCurrentChat(
            text
        );


    } catch (error) {


        console.error(
            "Volby Error:",
            error
        );


        thinking.remove();


        addMessage(

            "Sorry, I couldn't connect to Volby right now. Please try again.",

            "ai"

        );


        /* Remove failed message */

        messages.pop();

    }


    sendButton.disabled =
        false;


    input.focus();


}


/* ========================================= */
/* SEND BUTTON */
/* ========================================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* ========================================= */
/* KEYBOARD */
/* ========================================= */

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* ========================================= */
/* SUGGESTIONS */
/* ========================================= */

suggestions.forEach(
    suggestion => {

        suggestion.addEventListener(
            "click",
            () => {

                input.value =
                    suggestion.dataset.prompt;

                updateCharacterCount();

                autoResize();

                input.focus();

            }
        );

    }
);


/* ========================================= */
/* SCROLL */
/* ========================================= */

function scrollToBottom() {

    const chat =
        document.getElementById(
            "chat"
        );


    setTimeout(
        () => {

            chat.scrollTop =
                chat.scrollHeight;

        },
        50
    );

}


/* ========================================= */
/* CHAT HISTORY */
/* ========================================= */

function saveCurrentChat(
    firstMessage
) {


    const title =
        firstMessage.length > 35

            ? firstMessage.substring(
                0,
                35
            ) + "..."

            : firstMessage;


    const chat = {

        title: title,

        messages:
            [...messages],

        timestamp:
            Date.now()

    };


    chatHistory.unshift(
        chat
    );


    /* Keep last 20 chats */

    chatHistory =
        chatHistory.slice(
            0,
            20
        );


    localStorage.setItem(

        "volby_chat_history",

        JSON.stringify(
            chatHistory
        )

    );


    renderHistory();

}


/* ========================================= */
/* RENDER HISTORY */
/* ========================================= */

function renderHistory() {


    historyList.innerHTML =
        "";


    if (
        chatHistory.length === 0
    ) {

        emptyHistory.style.display =
            "block";

        return;

    }


    emptyHistory.style.display =
        "none";


    chatHistory.forEach(
        (chat, index) => {


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "history-item";


            button.innerHTML = `

                <span class="history-icon">
                    💬
                </span>

                <span class="history-title">
                    ${escapeHTML(
                        chat.title
                    )}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    loadChat(
                        index
                    );

                }
            );


            historyList.appendChild(
                button
            );

        }
    );

}


/* ========================================= */
/* LOAD CHAT */
/* ========================================= */

function loadChat(
    index
) {


    const chat =
        chatHistory[index];


    if (!chat) {

        return;

    }


    messages =
        [...chat.messages];


    messagesContainer
        .innerHTML = "";


    welcomeScreen.style.display =
        "none";


    messages.forEach(
        message => {

            addMessage(

                message.content,

                message.role

            );

        }
    );


    closeSidebarMenu();


    scrollToBottom();

}


/* ========================================= */
/* ESCAPE HTML */
/* ========================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* ========================================= */
/* ABOUT MODAL */
/* ========================================= */

aboutButton.addEventListener(
    "click",
    () => {

        aboutModal.classList.remove(
            "hidden"
        );

    }
);


closeAbout.addEventListener(
    "click",
    () => {

        aboutModal.classList.add(
            "hidden"
        );

    }
);


aboutModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            aboutModal
        ) {

            aboutModal.classList.add(
                "hidden"
            );

        }

    }
);


/* ========================================= */
/* INITIALIZE */
/* ========================================= */

renderHistory();

updateCharacterCount();

// ===============================
// SIDEBAR MENU
// ===============================

const menuButton = document.getElementById("menu-button");
const closeMenuButton = document.getElementById("close-menu");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

function openSidebar() {
    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("active");
    }
}

function closeSidebar() {
    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
    }
}

if (menuButton) {
    menuButton.addEventListener("click", openSidebar);
}

if (closeMenuButton) {
    closeMenuButton.addEventListener("click", closeSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}