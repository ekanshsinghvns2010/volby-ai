/* VOLBY AI - FRONTEND + PERSISTENT SUPABASE AUTH */

const BACKEND_URL = "https://volby-ai-backend.onrender.com/chat";

const SUPABASE_URL = "https://eyxhphclrpmtmikgwmnx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T5x5nYsNFTznpBdotgxfTQ_x0ITpd38";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* =========================
   ELEMENTS
========================= */

const body = document.body;
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const menuButton = document.getElementById("menu-button");
const closeSidebar = document.getElementById("close-sidebar");
const newChatButton = document.getElementById("new-chat-button");
const historyList = document.getElementById("history-list");
const emptyHistory = document.getElementById("empty-history");
const messagesContainer = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcome-screen");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const characterCount = document.getElementById("character-count");
const themeButtons = document.querySelectorAll(".theme-circle");
const aboutButton = document.getElementById("about-button");
const aboutModal = document.getElementById("about-modal");
const closeAbout = document.getElementById("close-about");
const suggestions = document.querySelectorAll(".suggestion");

let messages = [];
let chatHistory = [];
let currentUser = null;

/* =========================
   SAFE STORAGE
========================= */

function getStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return fallback;
        return JSON.parse(value);
    } catch (error) {
        console.error("Storage read error:", error);
        return fallback;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Storage write error:", error);
    }
}

chatHistory = getStorage("volby_chat_history", []);

/* =========================
   MODEL SELECTION
========================= */

const MODEL_STORAGE_KEY = "volby_selected_model";

const MODEL_OPTIONS = [
    { label: "Volby", value: "groq" },
    { label: "Volby Pro", value: "openrouter" }
];

function getSelectedModel() {
    try {
        const stored = localStorage.getItem(MODEL_STORAGE_KEY);

        if (stored === "groq" || stored === "openrouter") {
            return stored;
        }

        return "groq";
    } catch (error) {
        console.error("Model storage read error:", error);
        return "groq";
    }
}

function setSelectedModel(model) {
    selectedModel = model;

    try {
        localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch (error) {
        console.error("Model storage write error:", error);
    }
}

let selectedModel = getSelectedModel();

function createModelSelector() {
    if (document.getElementById("volby-model-selector")) {
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "volby-model-selector";

    // Main button showing the currently selected model
    const currentButton = document.createElement("button");
    currentButton.type = "button";
    currentButton.id = "current-model-button";
    currentButton.className = "current-model-button";

    // Dropdown menu
    const menu = document.createElement("div");
    menu.id = "model-selector-menu";
    menu.className = "model-selector-menu";

    MODEL_OPTIONS.forEach(option => {
        const optionButton = document.createElement("button");

        optionButton.type = "button";
        optionButton.className = "model-option";
        optionButton.dataset.model = option.value;

        optionButton.innerHTML = `
            <span class="model-option-check">✓</span>
            <span class="model-option-name">${option.label}</span>
        `;

        optionButton.addEventListener("click", (event) => {
            event.stopPropagation();

            setSelectedModel(option.value);

            updateModelSelectorUI();

            menu.classList.remove("open");
            currentButton.setAttribute("aria-expanded", "false");
        });

        menu.appendChild(optionButton);
    });

    // Open / close dropdown
    currentButton.addEventListener("click", (event) => {
        event.stopPropagation();

        const isOpen = menu.classList.toggle("open");

        currentButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    });

    // Close when clicking anywhere outside
    document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
            menu.classList.remove("open");
            currentButton.setAttribute("aria-expanded", "false");
        }
    });

    wrapper.appendChild(currentButton);
    wrapper.appendChild(menu);

    // Put selector inside message composer
    const inputControls =
        document.getElementById("input-controls");

    if (inputControls) {
        inputControls.insertBefore(
            wrapper,
            inputControls.firstChild
        );
        updateModelSelectorUI();
    } 
}    

