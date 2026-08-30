/* ============================================================
   VOLBY AI — NEW FRONTEND
   script.js — CHUNK 1/6
============================================================ */


/* ================= CONFIG ================= */

const VOLBY_CONFIG = {

    /* Your existing Volby backend */
    API_URL:
        "https://volby-ai-backend.onrender.com",

    /* Default model */
    DEFAULT_MODEL:
        "volby",

    /* Storage keys */
    STORAGE_HISTORY:
        "volby_chat_history",

    STORAGE_THEME:
        "volby_theme",

    STORAGE_MODEL:
        "volby_model"

};


/* ================= STATE ================= */

const state = {

    conversations: [],

    currentConversation: null,

    selectedModel:
        localStorage.getItem(
            VOLBY_CONFIG.STORAGE_MODEL
        ) ||
        VOLBY_CONFIG.DEFAULT_MODEL,

    isGenerating: false,

    sidebarOpen: false,

    modelMenuOpen: false

};


/* ================= DOM ================= */

const DOM = {};

function cacheDOM() {

    DOM.app =
        document.getElementById("app");

    DOM.sidebar =
        document.getElementById("sidebar");

    DOM.overlay =
        document.getElementById(
            "sidebar-overlay"
        );

    DOM.menuButton =
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

    DOM.historyList =
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

    DOM.inputControls =
        document.getElementById(
            "input-controls"
        );

    DOM.characterCount =
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


/* ================= INITIALIZATION ================= */

function initVolby() {

    cacheDOM();

    loadTheme();

    loadModel();

    loadHistory();

    bindEvents();

    createModelSelector();

    startNewConversation();

    updateCharacterCount();

    updateSendButton();

}


/* ================= START ================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initVolby,
        { once: true }
    );

} else {

    initVolby();

}
/* ============================================================
   CHUNK 2/6
   THEMES + SIDEBAR + ABOUT MODAL
============================================================ */


/* ================= THEMES ================= */

const THEMES = [
    "blue",
    "midnight",
    "snow",
    "purple",
    "ocean",
    "sunset"
];


function loadTheme() {

    let theme =
        localStorage.getItem(
            VOLBY_CONFIG.STORAGE_THEME
        );

    if (!THEMES.includes(theme)) {
        theme = "blue";
    }

    document.body.dataset.theme =
        theme;
}


function setTheme(theme) {

    if (!THEMES.includes(theme)) {
        return;
    }

    document.body.dataset.theme =
        theme;

    localStorage.setItem(
        VOLBY_CONFIG.STORAGE_THEME,
        theme
    );
}


/* ================= THEME BUTTONS ================= */

/*
   Creates the six theme controls in the
   sidebar without requiring extra HTML.
*/

function createThemeControls() {

    const footer =
        document.querySelector(
            ".sidebar-bottom"
        );

    if (!footer) {
        return;
    }

    if (
        document.getElementById(
            "theme-controls"
        )
    ) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "theme-controls";

    wrapper.style.display =
        "flex";

    wrapper.style.gap =
        "7px";

    wrapper.style.padding =
        "0 4px 10px";

    THEMES.forEach(theme => {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.dataset.theme =
            theme;

        button.title =
            theme.charAt(0).toUpperCase() +
            theme.slice(1);

        button.style.width =
            "24px";

        button.style.height =
            "24px";

        button.style.borderRadius =
            "50%";

        button.style.border =
            "2px solid transparent";

        button.style.cursor =
            "pointer";

        button.style.background =
            "var(--accent)";

        button.addEventListener(
            "click",
            () => setTheme(theme)
        );

        wrapper.appendChild(button);

    });

    footer.prepend(wrapper);
}


/* ================= SIDEBAR ================= */

function openSidebar() {

    if (!DOM.sidebar) {
        return;
    }

    state.sidebarOpen =
        true;

    DOM.sidebar.classList.add(
        "open"
    );

    DOM.overlay.classList.add(
        "active"
    );

}


function closeSidebar() {

    if (!DOM.sidebar) {
        return;
    }

    state.sidebarOpen =
        false;

    DOM.sidebar.classList.remove(
        "open"
    );

    DOM.overlay.classList.remove(
        "active"
    );

}


/* ================= ABOUT ================= */

function openAbout() {

    if (!DOM.aboutModal) {
        return;
    }

    DOM.aboutModal.classList.add(
        "open"
    );

    DOM.aboutModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeAbout() {

    if (!DOM.aboutModal) {
        return;
    }

    DOM.aboutModal.classList.remove(
        "open"
    );

    DOM.aboutModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ================= EVENT BINDING ================= */

function bindEvents() {

    DOM.menuButton?.addEventListener(
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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeSidebar();
                closeAbout();

            }

        }
    );


    createThemeControls();

}
/* ============================================================
   CHUNK 3/6
   MODEL SELECTOR + INPUT CONTROLS
============================================================ */


/* ================= MODELS ================= */

const MODELS = [
    {
        id: "volby",
        name: "Volby",
        description: "Volby AI"
    },
    {
        id: "gpt",
        name: "GPT",
        description: "GPT model"
    },
    {
        id: "claude",
        name: "Claude",
        description: "Claude model"
    },
    {
        id: "gemini",
        name: "Gemini",
        description: "Gemini model"
    }
];


/* ================= LOAD MODEL ================= */

function loadModel() {

    const saved =
        localStorage.getItem(
            VOLBY_CONFIG.STORAGE_MODEL
        );

    if (
        saved &&
        MODELS.some(
            model => model.id === saved
        )
    ) {
        state.selectedModel = saved;
    }

}


/* ================= SAVE MODEL ================= */

function selectModel(modelId) {

    const model =
        MODELS.find(
            item => item.id === modelId
        );

    if (!model) {
        return;
    }

    state.selectedModel =
        model.id;

    localStorage.setItem(
        VOLBY_CONFIG.STORAGE_MODEL,
        model.id
    );

    updateModelButton();

    closeModelMenu();
}


/* ================= MODEL SELECTOR ================= */

function createModelSelector() {

    if (!DOM.inputControls) {
        return;
    }

    if (
        document.getElementById(
            "model-selector"
        )
    ) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.id =
        "model-selector";

    wrapper.className =
        "model-selector";


    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "model-button";

    button.id =
        "model-button";


    const menu =
        document.createElement("div");

    menu.className =
        "model-menu";

    menu.id =
        "model-menu";


    MODELS.forEach(model => {

        const option =
            document.createElement("button");

        option.type =
            "button";

        option.className =
            "model-option";

        option.dataset.model =
            model.id;


        option.innerHTML = `
            <span class="model-option-icon">✦</span>

            <span class="model-option-info">
                <span class="model-option-name">
                    ${escapeHTML(model.name)}
                </span>

                <span class="model-option-description">
                    ${escapeHTML(model.description)}
                </span>
            </span>

            <span
                class="model-option-check"
            ></span>
        `;


        option.addEventListener(
            "click",
            () => selectModel(model.id)
        );


        menu.appendChild(option);

    });


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleModelMenu();

        }
    );


    wrapper.appendChild(button);

    wrapper.appendChild(menu);


    DOM.inputControls.prepend(
        wrapper
    );


    updateModelButton();


    document.addEventListener(
        "click",
        event => {

            if (
                !wrapper.contains(
                    event.target
                )
            ) {
                closeModelMenu();
            }

        }
    );

}


