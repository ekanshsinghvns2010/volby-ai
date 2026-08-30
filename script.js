/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 1
============================================================ */

"use strict";

(() => {

    /* ================= CONFIG ================= */

    const BACKEND_URL =
        "https://volby-ai-backend.onrender.com/chat";

    const SUPABASE_URL =
        "https://eyxhphclrpmtmikgwmnx.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_T5x5nYsNFTznpBdotgxfTQ_x0ITpd38";

    const MODEL_STORAGE_KEY =
        "volby_selected_model";

    const THEME_STORAGE_KEY =
        "volby_theme";

    const HISTORY_STORAGE_KEY =
        "volby_chat_history";

    const MAX_MESSAGE_LENGTH = 10000;
    const MAX_HISTORY = 50;


    /* ================= MODELS ================= */

    const MODEL_OPTIONS = [
        {
            label: "Volby",
            value: "groq",
            description: "Fast AI",
            icon: "⚡"
        },
        {
            label: "Volby Pro",
            value: "openrouter",
            description: "Advanced AI",
            icon: "✦"
        }
    ];


    /* ================= SUPABASE ================= */

    let supabaseClient = null;

    function initializeSupabase() {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            try {

                supabaseClient =
                    window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_PUBLISHABLE_KEY
                    );

            } catch (error) {

                console.error(
                    "Supabase error:",
                    error
                );
            }
        }
    }


    /* ================= DOM ================= */

    const body =
        document.body;

    const sidebar =
        document.getElementById("sidebar");

    const sidebarOverlay =
        document.getElementById("sidebar-overlay");

    const menuButton =
        document.getElementById("menu-button");

    const closeSidebarButton =
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


    /* ================= STATE ================= */

    let messages = [];

    let chatHistory = [];

    let currentUser = null;

    let selectedModel = "groq";

    let currentChatId = null;

    let isSending = false;


    /* ================= STORAGE ================= */

    function getStorage(key, fallback) {

        try {

            const value =
                localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.error(
                "Storage read error:",
                error
            );

            return fallback;
        }
    }


    function setStorage(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error(
                "Storage write error:",
                error
            );

            return false;
        }
    }


    /* ================= LOAD STATE ================= */

    function loadSavedState() {

        chatHistory =
            getStorage(
                HISTORY_STORAGE_KEY,
                []
            );

        if (!Array.isArray(chatHistory)) {
            chatHistory = [];
        }

        const savedModel =
            localStorage.getItem(
                MODEL_STORAGE_KEY
            );

        if (
            savedModel === "groq" ||
            savedModel === "openrouter"
        ) {
            selectedModel =
                savedModel;
        }
    }


    /* ================= NEXT CHUNK ================= */

    // Model selector, themes, sidebar,
    // modal and input system continue
    // in CHUNK 2.

})();
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 2
   MODEL SELECTOR + THEMES
============================================================ */


/* ================= MODEL STORAGE ================= */

function loadSelectedModel() {

    const saved =
        localStorage.getItem(
            MODEL_STORAGE_KEY
        );

    if (
        saved === "groq" ||
        saved === "openrouter"
    ) {
        selectedModel = saved;
    }
}


function saveSelectedModel() {

    try {

        localStorage.setItem(
            MODEL_STORAGE_KEY,
            selectedModel
        );

    } catch (error) {

        console.error(
            "Model save error:",
            error
        );
    }
}


/* ================= MODEL SELECTOR ================= */