function updateModelSelectorUI() {
    const currentButton =
        document.getElementById("current-model-button");

    const optionButtons =
        document.querySelectorAll(".model-option");

    if (!currentButton) {
        return;
    }

    const selectedOption =
        MODEL_OPTIONS.find(
            option => option.value === selectedModel
        );

    if (!selectedOption) {
        return;
    }

    // Show current model
    currentButton.innerHTML = `
        <span>${selectedOption.label}</span>
        <span class="model-arrow">▾</span>
    `;

    // Update selected option
    optionButtons.forEach(button => {
        const isSelected =
            button.dataset.model === selectedModel;

        button.classList.toggle(
            "selected",
            isSelected
        );

        const check =
            button.querySelector(".model-option-check");

        if (check) {
            check.style.visibility =
                isSelected ? "visible" : "hidden";
        }
    });
}

/* =========================
   THEME
========================= */

function setTheme(theme) {
    body.dataset.theme = theme;

    try {
        localStorage.setItem("volby_theme", theme);
    } catch (error) {
        console.error("Theme storage error:", error);
    }

    themeButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.theme === theme
        );
    });
}

let savedTheme = "midnight";

try {
    savedTheme =
        localStorage.getItem("volby_theme") || "midnight";
} catch (error) {
    console.error("Theme read error:", error);
}

setTheme(savedTheme);

themeButtons.forEach(button => {
    button.addEventListener("click", () => {
        setTheme(button.dataset.theme);
    });
});

/* =========================
   AUTH SCREEN
========================= */

function createAuthScreen() {
    let existing = document.getElementById("volby-auth-screen");

    if (existing) return;

    const authScreen = document.createElement("div");
    authScreen.id = "volby-auth-screen";

    authScreen.innerHTML = `
        <div class="auth-box">
            <div class="auth-logo">
                <img src="volby-logo.png" alt="Volby AI Logo">
            </div>

            <h2>Welcome to Volby AI</h2>

            <p class="auth-subtitle">
                Sign in or create an account to continue.
            </p>

            <div id="auth-error" class="auth-error"></div>

            <input
                id="auth-email"
                type="email"
                placeholder="Email"
                autocomplete="email"
            >

            <input
                id="auth-password"
                type="password"
                placeholder="Password"
                autocomplete="current-password"
            >

            <button id="auth-submit" class="auth-submit">
                Log In
            </button>

            <button id="auth-toggle" class="auth-toggle">
                Don't have an account? Sign Up
            </button>

            <p class="auth-note">
                You will stay logged in until you log out.
            </p>
        </div>
    `;

    document.body.appendChild(authScreen);

    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const submitButton = document.getElementById("auth-submit");
    const toggleButton = document.getElementById("auth-toggle");
    const errorElement = document.getElementById("auth-error");

    let isSignup = false;

    toggleButton.addEventListener("click", () => {
        isSignup = !isSignup;

        submitButton.textContent =
            isSignup ? "Sign Up" : "Log In";

        toggleButton.textContent =
            isSignup
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up";

        errorElement.textContent = "";
    });

    async function authenticate() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        errorElement.textContent = "";

        if (!email || !password) {
            errorElement.textContent =
                "Please enter your email and password.";
            return;
        }

        if (password.length < 6) {
            errorElement.textContent =
                "Password must be at least 6 characters.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent =
            isSignup ? "Creating account..." : "Logging in...";

        try {
            let result;

            if (isSignup) {
                result = await supabaseClient.auth.signUp({
                    email,
                    password
                });
            } else {
                result = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
            }

            if (result.error) {
                throw result.error;
            }

            if (
                isSignup &&
                result.data.user &&
                !result.data.session
            ) {
                errorElement.textContent =
                    "Account created. Check your email to confirm your account.";

                submitButton.disabled = false;
                submitButton.textContent = "Sign Up";
                return;
            }

            currentUser = result.data.user;

            authScreen.remove();
            showAuthenticatedUI();

        } catch (error) {
            console.error("Authentication error:", error);

            errorElement.textContent =
                error.message || "Authentication failed.";

            submitButton.disabled = false;
            submitButton.textContent =
                isSignup ? "Sign Up" : "Log In";
        }
    }

    submitButton.addEventListener("click", authenticate);

    passwordInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            authenticate();
        }
    });

    emailInput.focus();
}