/* ================= MODEL BUTTON ================= */

function updateModelButton() {

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
        ) ||
        MODELS[0];


    button.innerHTML = `
        <span>✦</span>
        <span>${escapeHTML(model.name)}</span>
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
                    active ? "✓" : "";
            }

        });

}


/* ================= MODEL MENU ================= */

function toggleModelMenu() {

    const menu =
        document.getElementById(
            "model-menu"
        );

    if (!menu) {
        return;
    }

    state.modelMenuOpen =
        !state.modelMenuOpen;

    menu.classList.toggle(
        "open",
        state.modelMenuOpen
    );

}


function closeModelMenu() {

    const menu =
        document.getElementById(
            "model-menu"
        );

    if (!menu) {
        return;
    }

    state.modelMenuOpen =
        false;

    menu.classList.remove(
        "open"
    );

}


/* ================= INPUT ================= */

function updateCharacterCount() {

    if (!DOM.input) {
        return;
    }

    const length =
        DOM.input.value.length;

    if (DOM.characterCount) {

        DOM.characterCount.textContent =
            `${length.toLocaleString()} / 10,000`;

    }

}


function updateSendButton() {

    if (!DOM.send || !DOM.input) {
        return;
    }

    const hasText =
        DOM.input.value.trim().length > 0;

    DOM.send.disabled =
        !hasText ||
        state.isGenerating;

}


function autoResizeInput() {

    if (!DOM.input) {
        return;
    }

    DOM.input.style.height =
        "auto";

    const height =
        Math.min(
            DOM.input.scrollHeight,
            180
        );

    DOM.input.style.height =
        `${height}px`;

}


/* ================= INPUT EVENTS ================= */

function bindInputEvents() {

    if (!DOM.input) {
        return;
    }


    DOM.input.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            updateSendButton();

            autoResizeInput();

        }
    );


    DOM.input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    !DOM.send.disabled
                ) {
                    sendMessage();
                }

            }

        }
    );


    DOM.send?.addEventListener(
        "click",
        sendMessage
    );

}


/* ================= ESCAPE HTML ================= */

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
/* ============================================================
   CHUNK 4/6
   CONVERSATIONS + HISTORY + NEW CHAT + SUGGESTIONS
============================================================ */


/* ================= ID ================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


/* ================= NEW CONVERSATION ================= */

function startNewConversation() {

    state.currentConversation = {

        id: createId(),

        title: "New chat",

        messages: [],

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    DOM.messages.innerHTML = "";

    DOM.welcome.style.display =
        "flex";

    closeSidebar();

    updateHistoryUI();

    updateSendButton();

}


/* ================= ADD MESSAGE ================= */

function addMessage(
    role,
    content
) {

    if (
        !state.currentConversation
    ) {
        startNewConversation();
    }


    state.currentConversation.messages.push({

        role,

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

        const clean =
            content.trim();

        state.currentConversation.title =
            clean.length > 38
                ? clean.slice(0, 38) + "…"
                : clean;

    }


    saveCurrentConversation();

}


/* ================= SAVE ================= */

function saveCurrentConversation() {

    if (
        !state.currentConversation
    ) {
        return;
    }


    const index =
        state.conversations.findIndex(
            item =>
                item.id ===
                state.currentConversation.id
        );


    if (index === -1) {

        state.conversations.unshift(
            state.currentConversation
        );

    } else {

        state.conversations[index] =
            state.currentConversation;

    }


    state.conversations =
        state.conversations
            .slice(0, 50);


    localStorage.setItem(

        VOLBY_CONFIG.STORAGE_HISTORY,

        JSON.stringify(
            state.conversations
        )

    );


    updateHistoryUI();

}


/* ================= LOAD HISTORY ================= */

function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                VOLBY_CONFIG.STORAGE_HISTORY
            );


        if (!saved) {
            state.conversations = [];
            return;
        }


        const parsed =
            JSON.parse(saved);


        if (
            Array.isArray(parsed)
        ) {

            state.conversations =
                parsed;

        } else {

            state.conversations =
                [];

        }

    } catch (error) {

        console.error(
            "Could not load chat history:",
            error
        );

        state.conversations = [];

    }

}


/* ================= HISTORY UI ================= */

function updateHistoryUI() {

    if (
        !DOM.historyList ||
        !DOM.emptyHistory
    ) {
        return;
    }


    DOM.historyList.innerHTML = "";


    if (
        state.conversations.length === 0
    ) {

        DOM.emptyHistory.style.display =
            "block";

        return;

    }


    DOM.emptyHistory.style.display =
        "none";


    state.conversations
        .forEach(conversation => {

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
                conversation.id ===
                    state.currentConversation.id
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.textContent =
                conversation.title ||
                "New chat";


            button.addEventListener(
                "click",
                () => {

                    openConversation(
                        conversation.id
                    );

                }
            );


            DOM.historyList.appendChild(
                button
            );

        });

}


/* ================= OPEN CHAT ================= */

function openConversation(id) {

    const conversation =
        state.conversations.find(
            item =>
                item.id === id
        );


    if (!conversation) {
        return;
    }


    state.currentConversation =
        conversation;


    DOM.messages.innerHTML = "";


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


    updateHistoryUI();

    closeSidebar();

    scrollToBottom();

}


/* ================= DELETE EMPTY CHAT ================= */

function removeEmptyCurrentChat() {

    if (
        !state.currentConversation
    ) {
        return;
    }


    if (
        state.currentConversation.messages
            .length > 0
    ) {
        return;
    }


    state.conversations =
        state.conversations.filter(
            item =>
                item.id !==
                state.currentConversation.id
        );


    localStorage.setItem(

        VOLBY_CONFIG.STORAGE_HISTORY,

        JSON.stringify(
            state.conversations
        )

    );

}


/* ================= SUGGESTIONS ================= */

function bindSuggestions() {

    if (!DOM.suggestions) {
        return;
    }


    DOM.suggestions
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const prompt =
                        button.dataset.prompt ||
                        "";

                    if (!prompt) {
                        return;
                    }


                    DOM.input.value =
                        prompt;


                    updateCharacterCount();

                    autoResizeInput();

                    updateSendButton();

                    sendMessage();

                }
            );

        });

}


/* ================= NEW CHAT EVENTS ================= */

function bindNewChatEvents() {

    DOM.newChat?.addEventListener(
        "click",
        startNewConversation
    );


    DOM.topNewChat?.addEventListener(
        "click",
        startNewConversation
    );

}
/* ============================================================
   CHUNK 5/6
   MESSAGE RENDERING + TYPING + ACTIONS
============================================================ */


/* ================= RENDER MESSAGE ================= */

function renderMessage(
    role,
    content
) {

    const row =
        document.createElement("div");

    row.className =
        `message ${role}`;


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message-content";


    const roleLabel =
        document.createElement("div");

    roleLabel.className =
        "message-role";


    roleLabel.textContent =
        role === "user"
            ? "You"
            : "Volby";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    bubble.innerHTML =
        formatMessage(content);


    wrapper.appendChild(
        roleLabel
    );

    wrapper.appendChild(
        bubble
    );


    if (
        role === "assistant"
    ) {

        const actions =
            createMessageActions(
                content
            );

        wrapper.appendChild(
            actions
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


/* ================= FORMAT MESSAGE ================= */

function formatMessage(content) {

    if (
        content === null ||
        content === undefined
    ) {
        return "";
    }


    let text =
        String(content);


    const codeBlocks = [];


    /*
       Temporarily protect fenced code.
    */

    text =
        text.replace(
            /```([\w+-]*)\n?([\s\S]*?)```/g,
            (
                match,
                language,
                code
            ) => {

                const index =
                    codeBlocks.length;


                codeBlocks.push({

                    language:
                        language || "",

                    code:
                        code.trim()

                });


                return `@@CODE_${index}@@`;

            }
        );


    text =
        escapeHTML(text);


    /*
       Basic markdown-like formatting.
    */

    text =
        text.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );


    text =
        text.replace(
            /`([^`\n]+)`/g,
            "<code>$1</code>"
        );


    text =
        text.replace(
            /\n/g,
            "<br>"
        );


    /*
       Restore code blocks.
    */

    codeBlocks.forEach(
        (block, index) => {

            const language =
                escapeHTML(
                    block.language
                );


            const code =
                escapeHTML(
                    block.code
                );


            const html = `
                <pre>
                    <code
                        data-language="${language}"
                    >${code}</code>
                </pre>
            `;


            text =
                text.replace(
                    `@@CODE_${index}@@`,
                    html
                );

        }
    );


    return text;

}