function createModelSelector() {

    const controls =
        document.getElementById(
            "input-controls"
        );

    if (!controls) {
        return;
    }

    if (
        document.getElementById(
            "volby-model-selector"
        )
    ) {
        return;
    }


    const wrapper =
        document.createElement("div");

    wrapper.id =
        "volby-model-selector";

    wrapper.className =
        "volby-model-selector";


    const button =
        document.createElement("button");

    button.type = "button";

    button.id =
        "current-model-button";

    button.className =
        "current-model-button";

    button.setAttribute(
        "aria-expanded",
        "false"
    );


    const menu =
        document.createElement("div");

    menu.id =
        "model-selector-menu";

    menu.className =
        "model-selector-menu";


    MODEL_OPTIONS.forEach(
        option => {

            const item =
                document.createElement("button");

            item.type = "button";

            item.className =
                "model-option";

            item.dataset.model =
                option.value;

            item.innerHTML = `
                <span class="model-option-icon">
                    ${option.icon}
                </span>

                <span class="model-option-info">
                    <span class="model-option-name">
                        ${option.label}
                    </span>

                    <span class="model-option-description">
                        ${option.description}
                    </span>
                </span>

                <span class="model-option-check">
                    ✓
                </span>
            `;


            item.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    selectedModel =
                        option.value;

                    saveSelectedModel();

                    updateModelSelector();

                    closeModelMenu();
                }
            );


            menu.appendChild(item);
        }
    );


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const open =
                menu.classList.toggle(
                    "open"
                );

            button.setAttribute(
                "aria-expanded",
                open
                    ? "true"
                    : "false"
            );
        }
    );


    wrapper.appendChild(button);

    wrapper.appendChild(menu);


    controls.insertBefore(
        wrapper,
        controls.firstChild
    );


    updateModelSelector();
}


/* ================= UPDATE MODEL UI ================= */

function updateModelSelector() {

    const button =
        document.getElementById(
            "current-model-button"
        );

    if (!button) {
        return;
    }

    const option =
        MODEL_OPTIONS.find(
            item =>
                item.value ===
                selectedModel
        );

    if (!option) {
        return;
    }


    button.innerHTML = `
        <span class="current-model-icon">
            ${option.icon}
        </span>

        <span class="current-model-name">
            ${option.label}
        </span>

        <span class="model-arrow">
            ▾
        </span>
    `;


    document
        .querySelectorAll(".model-option")
        .forEach(item => {

            const active =
                item.dataset.model ===
                selectedModel;

            item.classList.toggle(
                "selected",
                active
            );
        });
}


/* ================= CLOSE MODEL MENU ================= */

function closeModelMenu() {

    const menu =
        document.getElementById(
            "model-selector-menu"
        );

    const button =
        document.getElementById(
            "current-model-button"
        );

    if (menu) {
        menu.classList.remove("open");
    }

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


/* ================= THEMES ================= */

function setTheme(theme) {

    const validThemes = [
        "midnight",
        "snow",
        "blue",
        "purple",
        "ocean",
        "sunset"
    ];

    if (
        !validThemes.includes(theme)
    ) {
        theme = "blue";
    }


    body.dataset.theme =
        theme;


    themeButtons.forEach(
        button => {

            const active =
                button.dataset.theme ===
                theme;

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );
        }
    );


    try {

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

    } catch (error) {

        console.error(
            "Theme save error:",
            error
        );
    }
}


/* ================= LOAD THEME ================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );

    setTheme(
        saved || "blue"
    );
}


/* ================= THEME EVENTS ================= */

function initializeThemes() {

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
}
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 3
   SIDEBAR + MODAL + INPUT
============================================================ */


/* ================= SIDEBAR ================= */

function openSidebar() {

    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("active");
    }

    if (body) {
        body.classList.add("sidebar-open");
    }
}


function closeSidebarMenu() {

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
    }

    if (body) {
        body.classList.remove("sidebar-open");
    }
}


function initializeSidebar() {

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openSidebar
        );
    }


    if (closeSidebarButton) {

        closeSidebarButton.addEventListener(
            "click",
            closeSidebarMenu
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebarMenu
        );
    }
}


/* ================= ABOUT MODAL ================= */

function openAboutModal() {

    if (!aboutModal) {
        return;
    }

    aboutModal.classList.remove(
        "hidden"
    );

    aboutModal.classList.add(
        "open"
    );

    aboutModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAboutModal() {

    if (!aboutModal) {
        return;
    }

    aboutModal.classList.remove(
        "open"
    );

    aboutModal.classList.add(
        "hidden"
    );

    aboutModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


function initializeAbout() {

    if (aboutButton) {

        aboutButton.addEventListener(
            "click",
            openAboutModal
        );
    }


    if (closeAbout) {

        closeAbout.addEventListener(
            "click",
            closeAboutModal
        );
    }


    if (aboutModal) {

        aboutModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    aboutModal
                ) {
                    closeAboutModal();
                }
            }
        );
    }
}