/* =========================
   AUTHENTICATED UI
========================= */

function showAuthenticatedUI() {
    document.body.classList.add("authenticated");
    addLogoutButton();
}

/* =========================
   LOGOUT
========================= */

function addLogoutButton() {
    if (document.getElementById("volby-logout-button")) {
        return;
    }

    const logoutButton = document.createElement("button");

    logoutButton.id = "volby-logout-button";
    logoutButton.className = "about-button";
    logoutButton.textContent = "↪ Log Out";

    logoutButton.addEventListener("click", async () => {
        const confirmed = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        logoutButton.disabled = true;

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);

            alert(
                "Could not log out. Please try again."
            );

            logoutButton.disabled = false;
            return;
        }

        currentUser = null;
        document.body.classList.remove("authenticated");

        logoutButton.remove();

        createAuthScreen();
    });

    const sidebarBottom =
        document.querySelector(".sidebar-bottom");

    if (sidebarBottom) {
        sidebarBottom.appendChild(logoutButton);
    }
}

/* =========================
   AUTH INITIALIZATION
========================= */

async function initializeAuthentication() {
    try {
        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) throw error;

        if (data.session && data.session.user) {
            currentUser = data.session.user;
            showAuthenticatedUI();
        } else {
            createAuthScreen();
        }

    } catch (error) {
        console.error("Session error:", error);
        createAuthScreen();
    }

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {
            if (session && session.user) {
                currentUser = session.user;
            } else {
                currentUser = null;
            }
        }
    );
}

/* =========================
   SIDEBAR
========================= */

function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
}

function closeSidebarMenu() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
}

menuButton.addEventListener("click", openSidebar);
closeSidebar.addEventListener("click", closeSidebarMenu);
sidebarOverlay.addEventListener("click", closeSidebarMenu);

/* =========================
   NEW CHAT
========================= */

newChatButton.addEventListener("click", () => {
    messages = [];

    messagesContainer.innerHTML = "";
    messagesContainer.appendChild(welcomeScreen);

    welcomeScreen.style.display = "";

    input.value = "";

    updateCharacterCount();
    autoResize();

    closeSidebarMenu();
    input.focus();
});

/* =========================
   INPUT
========================= */

input.addEventListener("input", () => {
    updateCharacterCount();
    autoResize();
});

function updateCharacterCount() {
    characterCount.textContent =
        `${input.value.length} / 10000`;
}

function autoResize() {
    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 160) + "px";
}

/* =========================
   MARKDOWN
========================= */

function formatAIResponse(content) {
    const fragment =
        document.createDocumentFragment();

    const parts =
        String(content).split(
            /(```[\s\S]*?```)/g
        );

    parts.forEach(part => {
        if (
            part.startsWith("```") &&
            part.endsWith("```")
        ) {
            createCodeBlock(part, fragment);
        } else {
            createTextContent(part, fragment);
        }
    });

    return fragment;
}

function createTextContent(text, container) {
    if (!text || text.trim() === "") return;

    const lines = text.split("\n");
    let currentList = null;

    lines.forEach(line => {
        const trimmed = line.trim();

        if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ")
        ) {
            if (
                !currentList ||
                currentList.tagName !== "UL"
            ) {
                currentList =
                    document.createElement("ul");

                container.appendChild(currentList);
            }

            const li =
                document.createElement("li");

            li.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(2)
                )
            );

            currentList.appendChild(li);
            return;
        }

        const numbered =
            trimmed.match(/^\d+\.\s+(.*)/);

        if (numbered) {
            if (
                !currentList ||
                currentList.tagName !== "OL"
            ) {
                currentList =
                    document.createElement("ol");

                container.appendChild(currentList);
            }

            const li =
                document.createElement("li");

            li.appendChild(
                formatInlineMarkdown(
                    numbered[1]
                )
            );

            currentList.appendChild(li);
            return;
        }

        currentList = null;

        if (trimmed.startsWith("# ")) {
            const heading =
                document.createElement("h3");

            heading.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(2)
                )
            );

            container.appendChild(heading);
            return;
        }

        if (trimmed === "") {
            const spacer =
                document.createElement("div");

            spacer.className = "text-spacer";
            container.appendChild(spacer);
            return;
        }

        const paragraph =
            document.createElement("p");

        paragraph.appendChild(
            formatInlineMarkdown(line)
        );

        container.appendChild(paragraph);
    });
}

