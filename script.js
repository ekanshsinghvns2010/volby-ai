/* ============================================================
   VOLBY AI
   script.js — CHUNK 1/3
============================================================ */

"use strict";


/* ================= CONFIG ================= */

const CONFIG = {

    API_URL:
        "https://volby-ai-backend.onrender.com",

    HISTORY_KEY:
        "volby_chat_history",

    THEME_KEY:
        "volby_theme",

    MODEL_KEY:
        "volby_model"

};


/* ================= MODELS ================= */

const MODELS = [

    {
        id: "groq",
        name: "Groq",
        description: "Groq Compound"
    },

    {
        id: "openrouter",
        name: "OpenRouter",
        description: "GPT-OSS 120B"
    }

];


/* ================= STATE ================= */

const state = {

    conversations: [],

    currentConversation: null,

    selectedModel:
        localStorage.getItem(
            CONFIG.MODEL_KEY
        ) || "groq",

    generating: false,

    sidebarOpen: false

};


/* ================= DOM ================= */

const DOM = {};


function cacheDOM() {

    DOM.sidebar =
        document.getElementById(
            "sidebar"
        );

    DOM.overlay =
        document.getElementById(
            "sidebar-overlay"
        );

    DOM.menu =
        document.getElementById(
            "menu-button"
        );

    DOM.closeSidebar =
        document.getElementById(
            "close-sidebar"
        );

    DOM.newChat =
        document.getElementById(
            "new-chat"
        );

    DOM.topNewChat =
        document.getElementById(
            "top-new-chat"
        );

    DOM.history =
        document.getElementById(
            "history-list"
        );

    DOM.emptyHistory =
        document.getElementById(
            "empty-history"
        );

    DOM.welcome =
        document.getElementById(
            "welcome"
        );

    DOM.suggestions =
        document.getElementById(
            "suggestions"
        );

    DOM.chat =
        document.getElementById(
            "chat"
        );

    DOM.messages =
        document.getElementById(
            "messages"
        );

    DOM.input =
        document.getElementById(
            "user-input"
        );

    DOM.send =
        document.getElementById(
            "send-button"
        );

    DOM.controls =
        document.getElementById(
            "input-controls"
        );

    DOM.count =
        document.getElementById(
            "character-count"
        );

    DOM.aboutButton =
        document.getElementById(
            "about-button"
        );

    DOM.aboutModal =
        document.getElementById(
            "about-modal"
        );

    DOM.closeAbout =
        document.getElementById(
            "close-about"
        );

}


/* ================= START ================= */

function init() {

    cacheDOM();

    loadTheme();

    loadHistory();

    createModelSelector();

    bindEvents();

    renderHistory();

    newChat();

    updateInput();

}


/* ================= THEME ================= */

const THEMES = [

    "blue",
    "midnight",
    "snow",
    "purple",
    "ocean",
    "sunset"

];


function loadTheme() {

    const saved =
        localStorage.getItem(
            CONFIG.THEME_KEY
        );

    const theme =
        THEMES.includes(saved)
            ? saved
            : "blue";

    document.body.dataset.theme =
        theme;

}


function setTheme(theme) {

    if (
        !THEMES.includes(theme)
    ) {
        return;
    }

    document.body.dataset.theme =
        theme;

    localStorage.setItem(
        CONFIG.THEME_KEY,
        theme
    );

}


/* ================= SIDEBAR ================= */

function openSidebar() {

    state.sidebarOpen = true;

    DOM.sidebar?.classList.add(
        "open"
    );

    DOM.overlay?.classList.add(
        "active"
    );

}


function closeSidebar() {

    state.sidebarOpen = false;

    DOM.sidebar?.classList.remove(
        "open"
    );

    DOM.overlay?.classList.remove(
        "active"
    );

}


/* ================= ABOUT ================= */