/* ================= INPUT ================= */

function updateCharacterCount() {

    if (
        !input ||
        !characterCount
    ) {
        return;
    }

    const length =
        input.value.length;

    characterCount.textContent =
        `${length.toLocaleString()} / 10,000`;

    characterCount.classList.toggle(
        "warning",
        length >= 9500
    );
}


function resizeInput() {

    if (!input) {
        return;
    }

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            180
        ) + "px";
}


/* ================= SEND BUTTON ================= */

function updateSendButton() {

    if (!sendButton) {
        return;
    }

    const hasText =
        input &&
        input.value.trim().length > 0;

    const enabled =
        hasText &&
        !isSending;

    sendButton.disabled =
        !enabled;

    sendButton.classList.toggle(
        "ready",
        enabled
    );

    sendButton.classList.toggle(
        "sending",
        isSending
    );
}


function setSending(state) {

    isSending =
        Boolean(state);

    updateSendButton();
}


/* ================= PLACEHOLDER ================= */

function updatePlaceholder() {

    if (!input) {
        return;
    }

    input.placeholder =
        selectedModel === "openrouter"
            ? "Message Volby Pro..."
            : "Message Volby...";
}


/* ================= INPUT EVENTS ================= */

function initializeInput() {

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            resizeInput();

            updateSendButton();
        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    !isSending &&
                    input.value.trim()
                ) {

                    sendMessage();
                }
            }
        }
    );


    updateCharacterCount();

    resizeInput();

    updatePlaceholder();

    updateSendButton();
}


/* ================= MODEL CLOSE ================= */

document.addEventListener(
    "click",
    event => {

        const selector =
            document.getElementById(
                "volby-model-selector"
            );

        if (
            selector &&
            !selector.contains(
                event.target
            )
        ) {

            closeModelMenu();
        }
    }
);
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 4
   CHAT ENGINE + API
============================================================ */


/* ================= TEXT ESCAPE ================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


/* ================= SHOW / HIDE WELCOME ================= */

function updateWelcomeScreen() {

    if (!welcomeScreen) {
        return;
    }

    const hasMessages =
        messages.length > 0;

    welcomeScreen.style.display =
        hasMessages
            ? "none"
            : "";
}


/* ================= MESSAGE RENDER ================= */

function renderMessage(message) {

    if (!messagesContainer) {
        return null;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${message.role}`;

    wrapper.dataset.messageId =
        message.id || "";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    if (message.role === "user") {

        bubble.textContent =
            message.content;

    } else {

        bubble.innerHTML =
            formatAIMessage(
                message.content
            );
    }


    wrapper.appendChild(
        bubble
    );


    messagesContainer.appendChild(
        wrapper
    );


    return wrapper;
}


/* ================= AI FORMATTING ================= */

function formatAIMessage(text) {

    let html =
        escapeHTML(text);


    /* Code blocks */

    html =
        html.replace(
            /```([\s\S]*?)```/g,
            (
                match,
                code
            ) => {

                return `
                    <pre class="code-block"><code>${code.trim()}</code></pre>
                `;
            }
        );


    /* Bold */

    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* Inline code */

    html =
        html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /* Line breaks */

    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;
}


/* ================= ADD MESSAGE ================= */

function addMessage(
    role,
    content
) {

    const message = {

        id:
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        role:
            role,

        content:
            String(content ?? ""),

        timestamp:
            Date.now()
    };


    messages.push(
        message
    );


    renderMessage(
        message
    );


    updateWelcomeScreen();


    if (messagesContainer) {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }


    return message;
}


/* ================= LOADING MESSAGE ================= */

function createLoadingMessage() {

    if (!messagesContainer) {
        return null;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message assistant loading-message";


    wrapper.innerHTML = `
        <div class="message-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;


    messagesContainer.appendChild(
        wrapper
    );


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;


    return wrapper;
}


/* ================= API ================= */

async function requestAI(
    userMessage
) {

    const payload = {

        message:
            userMessage,

        model:
            selectedModel,

        messages:
            messages.map(
                item => ({
                    role:
                        item.role,

                    content:
                        item.content
                })
            )
    };


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
                    JSON.stringify(
                        payload
                    )
            }
        );


    if (!response.ok) {

        let errorText =
            `Server error (${response.status})`;

        try {

            const data =
                await response.json();

            if (data.detail) {
                errorText =
                    data.detail;
            }

        } catch (_) {
            /* Ignore invalid error JSON */
        }

        throw new Error(
            errorText
        );
    }


    return response.json();
}