function formatInlineMarkdown(text) {
    const fragment =
        document.createDocumentFragment();

    const parts =
        String(text).split(
            /(\*\*.*?\*\*)/g
        );

    parts.forEach(part => {
        if (
            part.startsWith("**") &&
            part.endsWith("**")
        ) {
            const bold =
                document.createElement("strong");

            bold.textContent =
                part.substring(
                    2,
                    part.length - 2
                );

            fragment.appendChild(bold);
        } else {
            fragment.appendChild(
                document.createTextNode(part)
            );
        }
    });

    return fragment;
}

function createCodeBlock(codePart, container) {
    let code =
        codePart
            .replace(/^```/, "")
            .replace(/```$/, "");

    let language = "Code";

    const firstNewLine =
        code.indexOf("\n");

    if (firstNewLine !== -1) {
        const possibleLanguage =
            code
                .substring(0, firstNewLine)
                .trim();

        if (
            /^[a-zA-Z0-9+#.-]+$/.test(
                possibleLanguage
            )
        ) {
            language = possibleLanguage;

            code =
                code.substring(
                    firstNewLine + 1
                );
        }
    }

    code = code.trim();

    const wrapper =
        document.createElement("div");

    wrapper.className = "code-block";

    const header =
        document.createElement("div");

    header.className = "code-header";

    const languageLabel =
        document.createElement("span");

    languageLabel.className =
        "code-language";

    languageLabel.textContent = language;

    const copyButton =
        document.createElement("button");

    copyButton.className =
        "code-copy-button";

    copyButton.textContent = "Copy";

    copyButton.addEventListener(
        "click",
        async () => {
            try {
                await navigator.clipboard.writeText(code);

                copyButton.textContent = "Copied!";

                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1500);

            } catch (error) {
                console.error(
                    "Copy failed:",
                    error
                );
            }
        }
    );

    header.appendChild(languageLabel);
    header.appendChild(copyButton);

    const pre =
        document.createElement("pre");

    const codeElement =
        document.createElement("code");

    codeElement.textContent = code;

    pre.appendChild(codeElement);

    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    container.appendChild(wrapper);
}

/* =========================
   MESSAGES
========================= */

function addMessage(content, role) {
    welcomeScreen.style.display = "none";

    const row =
        document.createElement("div");

    row.className =
        "message-row " + role;

    const message =
        document.createElement("div");

    message.className =
        "message " + role;

    if (role === "ai") {
        message.appendChild(
            formatAIResponse(content)
        );
    } else {
        message.textContent = content;
    }

    row.appendChild(message);
    messagesContainer.appendChild(row);

    scrollToBottom();

    return message;
}