function openAbout() {

    DOM.aboutModal?.classList.add(
        "open"
    );

    DOM.aboutModal?.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeAbout() {

    DOM.aboutModal?.classList.remove(
        "open"
    );

    DOM.aboutModal?.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ================= EVENTS ================= */

function bindEvents() {

    DOM.menu?.addEventListener(
        "click",
        openSidebar
    );

    DOM.closeSidebar?.addEventListener(
        "click",
        closeSidebar
    );

    DOM.overlay?.addEventListener(
        "click",
        closeSidebar
    );


    DOM.aboutButton?.addEventListener(
        "click",
        openAbout
    );

    DOM.closeAbout?.addEventListener(
        "click",
        closeAbout
    );


    DOM.aboutModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                DOM.aboutModal
            ) {

                closeAbout();

            }

        }
    );


    DOM.newChat?.addEventListener(
        "click",
        newChat
    );

    DOM.topNewChat?.addEventListener(
        "click",
        newChat
    );


    DOM.input?.addEventListener(
        "input",
        updateInput
    );


    DOM.input?.addEventListener(
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


    DOM.send?.addEventListener(
        "click",
        sendMessage
    );


    DOM.suggestions
        ?.querySelectorAll(
            ".suggestion"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const prompt =
                        button.dataset.prompt;

                    if (!prompt) {
                        return;
                    }

                    DOM.input.value =
                        prompt;

                    updateInput();

                    sendMessage();

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeSidebar();

                closeAbout();

            }

        }
    );

}


/* ================= INPUT ================= */

function updateInput() {

    if (!DOM.input) {
        return;
    }

    const length =
        DOM.input.value.length;


    if (DOM.count) {

        DOM.count.textContent =
            `${length.toLocaleString()} / 10,000`;

    }


    DOM.send.disabled =
        !DOM.input.value.trim() ||
        state.generating;


    DOM.input.style.height =
        "auto";


    DOM.input.style.height =
        Math.min(
            DOM.input.scrollHeight,
            180
        ) + "px";

}
/* ============================================================
   CHUNK 2/3
   MODEL + HISTORY + CHAT RENDERING
============================================================ */


/* ================= MODEL SELECTOR ================= */

function createModelSelector() {

    if (!DOM.controls) {
        return;
    }


    const old =
        document.getElementById(
            "model-selector"
        );

    if (old) {
        old.remove();
    }


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.id =
        "model-selector";

    wrapper.className =
        "model-selector";


    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "model-button";

    button.id =
        "model-button";


    const menu =
        document.createElement(
            "div"
        );

    menu.className =
        "model-menu";

    menu.id =
        "model-menu";


    MODELS.forEach(model => {

        const option =
            document.createElement(
                "button"
            );

        option.type =
            "button";

        option.className =
            "model-option";

        option.dataset.model =
            model.id;


        option.innerHTML = `

            <span class="model-option-icon">
                ✦
            </span>

            <span class="model-option-info">

                <span class="model-option-name">
                    ${escapeHTML(model.name)}
                </span>

                <span class="model-option-description">
                    ${escapeHTML(model.description)}
                </span>

            </span>

            <span class="model-option-check"></span>

        `;


        option.addEventListener(
            "click",
            () => {

                state.selectedModel =
                    model.id;

                localStorage.setItem(
                    CONFIG.MODEL_KEY,
                    model.id
                );

                updateModelSelector();

                menu.classList.remove(
                    "open"
                );

            }
        );


        menu.appendChild(
            option
        );

    });


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            menu.classList.toggle(
                "open"
            );

        }
    );


    wrapper.appendChild(
        button
    );

    wrapper.appendChild(
        menu
    );


    DOM.controls.prepend(
        wrapper
    );


    updateModelSelector();


    document.addEventListener(
        "click",
        event => {

            if (
                !wrapper.contains(
                    event.target
                )
            ) {

                menu.classList.remove(
                    "open"
                );

            }

        }
    );

}