/* ================= MESSAGE ACTIONS ================= */

function createMessageActions(
    content
) {

    const actions =
        document.createElement("div");

    actions.className =
        "message-actions";


    const copy =
        document.createElement("button");

    copy.type =
        "button";

    copy.className =
        "message-action";

    copy.title =
        "Copy";

    copy.textContent =
        "⧉";


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
                    1200
                );

            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );


    const regenerate =
        document.createElement("button");

    regenerate.type =
        "button";

    regenerate.className =
        "message-action";

    regenerate.title =
        "Regenerate";

    regenerate.textContent =
        "↻";


    regenerate.addEventListener(
        "click",
        () => {

            regenerateLastResponse();

        }
    );


    actions.appendChild(
        copy
    );

    actions.appendChild(
        regenerate
    );


    return actions;

}


/* ================= TYPING ================= */

function showTyping() {

    removeTyping();


    const row =
        document.createElement("div");

    row.id =
        "typing-message";

    row.className =
        "message assistant";


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message-content";


    const role =
        document.createElement("div");

    role.className =
        "message-role";

    role.textContent =
        "Volby";


    const bubble =
        document.createElement("div");

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
        role
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


/* ================= SCROLL ================= */

function scrollToBottom() {

    if (!DOM.chat) {
        DOM.chat =
            document.getElementById(
                "chat"
            );
    }


    const chat =
        DOM.chat;


    if (!chat) {
        return;
    }


    requestAnimationFrame(
        () => {

            chat.scrollTo({

                top:
                    chat.scrollHeight,

                behavior:
                    "smooth"

            });

        }
    );

}


/* ================= REGENERATE ================= */

async function regenerateLastResponse() {

    if (
        state.isGenerating
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


    if (
        messages.length === 0
    ) {
        return;
    }


    let lastAssistant =
        messages.length - 1;


    if (
        messages[lastAssistant].role !==
        "assistant"
    ) {
        return;
    }


    const userMessage =
        messages[lastAssistant - 1];


    if (
        !userMessage ||
        userMessage.role !==
            "user"
    ) {
        return;
    }


    messages.pop();


    saveCurrentConversation();


    DOM.messages.innerHTML = "";


    messages.forEach(
        message => {

            renderMessage(
                message.role,
                message.content
            );

        }
    );


    await requestAssistant(
        userMessage.content
    );

}
/* ============================================================
   CHUNK 6/6
   API + SEND + INITIALIZATION
============================================================ */


/* ================= API REQUEST ================= */

async function requestAssistant(
    userText
) {

    if (
        state.isGenerating
    ) {
        return;
    }


    state.isGenerating =
        true;

    updateSendButton();

    showTyping();


    try {

        const response =
            await fetch(
                VOLBY_CONFIG.API_URL + "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            userText,

                        model:
                            state.selectedModel

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const answer =
            extractAssistantResponse(
                data
            );


        if (!answer) {

            throw new Error(
                "The API returned an empty response."
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
            "Volby API error:",
            error
        );


        removeTyping();


        const errorMessage =
            "Sorry, I couldn't connect to Volby right now. Please try again.";


        addMessage(
            "assistant",
            errorMessage
        );


        renderMessage(
            "assistant",
            errorMessage
        );


    } finally {

        state.isGenerating =
            false;

        updateSendButton();

    }

}


/* ================= RESPONSE PARSER ================= */

function extractAssistantResponse(
    data
) {

    if (!data) {
        return "";
    }


    /*
       Supports several common backend
       response formats.
    */

    if (
        typeof data ===
        "string"
    ) {
        return data;
    }


    if (
        typeof data.response ===
        "string"
    ) {
        return data.response;
    }


    if (
        typeof data.answer ===
        "string"
    ) {
        return data.answer;
    }


    if (
        typeof data.message ===
        "string"
    ) {
        return data.message;
    }


    if (
        typeof data.reply ===
        "string"
    ) {
        return data.reply;
    }


    if (
        data.data &&
        typeof data.data ===
            "string"
    ) {
        return data.data;
    }


    if (
        data.choices &&
        Array.isArray(
            data.choices
        )
    ) {

        const choice =
            data.choices[0];


        if (
            choice &&
            choice.message &&
            typeof choice.message.content ===
                "string"
        ) {

            return choice.message.content;

        }

    }


    return "";

}


/* ================= SEND MESSAGE ================= */

async function sendMessage() {

    if (
        state.isGenerating
    ) {
        return;
    }


    if (!DOM.input) {
        return;
    }


    const text =
        DOM.input.value.trim();


    if (!text) {
        return;
    }


    if (
        !state.currentConversation
    ) {
        startNewConversation();
    }


    /*
       Hide welcome screen.
    */

    DOM.welcome.style.display =
        "none";


    /*
       Add user message to state.
    */

    addMessage(
        "user",
        text
    );


    /*
       Render user message once.
    */

    renderMessage(
        "user",
        text
    );


    /*
       Clear input.
    */

    DOM.input.value =
        "";

    DOM.input.style.height =
        "auto";


    updateCharacterCount();

    updateSendButton();

    scrollToBottom();


    /*
       Ask backend.
    */

    await requestAssistant(
        text
    );

}


/* ================= AUTH COMPATIBILITY ================= */

/*
   Supabase is loaded by index.html.
   This frontend does not require authentication
   to display or use the chat UI.

   If your existing authentication system
   exposes a global Supabase client, it will
   remain untouched.
*/

function checkSupabaseAvailability() {

    if (
        window.supabase
    ) {

        console.log(
            "Supabase library detected."
        );

    }

}


/* ================= FINAL EVENT SETUP ================= */

function finishInitialization() {

    bindInputEvents();

    bindNewChatEvents();

    bindSuggestions();

    updateHistoryUI();

    updateModelButton();

    checkSupabaseAvailability();

}


/* ================= PATCH INITIALIZER ================= */

/*
   initVolby() from Chunk 1 runs first.
   This adds the remaining event bindings
   after the DOM has been cached.
*/

const originalInitVolby =
    initVolby;


function initVolbyFinal() {

    originalInitVolby();

    finishInitialization();

}


/* ================= START APPLICATION ================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initVolbyFinal,
        {
            once: true
        }
    );

} else {

    initVolbyFinal();

}