/* ================= EXTRACT RESPONSE ================= */

function extractAIResponse(data) {

    if (!data) {
        return "";
    }


    if (
        typeof data ===
        "string"
    ) {
        return data;
    }


    const possibleFields = [
        "response",
        "reply",
        "message",
        "content",
        "answer",
        "text"
    ];


    for (
        const field of possibleFields
    ) {

        if (
            typeof data[field] ===
            "string" &&
            data[field].trim()
        ) {

            return data[field];
        }
    }


    if (
        data.choices &&
        Array.isArray(data.choices) &&
        data.choices[0]
    ) {

        const choice =
            data.choices[0];

        if (
            choice.message &&
            typeof choice.message.content ===
                "string"
        ) {

            return choice.message.content;
        }

        if (
            typeof choice.text ===
            "string"
        ) {

            return choice.text;
        }
    }


    return "";
}


/* ================= SEND MESSAGE ================= */

async function sendMessage() {

    if (
        isSending ||
        !input
    ) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    if (
        text.length >
        MAX_MESSAGE_LENGTH
    ) {

        alert(
            "Your message is too long. Maximum is 10,000 characters."
        );

        return;
    }


    input.value = "";

    updateCharacterCount();

    resizeInput();

    updateSendButton();


    addMessage(
        "user",
        text
    );


    setSending(true);


    const loading =
        createLoadingMessage();


    try {

        const data =
            await requestAI(
                text
            );


        if (loading) {
            loading.remove();
        }


        const reply =
            extractAIResponse(
                data
            );


        if (!reply) {

            throw new Error(
                "Volby returned an empty response."
            );
        }


        addMessage(
            "assistant",
            reply
        );


        saveCurrentChat();


    } catch (error) {

        console.error(
            "[Volby] Chat error:",
            error
        );


        if (loading) {
            loading.remove();
        }


        addMessage(
            "assistant",
            `Sorry, I couldn't connect right now.\n\n${error.message}`
        );

    } finally {

        setSending(false);

        updateSendButton();

        input.focus();
    }
}
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 5/5
   HISTORY + SUGGESTIONS + ACTIONS + INIT
============================================================ */


/* ================= SAVE CHAT ================= */

function saveCurrentChat() {

    if (!messages.length) {
        return;
    }

    if (!currentChatId) {

        currentChatId =
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;
    }


    const firstUserMessage =
        messages.find(
            item =>
                item.role === "user"
        );


    const title =
        firstUserMessage
            ? firstUserMessage.content
                .slice(0, 45)
            : "New Chat";


    const chat = {

        id:
            currentChatId,

        title:
            title,

        messages:
            messages,

        updatedAt:
            Date.now()
    };


    const index =
        chatHistory.findIndex(
            item =>
                item.id ===
                currentChatId
        );


    if (index >= 0) {

        chatHistory[index] =
            chat;

    } else {

        chatHistory.unshift(
            chat
        );
    }


    chatHistory =
        chatHistory
            .sort(
                (a, b) =>
                    b.updatedAt -
                    a.updatedAt
            )
            .slice(
                0,
                MAX_HISTORY
            );


    setStorage(
        HISTORY_STORAGE_KEY,
        chatHistory
    );


    renderHistory();
}


/* ================= RENDER HISTORY ================= */

function renderHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML =
        "";


    if (
        !chatHistory.length
    ) {

        if (emptyHistory) {
            emptyHistory.style.display =
                "block";
        }

        return;
    }


    if (emptyHistory) {
        emptyHistory.style.display =
            "none";
    }


    chatHistory.forEach(
        chat => {

            const button =
                document.createElement("button");

            button.type =
                "button";

            button.className =
                "history-item";

            button.dataset.chatId =
                chat.id;


            button.textContent =
                chat.title ||
                "New Chat";


            if (
                chat.id ===
                currentChatId
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat.id
                    );
                }
            );


            historyList.appendChild(
                button
            );
        }
    );
}


/* ================= LOAD CHAT ================= */

function loadChat(chatId) {

    const chat =
        chatHistory.find(
            item =>
                item.id ===
                chatId
        );


    if (!chat) {
        return;
    }


    currentChatId =
        chat.id;


    messages =
        Array.isArray(
            chat.messages
        )
            ? chat.messages
            : [];


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";

        messages.forEach(
            message => {

                renderMessage(
                    message
                );
            }
        );
    }


    updateWelcomeScreen();

    renderHistory();

    closeSidebarMenu();


    if (messagesContainer) {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }
}


/* ================= NEW CHAT ================= */

function startNewChat() {

    messages =
        [];

    currentChatId =
        null;


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";
    }


    if (
        messagesContainer &&
        welcomeScreen
    ) {

        messagesContainer.appendChild(
            welcomeScreen
        );
    }


    if (welcomeScreen) {

        welcomeScreen.style.display =
            "";
    }


    renderHistory();

    closeSidebarMenu();


    if (input) {

        input.value =
            "";

        updateCharacterCount();

        resizeInput();

        updateSendButton();

        input.focus();
    }
}


/* ================= NEW CHAT BUTTON ================= */

function initializeNewChat() {

    if (!newChatButton) {
        return;
    }


    newChatButton.addEventListener(
        "click",
        startNewChat
    );
}


/* ================= SUGGESTIONS ================= */

function initializeSuggestions() {

    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    const prompt =
                        suggestion.dataset.prompt;

                    if (!prompt) {
                        return;
                    }


                    if (input) {

                        input.value =
                            prompt;

                        updateCharacterCount();

                        resizeInput();

                        updateSendButton();

                        input.focus();
                    }
                }
            );
        }
    );
}


/* ================= SEND BUTTON ================= */

function initializeSendButton() {

    if (!sendButton) {
        return;
    }


    sendButton.addEventListener(
        "click",
        () => {

            if (
                input &&
                input.value.trim() &&
                !isSending
            ) {

                sendMessage();
            }
        }
    );
}


/* ================= KEYBOARD ESC ================= */

function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeSidebarMenu();

            closeAboutModal();

            closeModelMenu();
        }
    );
}


/* ================= AUTH ================= */

async function initializeAuth() {

    if (
        !supabaseClient
    ) {
        return;
    }


    try {

        const result =
            await supabaseClient.auth
                .getUser();


        currentUser =
            result.data?.user ||
            null;


    } catch (error) {

        console.error(
            "[Volby] Auth error:",
            error
        );

        currentUser =
            null;
    }
}


/* ================= INITIALIZATION ================= */

async function initializeVolby() {

    /*
       This guard is important.
       It prevents the entire UI from being
       initialized twice.
    */

    if (initialized) {
        return;
    }

    initialized =
        true;


    console.log(
        "[Volby] Initializing..."
    );


    initializeSupabase();

    loadSavedState();

    loadSelectedModel();

    loadTheme();


    initializeThemes();

    createModelSelector();

    updateModelSelector();


    initializeSidebar();

    initializeAbout();

    initializeInput();

    initializeNewChat();

    initializeSendButton();

    initializeSuggestions();

    initializeEscapeKey();


    renderHistory();

    updateWelcomeScreen();


    await initializeAuth();


    console.log(
        "[Volby] Ready."
    );
}


/* ================= START APP ================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVolby,
        {
            once: true
        }
    );

} else {

    initializeVolby();
}


})();