function updateModelSelector() {

    const button =
        document.getElementById(
            "model-button"
        );


    if (!button) {
        return;
    }


    const model =
        MODELS.find(
            item =>
                item.id ===
                state.selectedModel
        ) || MODELS[0];


    button.innerHTML = `

        <span>✦</span>

        <span>
            ${escapeHTML(model.name)}
        </span>

        <span>⌄</span>

    `;


    document
        .querySelectorAll(
            ".model-option"
        )
        .forEach(option => {

            const active =
                option.dataset.model ===
                state.selectedModel;


            option.classList.toggle(
                "active",
                active
            );


            const check =
                option.querySelector(
                    ".model-option-check"
                );


            if (check) {

                check.textContent =
                    active
                        ? "✓"
                        : "";

            }

        });

}


/* ================= HISTORY ================= */

function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                CONFIG.HISTORY_KEY
            );


        state.conversations =
            saved
                ? JSON.parse(saved)
                : [];


        if (
            !Array.isArray(
                state.conversations
            )
        ) {

            state.conversations = [];

        }

    } catch {

        state.conversations = [];

    }

}


function saveHistory() {

    localStorage.setItem(

        CONFIG.HISTORY_KEY,

        JSON.stringify(
            state.conversations
        )

    );

}


/* ================= NEW CHAT ================= */

function newChat() {

    state.currentConversation = {

        id:
            Date.now().toString(),

        title:
            "New chat",

        messages: [],

        updatedAt:
            Date.now()

    };


    DOM.messages.innerHTML =
        "";

    DOM.welcome.style.display =
        "flex";


    closeSidebar();

    renderHistory();

    updateInput();

}


/* ================= SAVE CURRENT ================= */

function saveCurrentConversation() {

    const current =
        state.currentConversation;


    if (!current) {
        return;
    }


    const index =
        state.conversations.findIndex(
            item =>
                item.id ===
                current.id
        );


    if (index >= 0) {

        state.conversations[index] =
            current;

    } else {

        state.conversations.unshift(
            current
        );

    }


    state.conversations =
        state.conversations.slice(
            0,
            50
        );


    saveHistory();

    renderHistory();

}


/* ================= HISTORY UI ================= */

function renderHistory() {

    if (!DOM.history) {
        return;
    }


    DOM.history.innerHTML =
        "";


    const chats =
        state.conversations.filter(
            chat =>
                chat.messages &&
                chat.messages.length
        );


    if (!chats.length) {

        DOM.emptyHistory.style.display =
            "block";

        return;

    }


    DOM.emptyHistory.style.display =
        "none";


    chats.forEach(chat => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";

        button.className =
            "history-item";


        if (
            state.currentConversation &&
            chat.id ===
                state.currentConversation.id
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            chat.title ||
            "New chat";


        button.addEventListener(
            "click",
            () => {

                openConversation(
                    chat.id
                );

            }
        );


        DOM.history.appendChild(
            button
        );

    });

}


/* ================= OPEN CONVERSATION ================= */

function openConversation(id) {

    const conversation =
        state.conversations.find(
            chat =>
                chat.id === id
        );


    if (!conversation) {
        return;
    }


    state.currentConversation =
        conversation;


    DOM.messages.innerHTML =
        "";


    DOM.welcome.style.display =
        conversation.messages.length
            ? "none"
            : "flex";


    conversation.messages
        .forEach(message => {

            renderMessage(
                message.role,
                message.content
            );

        });


    renderHistory();

    closeSidebar();

    scrollToBottom();

}


/* ================= ADD MESSAGE ================= */

function addMessage(
    role,
    content
) {

    if (
        !state.currentConversation
    ) {

        newChat();

    }


    state.currentConversation.messages
        .push({

            role:
                role,

            content:
                content,

            timestamp:
                Date.now()

        });


    state.currentConversation.updatedAt =
        Date.now();


    if (
        role === "user" &&
        state.currentConversation.title ===
            "New chat"
    ) {

        const title =
            content.trim();


        state.currentConversation.title =
            title.length > 40
                ? title.slice(0, 40) + "…"
                : title;

    }


    saveCurrentConversation();

}