function addThinkingMessage() {
    welcomeScreen.style.display = "none";

    const row =
        document.createElement("div");

    row.className = "message-row ai";

    const message =
        document.createElement("div");

    message.className = "message ai";

    message.innerHTML = `
        <div class="thinking">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    row.appendChild(message);
    messagesContainer.appendChild(row);

    scrollToBottom();

    return row;
}

function addResponseCopyButton(message, answer) {
    const actions =
        document.createElement("div");

    actions.className =
        "message-actions";

    const copyButton =
        document.createElement("button");

    copyButton.className =
        "copy-button";

    copyButton.textContent = "Copy";

    copyButton.addEventListener(
        "click",
        async () => {
            try {
                await navigator.clipboard.writeText(answer);

                copyButton.textContent = "Copied!";

                setTimeout(() => {
                    copyButton.textContent = "Copy";
                }, 1500);

            } catch (error) {
                console.error(
                    "Copy failed:",
                    error
                );
            }
        }
    );

    actions.appendChild(copyButton);
    message.appendChild(actions);
}

/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {
    const text = input.value.trim();

    if (
        text === "" ||
        sendButton.disabled
    ) {
        return;
    }

    messages.push({
        role: "user",
        content: text
    });

    addMessage(text, "user");

    input.value = "";
    updateCharacterCount();
    autoResize();

    sendButton.disabled = true;

    const thinking =
        addThinkingMessage();

    try {
        const response =
            await fetch(
                BACKEND_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        messages,
                        model: selectedModel
                    })
                }
            );

        if (!response.ok) {
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

        thinking.remove();

        messages.push({
            role: "assistant",
            content: answer
        });

        const aiMessage =
            addMessage(
                answer,
                "ai"
            );

        addResponseCopyButton(
            aiMessage,
            answer
        );

        saveCurrentChat(text);

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

        messages.pop();
    }

    sendButton.disabled = false;
    input.focus();
}

sendButton.addEventListener(
    "click",
    sendMessage
);

/* =========================
   KEYBOARD
========================= */

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

/* =========================
   SUGGESTIONS
========================= */

suggestions.forEach(suggestion => {
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
});

/* =========================
   SCROLL
========================= */

function scrollToBottom() {
    const chat =
        document.getElementById("chat");

    setTimeout(() => {
        chat.scrollTop =
            chat.scrollHeight;
    }, 50);
}

/* =========================
   CHAT HISTORY
========================= */

function saveCurrentChat(firstMessage) {
    const title =
        firstMessage.length > 35
            ? firstMessage.substring(0, 35) + "..."
            : firstMessage;

    const chat = {
        title,
        messages: [...messages],
        timestamp: Date.now()
    };

    chatHistory.unshift(chat);

    chatHistory =
        chatHistory.slice(0, 20);

    setStorage(
        "volby_chat_history",
        chatHistory
    );

    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";

    if (chatHistory.length === 0) {
        emptyHistory.style.display = "block";
        return;
    }

    emptyHistory.style.display = "none";

    chatHistory.forEach(
        (chat, index) => {
            const button =
                document.createElement("button");

            button.className =
                "history-item";

            const icon =
                document.createElement("span");

            icon.className =
                "history-icon";

            icon.textContent = "💬";

            const title =
                document.createElement("span");

            title.className =
                "history-title";

            title.textContent =
                chat.title;

            button.appendChild(icon);
            button.appendChild(title);

            button.addEventListener(
                "click",
                () => {
                    loadChat(index);
                }
            );

            historyList.appendChild(button);
        }
    );
}

function loadChat(index) {
    const chat = chatHistory[index];

    if (!chat) return;

    messages = Array.isArray(chat.messages)
        ? [...chat.messages]
        : [];

    messagesContainer.innerHTML = "";

    welcomeScreen.style.display = "none";

    messages.forEach(message => {
        const messageElement =
            addMessage(
                message.content,
                message.role === "assistant"
                    ? "ai"
                    : "user"
            );

        if (
            message.role === "assistant"
        ) {
            addResponseCopyButton(
                messageElement,
                message.content
            );
        }
    });

    closeSidebarMenu();
    scrollToBottom();
}

/* =========================
   ABOUT MODAL
========================= */

aboutButton.addEventListener(
    "click",
    () => {
        aboutModal.classList.remove("hidden");
    }
);

closeAbout.addEventListener(
    "click",
    () => {
        aboutModal.classList.add("hidden");
    }
);

aboutModal.addEventListener(
    "click",
    event => {
        if (event.target === aboutModal) {
            aboutModal.classList.add("hidden");
        }
    }
);

/* =========================
   INITIALIZE
========================= */

renderHistory();
updateCharacterCount();
autoResize();
createModelSelector();

initializeAuthentication();