/* ================= MESSAGE RENDER ================= */

function renderMessage(
    role,
    content
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        `message ${role}`;


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message-content";


    const label =
        document.createElement(
            "div"
        );

    label.className =
        "message-role";

    label.textContent =
        role === "user"
            ? "You"
            : "Volby";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble";


    bubble.innerHTML =
        formatMessage(
            content
        );


    wrapper.appendChild(
        label
    );

    wrapper.appendChild(
        bubble
    );


    if (
        role === "assistant"
    ) {

        wrapper.appendChild(
            createActions(
                content
            )
        );

    }


    row.appendChild(
        wrapper
    );


    DOM.messages.appendChild(
        row
    );


    return row;

}


/* ================= FORMAT ================= */

function formatMessage(text) {

    let value =
        escapeHTML(
            text || ""
        );


    value =
        value.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    value =
        value.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    value =
        value.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    value =
        value.replace(
            /\n/g,
            "<br>"
        );


    return value;

}


/* ================= ACTIONS ================= */

function createActions(
    content
) {

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "message-actions";


    const copy =
        document.createElement(
            "button"
        );

    copy.type =
        "button";

    copy.className =
        "message-action";

    copy.textContent =
        "⧉";

    copy.title =
        "Copy";


    copy.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard
                    .writeText(
                        content
                    );

                copy.textContent =
                    "✓";


                setTimeout(
                    () => {

                        copy.textContent =
                            "⧉";

                    },
                    1000
                );

            } catch {

                alert(
                    "Copy is not available."
                );

            }

        }
    );


    const regenerate =
        document.createElement(
            "button"
        );

    regenerate.type =
        "button";

    regenerate.className =
        "message-action";

    regenerate.textContent =
        "↻";

    regenerate.title =
        "Regenerate";


    regenerate.addEventListener(
        "click",
        regenerateResponse
    );


    actions.appendChild(
        copy
    );

    actions.appendChild(
        regenerate
    );


    return actions;

}


/* ================= HELPERS ================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function scrollToBottom() {

    requestAnimationFrame(
        () => {

            DOM.chat.scrollTop =
                DOM.chat.scrollHeight;

        }
    );

}
/* ============================================================
   VOLBY AI
   script.js — CHUNK 3/3
   API + SEND + TYPING + REGENERATE
============================================================ */


/* ================= TYPING INDICATOR ================= */

function showTyping() {

    removeTyping();


    const row =
        document.createElement(
            "div"
        );

    row.id =
        "typing-message";

    row.className =
        "message assistant";


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "message-content";


    const label =
        document.createElement(
            "div"
        );

    label.className =
        "message-role";

    label.textContent =
        "Volby";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble";


    bubble.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;


    wrapper.appendChild(
        label
    );

    wrapper.appendChild(
        bubble
    );


    row.appendChild(
        wrapper
    );


    DOM.messages.appendChild(
        row
    );


    scrollToBottom();

}


function removeTyping() {

    document
        .getElementById(
            "typing-message"
        )
        ?.remove();

}


/* ================= SEND ================= */

async function sendMessage() {

    if (
        state.generating
    ) {
        return;
    }


    const text =
        DOM.input?.value.trim();


    if (!text) {
        return;
    }


    if (
        !state.currentConversation
    ) {

        newChat();

    }


    /* Hide welcome */

    DOM.welcome.style.display =
        "none";


    /* Add user message */

    addMessage(
        "user",
        text
    );


    renderMessage(
        "user",
        text
    );


    /* Clear input */

    DOM.input.value =
        "";

    updateInput();

    scrollToBottom();


    /* Start request */

    state.generating =
        true;

    updateInput();

    showTyping();


    try {

        /*
           IMPORTANT:
           Your real backend expects:

           {
               messages: [...],
               model: "groq"
           }
        */


        const apiMessages =
            state.currentConversation
                .messages
                .map(message => ({

                    role:
                        message.role,

                    content:
                        message.content

                }));


        const response =
            await fetch(
                CONFIG.API_URL + "/chat",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            messages:
                                apiMessages,

                            model:
                                state.selectedModel

                        })

                }
            );


        /*
           Read response even when
           HTTP status is an error.
        */

        const data =
            await response.json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            const detail =
                data.detail ||
                `Server error ${response.status}`;


            throw new Error(
                detail
            );

        }


        const answer =
            data.response;


        if (
            typeof answer !==
            "string" ||
            !answer.trim()
        ) {

            throw new Error(
                "Volby returned an empty response."
            );

        }


        removeTyping();


        addMessage(
            "assistant",
            answer
        );


        renderMessage(
            "assistant",
            answer
        );


        scrollToBottom();


    } catch (error) {

        console.error(
            "VOLBY API ERROR:",
            error
        );


        removeTyping();


        const message =
            `Connection error: ${error.message}`;


        addMessage(
            "assistant",
            message
        );


        renderMessage(
            "assistant",
            message
        );


        scrollToBottom();

    } finally {

        state.generating =
            false;

        updateInput();

    }

}


/* ================= REGENERATE ================= */

async function regenerateResponse() {

    if (
        state.generating
    ) {
        return;
    }


    if (
        !state.currentConversation
    ) {
        return;
    }


    const messages =
        state.currentConversation.messages;


    /*
       Find last assistant response.
    */

    let assistantIndex =
        -1;


    for (
        let i = messages.length - 1;
        i >= 0;
        i--
    ) {

        if (
            messages[i].role ===
            "assistant"
        ) {

            assistantIndex =
                i;

            break;

        }

    }


    if (
        assistantIndex === -1
    ) {
        return;
    }


    /*
       The message immediately before
       the assistant should be the user.
    */

    const userMessage =
        messages[
            assistantIndex - 1
        ];


    if (
        !userMessage ||
        userMessage.role !==
            "user"
    ) {

        return;

    }


    /*
       Remove old assistant response.
    */

    messages.splice(
        assistantIndex,
        1
    );


    saveCurrentConversation();


    /*
       Re-render conversation.
    */

    DOM.messages.innerHTML =
        "";


    messages.forEach(
        message => {

            renderMessage(
                message.role,
                message.content
            );

        }
    );


    /*
       Send the same user message again.
    */

    await regenerateFromHistory(
        userMessage.content
    );

}


/* ================= REGENERATE REQUEST ================= */

async function regenerateFromHistory(
    userText
) {

    state.generating =
        true;

    updateInput();

    showTyping();


    try {

        const apiMessages =
            state.currentConversation
                .messages
                .map(message => ({

                    role:
                        message.role,

                    content:
                        message.content

                }));


        const response =
            await fetch(
                CONFIG.API_URL + "/chat",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            messages:
                                apiMessages,

                            model:
                                state.selectedModel

                        })

                }
            );


        const data =
            await response.json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            throw new Error(
                data.detail ||
                `Server error ${response.status}`
            );

        }


        const answer =
            data.response;


        if (
            !answer
        ) {

            throw new Error(
                "Empty response from Volby."
            );

        }


        removeTyping();


        addMessage(
            "assistant",
            answer
        );


        renderMessage(
            "assistant",
            answer
        );


        scrollToBottom();


    } catch (error) {

        console.error(
            "REGENERATE ERROR:",
            error
        );


        removeTyping();


        const errorText =
            `Connection error: ${error.message}`;


        addMessage(
            "assistant",
            errorText
        );


        renderMessage(
            "assistant",
            errorText
        );

    } finally {

        state.generating =
            false;

        updateInput();

    }

}


/* ================= FINAL STARTUP ================= */

/*
   Only ONE initialization.
   This is important because the previous
   script had multiple initialization blocks.
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

} else {

    init();

}