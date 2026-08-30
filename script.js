/* ============================================================
   VOLBY AI
   FRONTEND — SCRIPT.JS
   CHUNK 1 / 6
   Core + Supabase + Model System + UI Elements
============================================================ */

"use strict";

/* ============================================================
   CONFIGURATION
============================================================ */

const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";

const SUPABASE_URL =
    "https://eyxhphclrpmtmikgwmnx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_T5x5nYsNFTznpBdotgxfTQ_x0ITpd38";


/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* ============================================================
   DOM ELEMENTS
============================================================ */

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


/* ============================================================
   APPLICATION STATE
============================================================ */

let messages = [];

let chatHistory = [];

let currentUser = null;

let selectedModel = "groq";

let isGenerating = false;

let currentChatId = null;


/* ============================================================
   MODEL CONFIGURATION
============================================================ */

const MODEL_STORAGE_KEY =
    "volby_selected_model";


const MODEL_OPTIONS = [

    {
        label: "Volby",
        value: "groq",
        description: "Fast AI"
    },

    {
        label: "Volby Pro",
        value: "openrouter",
        description: "Advanced AI"
    }

];


/* ============================================================
   MODEL STORAGE
============================================================ */

function getSelectedModel() {

    try {

        const stored =
            localStorage.getItem(
                MODEL_STORAGE_KEY
            );

        if (
            stored === "groq" ||
            stored === "openrouter"
        ) {

            return stored;

        }

        return "groq";

    } catch (error) {

        console.error(
            "Model storage read error:",
            error
        );

        return "groq";
    }
}


function setSelectedModel(model) {

    if (
        model !== "groq" &&
        model !== "openrouter"
    ) {

        return;
    }

    selectedModel = model;

    try {

        localStorage.setItem(
            MODEL_STORAGE_KEY,
            model
        );

    } catch (error) {

        console.error(
            "Model storage write error:",
            error
        );
    }

}


/* ============================================================
   INITIAL MODEL
============================================================ */

selectedModel =
    getSelectedModel();


/* ============================================================
   SAFE LOCAL STORAGE
============================================================ */

function getStorage(
    key,
    fallback
) {

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


function setStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.error(
            "Storage write error:",
            error
        );
    }

}


/* ============================================================
   CHAT HISTORY INITIALIZATION
============================================================ */

chatHistory =
    getStorage(
        "volby_chat_history",
        []
    );


/* ============================================================
   THEME SYSTEM
============================================================ */

function setTheme(theme) {

    if (!theme) {

        theme = "midnight";

    }

    body.dataset.theme =
        theme;

    try {

        localStorage.setItem(
            "volby_theme",
            theme
        );

    } catch (error) {

        console.error(
            "Theme storage error:",
            error
        );
    }

    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.theme === theme
            );

        }
    );

}


/* ============================================================
   LOAD SAVED THEME
============================================================ */

let savedTheme =
    "midnight";

try {

    savedTheme =
        localStorage.getItem(
            "volby_theme"
        ) ||
        "midnight";

} catch (error) {

    console.error(
        "Theme read error:",
        error
    );
}


setTheme(savedTheme);


/* ============================================================
   THEME BUTTONS
============================================================ */

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


/* ============================================================
   MODEL SELECTOR
============================================================ */

function createModelSelector() {

    if (
        document.getElementById(
            "volby-model-selector"
        )
    ) {

        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.id =
        "volby-model-selector";


    /* --------------------------------------------------------
       CURRENT MODEL BUTTON
    -------------------------------------------------------- */

    const currentButton =
        document.createElement(
            "button"
        );

    currentButton.type =
        "button";

    currentButton.id =
        "current-model-button";

    currentButton.className =
        "current-model-button";

    currentButton.setAttribute(
        "aria-haspopup",
        "true"
    );

    currentButton.setAttribute(
        "aria-expanded",
        "false"
    );


    /* --------------------------------------------------------
       DROPDOWN
    -------------------------------------------------------- */

    const menu =
        document.createElement(
            "div"
        );

    menu.id =
        "model-selector-menu";

    menu.className =
        "model-selector-menu";

    menu.setAttribute(
        "role",
        "menu"
    );


    /* --------------------------------------------------------
       MODEL OPTIONS
    -------------------------------------------------------- */

    MODEL_OPTIONS.forEach(
        option => {

            const optionButton =
                document.createElement(
                    "button"
                );

            optionButton.type =
                "button";

            optionButton.className =
                "model-option";

            optionButton.dataset.model =
                option.value;

            optionButton.setAttribute(
                "role",
                "menuitem"
            );


            optionButton.innerHTML = `

                <span
                    class="model-option-check"
                    aria-hidden="true"
                >
                    ✓
                </span>

                <span
                    class="model-option-name"
                >
                    ${option.label}
                </span>

            `;


            optionButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    setSelectedModel(
                        option.value
                    );


                    updateModelSelectorUI();


                    menu.classList.remove(
                        "open"
                    );


                    currentButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );


            menu.appendChild(
                optionButton
            );

        }
    );


    /* --------------------------------------------------------
       OPEN / CLOSE MODEL MENU
    -------------------------------------------------------- */

    currentButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                menu.classList.toggle(
                    "open"
                );


            currentButton.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

        }
    );


    /* --------------------------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    -------------------------------------------------------- */

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

                currentButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /* --------------------------------------------------------
       INSERT INTO COMPOSER
    -------------------------------------------------------- */

    wrapper.appendChild(
        currentButton
    );

    wrapper.appendChild(
        menu
    );


    const inputControls =
        document.getElementById(
            "input-controls"
        );


    if (inputControls) {

        inputControls.insertBefore(
            wrapper,
            inputControls.firstChild
        );

        updateModelSelectorUI();

    }

}


/* ============================================================
   MODEL SELECTOR UI
============================================================ */

function updateModelSelectorUI() {

    const currentButton =
        document.getElementById(
            "current-model-button"
        );

    const optionButtons =
        document.querySelectorAll(
            ".model-option"
        );


    if (!currentButton) {

        return;
    }


    const selectedOption =
        MODEL_OPTIONS.find(
            option =>
                option.value === selectedModel
        );


    if (!selectedOption) {

        return;
    }


    currentButton.innerHTML = `

        <span>
            ${selectedOption.label}
        </span>

        <span
            class="model-arrow"
            aria-hidden="true"
        >
            ▾
        </span>

    `;


    optionButtons.forEach(
        button => {

            const isSelected =
                button.dataset.model ===
                selectedModel;


            button.classList.toggle(
                "selected",
                isSelected
            );


            const check =
                button.querySelector(
                    ".model-option-check"
                );


            if (check) {

                check.style.visibility =
                    isSelected
                        ? "visible"
                        : "hidden";

            }

        }
    );

}


/* ============================================================
   SAFE TEXT HELPER
============================================================ */

function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value);

}


/* ============================================================
   CHARACTER COUNTER
============================================================ */

function updateCharacterCount() {

    if (!characterCount) {

        return;
    }


    characterCount.textContent =
        `${input.value.length} / 10000`;

}


/* ============================================================
   INPUT AUTO RESIZE
============================================================ */

function autoResize() {

    if (!input) {

        return;
    }


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            160
        ) + "px";

}


/* ============================================================
   INPUT EVENTS
============================================================ */

if (input) {

    input.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            autoResize();

        }
    );

}


/* ============================================================
   INITIAL UI SETUP
============================================================ */

updateCharacterCount();

autoResize();

createModelSelector();


/* ============================================================
   END OF CHUNK 1 / 6
============================================================ */
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 2 / 6
   MODEL SELECTOR + THEME + AUTH
============================================================ */


/* ============================================================
   MODEL SELECTION
============================================================ */

const MODEL_STORAGE_KEY = "volby_selected_model";

const MODEL_OPTIONS = [
    {
        label: "Volby",
        value: "groq",
        description: "Fast AI"
    },
    {
        label: "Volby Pro",
        value: "openrouter",
        description: "Advanced AI"
    }
];


function getSelectedModel() {

    try {

        const stored =
            localStorage.getItem(
                MODEL_STORAGE_KEY
            );

        if (
            stored === "groq" ||
            stored === "openrouter"
        ) {
            return stored;
        }

        return "groq";

    } catch (error) {

        console.error(
            "Model storage read error:",
            error
        );

        return "groq";
    }
}


function setSelectedModel(model) {

    if (
        model !== "groq" &&
        model !== "openrouter"
    ) {
        return;
    }

    selectedModel = model;

    try {

        localStorage.setItem(
            MODEL_STORAGE_KEY,
            model
        );

    } catch (error) {

        console.error(
            "Model storage write error:",
            error
        );
    }
}


let selectedModel =
    getSelectedModel();


/* ============================================================
   MODEL SELECTOR
============================================================ */

function createModelSelector() {

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


    /* --------------------------------------------------------
       CURRENT MODEL BUTTON
    -------------------------------------------------------- */

    const currentButton =
        document.createElement("button");

    currentButton.type = "button";

    currentButton.id =
        "current-model-button";

    currentButton.className =
        "current-model-button";

    currentButton.setAttribute(
        "aria-expanded",
        "false"
    );

    currentButton.setAttribute(
        "aria-haspopup",
        "true"
    );


    /* --------------------------------------------------------
       DROPDOWN
    -------------------------------------------------------- */

    const menu =
        document.createElement("div");

    menu.id =
        "model-selector-menu";

    menu.className =
        "model-selector-menu";


    MODEL_OPTIONS.forEach(option => {

        const optionButton =
            document.createElement("button");

        optionButton.type =
            "button";

        optionButton.className =
            "model-option";

        optionButton.dataset.model =
            option.value;

        optionButton.innerHTML = `
            <span class="model-option-icon">
                ${option.value === "groq" ? "⚡" : "✦"}
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


        optionButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                setSelectedModel(
                    option.value
                );

                updateModelSelectorUI();

                menu.classList.remove(
                    "open"
                );

                currentButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );


        menu.appendChild(
            optionButton
        );
    });


    /* --------------------------------------------------------
       OPEN / CLOSE
    -------------------------------------------------------- */

    currentButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                menu.classList.toggle(
                    "open"
                );

            currentButton.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );
        }
    );


    /* --------------------------------------------------------
       OUTSIDE CLICK
    -------------------------------------------------------- */

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

                currentButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );


    wrapper.appendChild(
        currentButton
    );

    wrapper.appendChild(
        menu
    );


    /* --------------------------------------------------------
       INSERT INTO COMPOSER
    -------------------------------------------------------- */

    const inputControls =
        document.getElementById(
            "input-controls"
        );


    if (inputControls) {

        inputControls.insertBefore(
            wrapper,
            inputControls.firstChild
        );

        updateModelSelectorUI();
    }
}


/* ============================================================
   UPDATE MODEL SELECTOR UI
============================================================ */

function updateModelSelectorUI() {

    const currentButton =
        document.getElementById(
            "current-model-button"
        );


    const optionButtons =
        document.querySelectorAll(
            ".model-option"
        );


    if (!currentButton) {
        return;
    }


    const selectedOption =
        MODEL_OPTIONS.find(
            option =>
                option.value ===
                selectedModel
        );


    if (!selectedOption) {
        return;
    }


    const icon =
        selectedModel === "groq"
            ? "⚡"
            : "✦";


    currentButton.innerHTML = `
        <span class="current-model-icon">
            ${icon}
        </span>

        <span class="current-model-name">
            ${selectedOption.label}
        </span>

        <span class="model-arrow">
            ▾
        </span>
    `;


    optionButtons.forEach(
        button => {

            const isSelected =
                button.dataset.model ===
                selectedModel;


            button.classList.toggle(
                "selected",
                isSelected
            );


            const check =
                button.querySelector(
                    ".model-option-check"
                );


            if (check) {

                check.style.visibility =
                    isSelected
                        ? "visible"
                        : "hidden";
            }
        }
    );
}


/* ============================================================
   THEME SYSTEM
============================================================ */

function setTheme(theme) {

    if (!theme) {
        theme = "midnight";
    }


    body.dataset.theme =
        theme;


    try {

        localStorage.setItem(
            "volby_theme",
            theme
        );

    } catch (error) {

        console.error(
            "Theme storage error:",
            error
        );
    }


    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                    theme
            );
        }
    );
}


let savedTheme =
    "midnight";


try {

    savedTheme =
        localStorage.getItem(
            "volby_theme"
        ) || "midnight";

} catch (error) {

    console.error(
        "Theme read error:",
        error
    );
}


setTheme(
    savedTheme
);


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


/* ============================================================
   AUTH SCREEN
============================================================ */

function createAuthScreen() {

    const existing =
        document.getElementById(
            "volby-auth-screen"
        );


    if (existing) {
        return;
    }


    const authScreen =
        document.createElement("div");

    authScreen.id =
        "volby-auth-screen";


    authScreen.innerHTML = `
        <div class="auth-backdrop"></div>

        <div class="auth-box">

            <div class="auth-logo">
                <img
                    src="volby-logo.png"
                    alt="Volby AI"
                >
            </div>

            <div class="auth-brand">
                <span class="auth-brand-name">
                    VOLBY
                </span>

                <span class="auth-brand-subtitle">
                    AI
                </span>
            </div>

            <h2>
                Welcome to Volby
            </h2>

            <p class="auth-subtitle">
                Your intelligent AI assistant.
            </p>

            <div
                id="auth-error"
                class="auth-error"
            ></div>

            <div class="auth-input-group">

                <label for="auth-email">
                    Email
                </label>

                <input
                    id="auth-email"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                >

            </div>


            <div class="auth-input-group">

                <label for="auth-password">
                    Password
                </label>

                <input
                    id="auth-password"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                >

            </div>


            <button
                id="auth-submit"
                class="auth-submit"
            >
                Log In
            </button>


            <button
                id="auth-toggle"
                class="auth-toggle"
            >
                Don't have an account?
                Sign Up
            </button>


            <p class="auth-note">
                Your account keeps your Volby experience connected.
            </p>

        </div>
    `;


    document.body.appendChild(
        authScreen
    );


    const emailInput =
        document.getElementById(
            "auth-email"
        );


    const passwordInput =
        document.getElementById(
            "auth-password"
        );


    const submitButton =
        document.getElementById(
            "auth-submit"
        );


    const toggleButton =
        document.getElementById(
            "auth-toggle"
        );


    const errorElement =
        document.getElementById(
            "auth-error"
        );


    let isSignup =
        false;


    /* ========================================================
       TOGGLE LOGIN / SIGNUP
    ======================================================== */

    toggleButton.addEventListener(
        "click",
        () => {

            isSignup =
                !isSignup;


            submitButton.textContent =
                isSignup
                    ? "Create Account"
                    : "Log In";


            toggleButton.textContent =
                isSignup
                    ? "Already have an account? Log In"
                    : "Don't have an account? Sign Up";


            errorElement.textContent =
                "";
        }
    );


    /* ========================================================
       AUTHENTICATE
    ======================================================== */

    async function authenticate() {

        const email =
            emailInput.value.trim();


        const password =
            passwordInput.value;


        errorElement.textContent =
            "";


        if (
            !email ||
            !password
        ) {

            errorElement.textContent =
                "Please enter your email and password.";

            return;
        }


        if (
            password.length < 6
        ) {

            errorElement.textContent =
                "Password must be at least 6 characters.";

            return;
        }


        submitButton.disabled =
            true;


        submitButton.textContent =
            isSignup
                ? "Creating account..."
                : "Logging in...";


        try {

            let result;


            if (isSignup) {

                result =
                    await supabaseClient.auth.signUp({
                        email,
                        password
                    });

            } else {

                result =
                    await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });
            }


            if (result.error) {
                throw result.error;
            }


            /* ------------------------------------------------
               EMAIL CONFIRMATION REQUIRED
            ------------------------------------------------ */

            if (
                isSignup &&
                result.data.user &&
                !result.data.session
            ) {

                errorElement.textContent =
                    "Account created. Check your email to confirm your account.";

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create Account";

                return;
            }


            /* ------------------------------------------------
               SUCCESS
            ------------------------------------------------ */

            currentUser =
                result.data.user;


            authScreen.remove();


            showAuthenticatedUI();


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );


            errorElement.textContent =
                error.message ||
                "Authentication failed.";


            submitButton.disabled =
                false;


            submitButton.textContent =
                isSignup
                    ? "Create Account"
                    : "Log In";
        }
    }


    submitButton.addEventListener(
        "click",
        authenticate
    );


    /* ========================================================
       ENTER KEY
    ======================================================== */

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                authenticate();
            }
        }
    );


    emailInput.focus();
}


/* ============================================================
   AUTHENTICATED UI
============================================================ */

function showAuthenticatedUI() {

    document.body.classList.add(
        "authenticated"
    );


    addLogoutButton();


    /*
     * Make sure the model selector
     * exists after authentication.
     */

    createModelSelector();
}


/* ============================================================
   LOGOUT BUTTON
============================================================ */

function addLogoutButton() {

    if (
        document.getElementById(
            "volby-logout-button"
        )
    ) {
        return;
    }


    const logoutButton =
        document.createElement("button");


    logoutButton.id =
        "volby-logout-button";


    logoutButton.className =
        "about-button";


    logoutButton.innerHTML =
        "↪ <span>Log Out</span>";


    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {
                return;
            }


            logoutButton.disabled =
                true;


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {
                    throw error;
                }


                currentUser =
                    null;


                document.body.classList.remove(
                    "authenticated"
                );


                logoutButton.remove();


                createAuthScreen();


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Could not log out. Please try again."
                );


                logoutButton.disabled =
                    false;
            }
        }
    );


    const sidebarBottom =
        document.querySelector(
            ".sidebar-bottom"
        );


    if (sidebarBottom) {

        sidebarBottom.appendChild(
            logoutButton
        );
    }
}


/* ============================================================
   AUTH INITIALIZATION
============================================================ */

async function initializeAuthentication() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {
            throw error;
        }


        if (
            data.session &&
            data.session.user
        ) {

            currentUser =
                data.session.user;


            showAuthenticatedUI();

        } else {

            createAuthScreen();
        }


    } catch (error) {

        console.error(
            "Session initialization error:",
            error
        );


        createAuthScreen();
    }


    /* --------------------------------------------------------
       AUTH STATE LISTENER
    -------------------------------------------------------- */

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            if (
                session &&
                session.user
            ) {

                currentUser =
                    session.user;

                document.body.classList.add(
                    "authenticated"
                );

            } else {

                currentUser =
                    null;

                document.body.classList.remove(
                    "authenticated"
                );
            }
        }
    );
}
/* ============================================================
   VOLBY AI — SCRIPT.JS
   CHUNK 3 / 6
   SIDEBAR + CHAT RESET + INPUT SYSTEM
============================================================ */


/* ============================================================
   SIDEBAR
============================================================ */

function openSidebar() {

    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("active");
    }

    document.body.classList.add(
        "sidebar-open"
    );
}


function closeSidebarMenu() {

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
    }

    document.body.classList.remove(
        "sidebar-open"
    );
}


/* ============================================================
   SIDEBAR EVENTS
============================================================ */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );
}


if (closeSidebar) {

    closeSidebar.addEventListener(
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


/* ============================================================
   ESC KEY
============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeSidebarMenu();
        }
    }
);


/* ============================================================
   NEW CHAT
============================================================ */

function startNewChat() {

    messages = [];


    /* --------------------------------------------------------
       Clear visible messages
    -------------------------------------------------------- */

    if (messagesContainer) {

        messagesContainer.innerHTML = "";


        if (welcomeScreen) {

            messagesContainer.appendChild(
                welcomeScreen
            );

            welcomeScreen.style.display =
                "";
        }
    }


    /* --------------------------------------------------------
       Clear input
    -------------------------------------------------------- */

    if (input) {

        input.value = "";

        input.style.height =
            "auto";

        input.focus();
    }


    updateCharacterCount();
    autoResize();


    /* --------------------------------------------------------
       Close mobile sidebar
    -------------------------------------------------------- */

    closeSidebarMenu();
}


/* ============================================================
   NEW CHAT BUTTON
============================================================ */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        startNewChat
    );
}


/* ============================================================
   INPUT SYSTEM
============================================================ */

if (input) {

    input.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            autoResize();

            updateSendButtonState();
        }
    );


    /* --------------------------------------------------------
       ENTER TO SEND
       SHIFT + ENTER = NEW LINE
    -------------------------------------------------------- */

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    !sendButton ||
                    sendButton.disabled
                ) {
                    return;
                }

                sendMessage();
            }
        }
    );
}


/* ============================================================
   CHARACTER COUNT
============================================================ */

function updateCharacterCount() {

    if (!characterCount || !input) {
        return;
    }


    const length =
        input.value.length;


    characterCount.textContent =
        `${length.toLocaleString()} / 10,000`;


    if (length >= 9500) {

        characterCount.classList.add(
            "warning"
        );

    } else {

        characterCount.classList.remove(
            "warning"
        );
    }
}


/* ============================================================
   AUTO RESIZE TEXTAREA
============================================================ */

function autoResize() {

    if (!input) {
        return;
    }


    input.style.height =
        "auto";


    const maxHeight =
        180;


    input.style.height =
        Math.min(
            input.scrollHeight,
            maxHeight
        ) + "px";
}


/* ============================================================
   SEND BUTTON STATE
============================================================ */

function updateSendButtonState() {

    if (!sendButton || !input) {
        return;
    }


    const hasText =
        input.value.trim().length > 0;


    if (!isSending) {

        sendButton.disabled =
            !hasText;
    }


    sendButton.classList.toggle(
        "ready",
        hasText && !isSending
    );
}


/* ============================================================
   SUGGESTION BUTTONS
============================================================ */

if (suggestions) {

    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    const text =
                        suggestion.dataset.prompt ||
                        suggestion.textContent.trim();


                    if (!input) {
                        return;
                    }


                    input.value =
                        text;


                    updateCharacterCount();

                    autoResize();

                    updateSendButtonState();

                    input.focus();
                }
            );
        }
    );
}


/* ============================================================
   INPUT PLACEHOLDER EFFECT
============================================================ */

function updateInputPlaceholder() {

    if (!input) {
        return;
    }


    if (selectedModel === "openrouter") {

        input.placeholder =
            "Message Volby Pro...";

    } else {

        input.placeholder =
            "Message Volby...";
    }
}


updateInputPlaceholder();


/* ============================================================
   UPDATE PLACEHOLDER WHEN MODEL CHANGES
============================================================ */

const originalSetSelectedModel =
    setSelectedModel;


/*
 * Keep the model selector and composer
 * synchronized.
 */

setSelectedModel = function(model) {

    originalSetSelectedModel(
        model
    );


    updateInputPlaceholder();

    updateModelSelectorUI();

    updateSendButtonState();
};


/* ============================================================
   CHAT HISTORY HELPERS
============================================================ */

function generateChatId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


function createChatTitle(text) {

    const clean =
        String(text || "")
            .replace(/\s+/g, " ")
            .trim();


    if (!clean) {
        return "New chat";
    }


    if (clean.length <= 42) {
        return clean;
    }


    return (
        clean.substring(0, 42) +
        "…"
    );
}


/* ============================================================
   SAVE CHAT HISTORY
============================================================ */

function saveChatToHistory() {

    if (!messages.length) {
        return;
    }


    const firstUserMessage =
        messages.find(
            message =>
                message.role === "user"
        );


    if (!firstUserMessage) {
        return;
    }


    const chatId =
        messages.chatId ||
        generateChatId();


    messages.chatId =
        chatId;


    const existingIndex =
        chatHistory.findIndex(
            chat =>
                chat.id === chatId
        );


    const historyItem = {

        id: chatId,

        title:
            createChatTitle(
                firstUserMessage.content
            ),

        messages:
            messages.map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            ),

        updatedAt:
            Date.now()
    };


    if (
        existingIndex >= 0
    ) {

        chatHistory[
            existingIndex
        ] =
            historyItem;

    } else {

        chatHistory.unshift(
            historyItem
        );
    }


    /* --------------------------------------------------------
       Keep history manageable
    -------------------------------------------------------- */

    if (
        chatHistory.length > 50
    ) {

        chatHistory =
            chatHistory.slice(
                0,
                50
            );
    }


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    renderChatHistory();
}


/* ============================================================
   RENDER CHAT HISTORY
============================================================ */

function renderChatHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML =
        "";


    if (
        !chatHistory ||
        chatHistory.length === 0
    ) {

        if (emptyHistory) {

            emptyHistory.style.display =
                "";
        }

        return;
    }


    if (emptyHistory) {

        emptyHistory.style.display =
            "none";
    }


    chatHistory.forEach(
        chat => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "history-item";


            item.dataset.chatId =
                chat.id;


            item.innerHTML = `
                <span class="history-item-icon">
                    ◌
                </span>

                <span class="history-item-content">
                    <span class="history-item-title">
                        ${escapeHTML(
                            chat.title ||
                            "New chat"
                        )}
                    </span>
                </span>

                <span class="history-item-arrow">
                    ›
                </span>
            `;


            item.addEventListener(
                "click",
                () => {

                    loadChatFromHistory(
                        chat.id
                    );

                    closeSidebarMenu();
                }
            );


            historyList.appendChild(
                item
            );
        }
    );
}


/* ============================================================
   LOAD CHAT FROM HISTORY
============================================================ */

function loadChatFromHistory(
    chatId
) {

    const chat =
        chatHistory.find(
            item =>
                item.id === chatId
        );


    if (!chat) {
        return;
    }


    messages =
        Array.isArray(
            chat.messages
        )
            ? chat.messages.map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            )
            : [];


    messages.chatId =
        chat.id;


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";
    }


    if (
        !messages.length
    ) {

        if (
            messagesContainer &&
            welcomeScreen
        ) {

            messagesContainer.appendChild(
                welcomeScreen
            );

            welcomeScreen.style.display =
                "";
        }

        return;
    }


    /* --------------------------------------------------------
       Render every stored message
    -------------------------------------------------------- */

    messages.forEach(
        message => {

            if (
                message.role === "user"
            ) {

                appendUserMessage(
                    message.content
                );

            } else if (
                message.role === "assistant"
            ) {

                appendAIMessage(
                    message.content
                );
            }
        }
    );


    scrollToBottom();
}


/* ============================================================
   DELETE ALL CHAT HISTORY
============================================================ */

function clearChatHistory() {

    const confirmed =
        confirm(
            "Clear all Volby chat history?"
        );


    if (!confirmed) {
        return;
    }


    chatHistory =
        [];


    setStorage(
        "volby_chat_history",
        []
    );


    renderChatHistory();

    startNewChat();
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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
   SCROLL TO BOTTOM
============================================================ */

function scrollToBottom(
    smooth = true
) {

    if (!messagesContainer) {
        return;
    }


    messagesContainer.scrollTo({

        top:
            messagesContainer.scrollHeight,

        behavior:
            smooth
                ? "smooth"
                : "auto"
    });
}


/* ============================================================
   INITIAL HISTORY RENDER
============================================================ */

renderChatHistory();


/* ============================================================
   INITIAL UI SYNC
============================================================ */

updateCharacterCount();

autoResize();

updateSendButtonState();

updateInputPlaceholder();


/* ============================================================
   MODEL SELECTOR INITIALIZATION
============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            createModelSelector();

            updateModelSelectorUI();
        }
    );

} else {

    createModelSelector();

    updateModelSelectorUI();
}
/* ============================================================
   SCRIPT.JS — CHUNK 4A/6
   VOLBY AI — CHAT HISTORY + UI HELPERS
============================================================ */


/* ============================================================
   CHAT HISTORY HELPERS
============================================================ */

function getChatTitle(chatMessages) {

    const firstUserMessage =
        chatMessages.find(
            message =>
                message.role === "user"
        );

    if (!firstUserMessage) {
        return "New conversation";
    }

    let title =
        String(
            firstUserMessage.content || ""
        ).trim();

    if (!title) {
        return "New conversation";
    }

    title =
        title.replace(/\s+/g, " ");

    if (title.length > 55) {
        title =
            title.substring(0, 55).trim() + "...";
    }

    return title;
}


/* ============================================================
   CREATE CHAT OBJECT
============================================================ */

function createChatObject() {

    return {

        id:
            window.volbyCurrentChatId ||
            Date.now(),

        title:
            getChatTitle(messages),

        messages:
            messages.map(message => ({
                role:
                    message.role,

                content:
                    message.content
            })),

        model:
            selectedModel,

        updatedAt:
            Date.now()

    };

}


/* ============================================================
   SAVE CHAT HISTORY
============================================================ */

function saveChatHistory() {

    if (!Array.isArray(chatHistory)) {
        chatHistory = [];
    }

    if (!messages.length) {
        return;
    }

    const chat =
        createChatObject();

    window.volbyCurrentChatId =
        chat.id;

    const existingIndex =
        chatHistory.findIndex(
            item =>
                item.id === chat.id
        );

    if (existingIndex >= 0) {

        chatHistory[existingIndex] =
            chat;

    } else {

        chatHistory.unshift(
            chat
        );

    }

    /* Keep the newest 50 conversations */

    chatHistory =
        chatHistory
            .sort(
                (a, b) =>
                    (b.updatedAt || 0) -
                    (a.updatedAt || 0)
            )
            .slice(0, 50);

    setStorage(
        "volby_chat_history",
        chatHistory
    );

    renderChatHistory();

}


/* ============================================================
   SAVE CURRENT CHAT
============================================================ */

function saveCurrentChat() {

    saveChatHistory();

}


/* ============================================================
   CREATE HISTORY ITEM
============================================================ */

function createHistoryItem(chat) {

    const item =
        document.createElement("button");

    item.type =
        "button";

    item.className =
        "history-item";

    item.dataset.chatId =
        chat.id;


    if (
        chat.id ===
        window.volbyCurrentChatId
    ) {

        item.classList.add(
            "active"
        );

    }


    const icon =
        document.createElement("span");

    icon.className =
        "history-item-icon";

    icon.textContent =
        "◌";


    const title =
        document.createElement("span");

    title.className =
        "history-item-title";

    title.textContent =
        chat.title ||
        "Conversation";


    item.appendChild(
        icon
    );

    item.appendChild(
        title
    );


    /* -----------------------------------------
       Click
    ----------------------------------------- */

    item.addEventListener(
        "click",
        () => {

            loadChat(
                chat.id
            );

        }
    );


    /* -----------------------------------------
       Long press / context menu
    ----------------------------------------- */

    item.addEventListener(
        "contextmenu",
        event => {

            event.preventDefault();

            const confirmed =
                confirm(
                    "Delete this conversation?"
                );

            if (confirmed) {

                deleteChat(
                    chat.id
                );

            }

        }
    );


    return item;

}


/* ============================================================
   RENDER CHAT HISTORY
============================================================ */

function renderChatHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML =
        "";


    if (
        !Array.isArray(chatHistory) ||
        chatHistory.length === 0
    ) {

        if (emptyHistory) {

            emptyHistory.style.display =
                "";

            historyList.appendChild(
                emptyHistory
            );

        }

        return;

    }


    if (emptyHistory) {

        emptyHistory.style.display =
            "none";

    }


    chatHistory
        .sort(
            (a, b) =>
                (b.updatedAt || 0) -
                (a.updatedAt || 0)
        )
        .forEach(chat => {

            historyList.appendChild(
                createHistoryItem(chat)
            );

        });

}


/* ============================================================
   LOAD CHAT
============================================================ */

function loadChat(chatId) {

    const chat =
        chatHistory.find(
            item =>
                item.id === chatId
        );


    if (!chat) {
        return;
    }


    window.volbyCurrentChatId =
        chat.id;


    messages =
        Array.isArray(chat.messages)
            ? chat.messages.map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            )
            : [];


    /* -----------------------------------------
       Restore selected model
    ----------------------------------------- */

    if (
        chat.model === "openrouter" ||
        chat.model === "groq"
    ) {

        selectedModel =
            chat.model;

        try {

            localStorage.setItem(
                MODEL_STORAGE_KEY,
                selectedModel
            );

        } catch (error) {

            console.error(
                "Model restore error:",
                error
            );

        }

    }


    updateModelSelectorUI();


    /* -----------------------------------------
       Rebuild message area
    ----------------------------------------- */

    messagesContainer.innerHTML =
        "";


    if (!messages.length) {

        messagesContainer.appendChild(
            welcomeScreen
        );

        welcomeScreen.style.display =
            "";

    } else {

        if (welcomeScreen) {

            welcomeScreen.style.display =
                "none";

        }


        messages.forEach(
            message => {

                addMessageToUI(
                    message.role,
                    message.content
                );

            }
        );

    }


    renderChatHistory();


    closeSidebarMenu();


    requestAnimationFrame(
        () => {

            scrollToBottom();

        }
    );

}


/* ============================================================
   DELETE CHAT
============================================================ */

function deleteChat(chatId) {

    chatHistory =
        chatHistory.filter(
            chat =>
                chat.id !== chatId
        );


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    if (
        window.volbyCurrentChatId ===
        chatId
    ) {

        window.volbyCurrentChatId =
            null;

        messages =
            [];

        messagesContainer.innerHTML =
            "";

        messagesContainer.appendChild(
            welcomeScreen
        );

        welcomeScreen.style.display =
            "";

    }


    renderChatHistory();

}


/* ============================================================
   NEW CHAT
============================================================ */

function startNewChat() {

    window.volbyCurrentChatId =
        null;

    messages =
        [];


    messagesContainer.innerHTML =
        "";


    messagesContainer.appendChild(
        welcomeScreen
    );


    welcomeScreen.style.display =
        "";


    input.value =
        "";


    updateCharacterCount();

    autoResize();


    renderChatHistory();


    closeSidebarMenu();


    input.focus();

}


/* ============================================================
   NEW CHAT BUTTON
============================================================ */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        startNewChat
    );

}


/* ============================================================
   SIDEBAR
============================================================ */

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }

    document.body.classList.add(
        "sidebar-open"
    );

}


function closeSidebarMenu() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

    document.body.classList.remove(
        "sidebar-open"
    );

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (closeSidebar) {

    closeSidebar.addEventListener(
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
/* ============================================================
   SCRIPT.JS — CHUNK 4B/6
   VOLBY AI — INPUT + UI INTERACTIONS
============================================================ */


/* ============================================================
   INPUT CHARACTER COUNT
============================================================ */

function updateCharacterCount() {

    if (!characterCount || !input) {
        return;
    }

    characterCount.textContent =
        `${input.value.length} / 10000`;

}


/* ============================================================
   AUTO RESIZE TEXTAREA
============================================================ */

function autoResize() {

    if (!input) {
        return;
    }

    input.style.height =
        "auto";

    const newHeight =
        Math.min(
            input.scrollHeight,
            180
        );

    input.style.height =
        newHeight + "px";

}


/* ============================================================
   INPUT EVENTS
============================================================ */

if (input) {

    input.addEventListener(
        "input",
        () => {

            updateCharacterCount();

            autoResize();

        }
    );

}


/* ============================================================
   SUGGESTION BUTTONS
============================================================ */

if (suggestions) {

    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    const prompt =
                        suggestion.dataset.prompt ||
                        suggestion.textContent.trim();


                    if (!input) {
                        return;
                    }


                    input.value =
                        prompt;


                    updateCharacterCount();

                    autoResize();

                    input.focus();

                }
            );

        }
    );

}


/* ============================================================
   THEME SYSTEM
============================================================ */

function setTheme(theme) {

    if (!theme) {
        return;
    }


    body.dataset.theme =
        theme;


    try {

        localStorage.setItem(
            "volby_theme",
            theme
        );

    } catch (error) {

        console.error(
            "Theme storage error:",
            error
        );

    }


    if (themeButtons) {

        themeButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.theme ===
                        theme
                );

            }
        );

    }

}


/* ============================================================
   LOAD SAVED THEME
============================================================ */

let savedTheme =
    "midnight";


try {

    savedTheme =
        localStorage.getItem(
            "volby_theme"
        ) ||
        "midnight";

} catch (error) {

    console.error(
        "Theme read error:",
        error
    );

}


setTheme(
    savedTheme
);


/* ============================================================
   THEME BUTTONS
============================================================ */

if (themeButtons) {

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
   ABOUT MODAL
============================================================ */

function openAboutModal() {

    if (!aboutModal) {
        return;
    }

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

    aboutModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


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


/* ============================================================
   ESC KEY
============================================================ */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAboutModal();

            closeSidebarMenu();

        }

    }
);


/* ============================================================
   SCROLL HELPERS
============================================================ */

function scrollToBottom() {

    if (!messagesContainer) {
        return;
    }


    requestAnimationFrame(
        () => {

            messagesContainer.scrollTo({

                top:
                    messagesContainer.scrollHeight,

                behavior:
                    "smooth"

            });

        }
    );

}


/* ============================================================
   LOADING / THINKING UI
============================================================ */

function addLoadingMessage() {

    if (!messagesContainer) {
        return null;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper loading-wrapper";


    wrapper.dataset.role =
        "assistant";


    /* -----------------------------------------
       Avatar
    ----------------------------------------- */

    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    const logo =
        document.createElement("img");


    logo.src =
        "volby-logo.png";


    logo.alt =
        "Volby";


    logo.className =
        "message-avatar-logo";


    avatar.appendChild(
        logo
    );


    /* -----------------------------------------
       Content
    ----------------------------------------- */

    const contentWrapper =
        document.createElement("div");


    contentWrapper.className =
        "message-content-wrapper";


    const header =
        document.createElement("div");


    header.className =
        "message-header";


    const name =
        document.createElement("span");


    name.className =
        "message-name";


    name.textContent =
        "Volby";


    header.appendChild(
        name
    );


    contentWrapper.appendChild(
        header
    );


    /* -----------------------------------------
       Thinking bubble
    ----------------------------------------- */

    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble thinking-bubble";


    const thinkingText =
        document.createElement("span");


    thinkingText.className =
        "thinking-text";


    thinkingText.textContent =
        "Thinking";


    bubble.appendChild(
        thinkingText
    );


    const dots =
        document.createElement("span");


    dots.className =
        "thinking-dots";


    dots.innerHTML =
        "<i></i><i></i><i></i>";


    bubble.appendChild(
        dots
    );


    contentWrapper.appendChild(
        bubble
    );


    wrapper.appendChild(
        avatar
    );


    wrapper.appendChild(
        contentWrapper
    );


    messagesContainer.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


/* ============================================================
   FRIENDLY BACKEND ERRORS
============================================================ */

function getFriendlyErrorMessage(error) {

    const raw =
        String(
            error?.message ||
            ""
        );


    const lower =
        raw.toLowerCase();


    if (
        lower.includes(
            "failed to fetch"
        ) ||
        lower.includes(
            "networkerror"
        ) ||
        lower.includes(
            "network error"
        )
    ) {

        return (
            "Sorry, I couldn't connect to Volby right now. " +
            "Please check your internet connection and try again."
        );

    }


    if (
        lower.includes(
            "model_not_found"
        ) ||
        lower.includes(
            "model does not exist"
        )
    ) {

        return (
            "The selected Volby model is currently unavailable. " +
            "Please switch to another model and try again."
        );

    }


    if (
        lower.includes(
            "500"
        )
    ) {

        return (
            "Volby's server encountered an error. " +
            "Please try again in a moment."
        );

    }


    if (raw) {
        return raw;
    }


    return (
        "Something went wrong while connecting to Volby."
    );

}


/* ============================================================
   SEND BUTTON STATE
============================================================ */

function setSendingState(isSending) {

    if (!sendButton) {
        return;
    }


    sendButton.disabled =
        Boolean(isSending);


    sendButton.classList.toggle(
        "sending",
        Boolean(isSending)
    );

}


/* ============================================================
   INITIAL INPUT STATE
============================================================ */

updateCharacterCount();

autoResize();


/* ============================================================
   PREVENT ACCIDENTAL FORM SUBMISSION
============================================================ */

if (input) {

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    typeof sendMessage ===
                    "function"
                ) {

                    sendMessage();

                }

            }

        }
    );

}


/* ============================================================
   MOBILE KEYBOARD FRIENDLY BEHAVIOUR
============================================================ */

if (input) {

    input.addEventListener(
        "focus",
        () => {

            document.body.classList.add(
                "input-focused"
            );

        }
    );


    input.addEventListener(
        "blur",
        () => {

            document.body.classList.remove(
                "input-focused"
            );

        }
    );

}


/* ============================================================
   INITIAL HISTORY
============================================================ */

renderChatHistory();


/* ============================================================
   INITIAL MODEL SELECTOR
============================================================ */

createModelSelector();


/* ============================================================
   INITIAL FOCUS
============================================================ */

if (
    input &&
    window.innerWidth > 700
) {

    setTimeout(
        () => {

            input.focus();

        },
        300
    );

}
/* ============================================================
   SCRIPT.JS — CHUNK 5A/6
   VOLBY AI — MARKDOWN + MESSAGE RENDERING
============================================================ */


/* ============================================================
   MARKDOWN RESPONSE FORMATTER
============================================================ */

function formatAIResponse(content) {

    const fragment =
        document.createDocumentFragment();

    const parts =
        String(content)
            .split(/(```[\s\S]*?```)/g);


    parts.forEach(part => {

        if (
            part.startsWith("```") &&
            part.endsWith("```")
        ) {

            createCodeBlock(
                part,
                fragment
            );

        } else {

            createTextContent(
                part,
                fragment
            );

        }

    });


    return fragment;

}


/* ============================================================
   TEXT CONTENT
============================================================ */

function createTextContent(
    text,
    container
) {

    if (
        !text ||
        text.trim() === ""
    ) {

        return;

    }


    const lines =
        text.split("\n");


    let currentList = null;


    lines.forEach(line => {

        const trimmed =
            line.trim();


        /* -----------------------------------------
           BULLET LIST
        ----------------------------------------- */

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

                currentList.className =
                    "ai-list";

                container.appendChild(
                    currentList
                );

            }


            const li =
                document.createElement("li");


            li.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(2)
                )
            );


            currentList.appendChild(
                li
            );


            return;

        }


        /* -----------------------------------------
           NUMBERED LIST
        ----------------------------------------- */

        const numbered =
            trimmed.match(
                /^\d+\.\s+(.*)/
            );


        if (numbered) {

            if (
                !currentList ||
                currentList.tagName !== "OL"
            ) {

                currentList =
                    document.createElement("ol");

                currentList.className =
                    "ai-list";

                container.appendChild(
                    currentList
                );

            }


            const li =
                document.createElement("li");


            li.appendChild(
                formatInlineMarkdown(
                    numbered[1]
                )
            );


            currentList.appendChild(
                li
            );


            return;

        }


        currentList = null;


        /* -----------------------------------------
           HEADINGS
        ----------------------------------------- */

        if (
            trimmed.startsWith("### ")
        ) {

            const heading =
                document.createElement("h4");


            heading.className =
                "ai-heading";


            heading.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(4)
                )
            );


            container.appendChild(
                heading
            );


            return;

        }


        if (
            trimmed.startsWith("## ")
        ) {

            const heading =
                document.createElement("h3");


            heading.className =
                "ai-heading";


            heading.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(3)
                )
            );


            container.appendChild(
                heading
            );


            return;

        }


        if (
            trimmed.startsWith("# ")
        ) {

            const heading =
                document.createElement("h2");


            heading.className =
                "ai-heading";


            heading.appendChild(
                formatInlineMarkdown(
                    trimmed.substring(2)
                )
            );


            container.appendChild(
                heading
            );


            return;

        }


        /* -----------------------------------------
           EMPTY LINE
        ----------------------------------------- */

        if (
            trimmed === ""
        ) {

            const spacer =
                document.createElement("div");


            spacer.className =
                "text-spacer";


            container.appendChild(
                spacer
            );


            return;

        }


        /* -----------------------------------------
           NORMAL PARAGRAPH
        ----------------------------------------- */

        const paragraph =
            document.createElement("p");


        paragraph.className =
            "ai-paragraph";


        paragraph.appendChild(
            formatInlineMarkdown(
                line
            )
        );


        container.appendChild(
            paragraph
        );

    });

}


/* ============================================================
   INLINE MARKDOWN
============================================================ */

function formatInlineMarkdown(text) {

    const fragment =
        document.createDocumentFragment();


    const value =
        String(text);


    /*
       Handle bold, inline code and italic text
       without injecting raw HTML.
    */

    const parts =
        value.split(
            /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
        );


    parts.forEach(part => {

        if (
            part.startsWith("`") &&
            part.endsWith("`")
        ) {

            const code =
                document.createElement("code");


            code.className =
                "inline-code";


            code.textContent =
                part.substring(
                    1,
                    part.length - 1
                );


            fragment.appendChild(
                code
            );


            return;

        }


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


            fragment.appendChild(
                bold
            );


            return;

        }


        if (
            part.startsWith("*") &&
            part.endsWith("*") &&
            part.length > 2
        ) {

            const italic =
                document.createElement("em");


            italic.textContent =
                part.substring(
                    1,
                    part.length - 1
                );


            fragment.appendChild(
                italic
            );


            return;

        }


        fragment.appendChild(
            document.createTextNode(
                part
            )
        );

    });


    return fragment;

}


/* ============================================================
   CODE BLOCK
============================================================ */

function createCodeBlock(
    codePart,
    container
) {

    let code =
        codePart
            .replace(/^```/, "")
            .replace(/```$/, "");


    let language =
        "Code";


    const firstNewLine =
        code.indexOf("\n");


    if (
        firstNewLine !== -1
    ) {

        const possibleLanguage =
            code
                .substring(
                    0,
                    firstNewLine
                )
                .trim();


        if (
            /^[a-zA-Z0-9+#._-]+$/.test(
                possibleLanguage
            )
        ) {

            language =
                possibleLanguage;


            code =
                code.substring(
                    firstNewLine + 1
                );

        }

    }


    code =
        code.trim();


    /* -----------------------------------------
       CODE WRAPPER
    ----------------------------------------- */

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "code-block";


    /* -----------------------------------------
       HEADER
    ----------------------------------------- */

    const header =
        document.createElement("div");


    header.className =
        "code-header";


    const languageLabel =
        document.createElement("span");


    languageLabel.className =
        "code-language";


    languageLabel.textContent =
        language;


    const copyButton =
        document.createElement("button");


    copyButton.type =
        "button";


    copyButton.className =
        "code-copy-button";


    copyButton.textContent =
        "Copy";


    /* -----------------------------------------
       COPY CODE
    ----------------------------------------- */

    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    code
                );


                copyButton.textContent =
                    "Copied!";


                copyButton.classList.add(
                    "copied"
                );


                setTimeout(
                    () => {

                        copyButton.textContent =
                            "Copy";


                        copyButton.classList.remove(
                            "copied"
                        );

                    },
                    1800
                );


            } catch (error) {

                console.error(
                    "Clipboard error:",
                    error
                );


                /*
                   Fallback for browsers/WebViews
                   where clipboard API is unavailable.
                */

                try {

                    const textarea =
                        document.createElement(
                            "textarea"
                        );


                    textarea.value =
                        code;


                    textarea.style.position =
                        "fixed";


                    textarea.style.opacity =
                        "0";


                    document.body.appendChild(
                        textarea
                    );


                    textarea.focus();

                    textarea.select();


                    document.execCommand(
                        "copy"
                    );


                    textarea.remove();


                    copyButton.textContent =
                        "Copied!";


                    setTimeout(
                        () => {

                            copyButton.textContent =
                                "Copy";

                        },
                        1800
                    );

                } catch (fallbackError) {

                    console.error(
                        "Copy fallback error:",
                        fallbackError
                    );

                }

            }

        }
    );


    header.appendChild(
        languageLabel
    );


    header.appendChild(
        copyButton
    );


    /* -----------------------------------------
       CODE ELEMENT
    ----------------------------------------- */

    const pre =
        document.createElement("pre");


    pre.className =
        "code-pre";


    const codeElement =
        document.createElement("code");


    codeElement.textContent =
        code;


    codeElement.className =
        `language-${language.toLowerCase()}`;


    pre.appendChild(
        codeElement
    );


    wrapper.appendChild(
        header
    );


    wrapper.appendChild(
        pre
    );


    container.appendChild(
        wrapper
    );

}


/* ============================================================
   MESSAGE ID GENERATOR
============================================================ */

function generateMessageId() {

    return (
        "msg_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* ============================================================
   ADD USER MESSAGE
============================================================ */

function addUserMessage(
    content
) {

    if (!messagesContainer) {
        return null;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper user-message-wrapper";


    wrapper.dataset.role =
        "user";


    wrapper.dataset.messageId =
        generateMessageId();


    /* -----------------------------------------
       Content
    ----------------------------------------- */

    const contentWrapper =
        document.createElement("div");


    contentWrapper.className =
        "message-content-wrapper user-content-wrapper";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble user-bubble";


    const paragraph =
        document.createElement("p");


    paragraph.className =
        "user-message-text";


    paragraph.textContent =
        content;


    bubble.appendChild(
        paragraph
    );


    contentWrapper.appendChild(
        bubble
    );


    /* -----------------------------------------
       Avatar
    ----------------------------------------- */

    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar user-avatar";


    avatar.textContent =
        "You";


    wrapper.appendChild(
        contentWrapper
    );


    wrapper.appendChild(
        avatar
    );


    messagesContainer.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


/* ============================================================
   ADD ASSISTANT MESSAGE
============================================================ */

function addAssistantMessage(
    content,
    modelUsed
) {

    if (!messagesContainer) {
        return null;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper assistant-message-wrapper";


    wrapper.dataset.role =
        "assistant";


    wrapper.dataset.messageId =
        generateMessageId();


    /* -----------------------------------------
       Avatar
    ----------------------------------------- */

    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    const logo =
        document.createElement("img");


    logo.src =
        "volby-logo.png";


    logo.alt =
        "Volby";


    logo.className =
        "message-avatar-logo";


    avatar.appendChild(
        logo
    );


    /* -----------------------------------------
       Content
    ----------------------------------------- */

    const contentWrapper =
        document.createElement("div");


    contentWrapper.className =
        "message-content-wrapper";


    /* -----------------------------------------
       Header
    ----------------------------------------- */

    const header =
        document.createElement("div");


    header.className =
        "message-header";


    const name =
        document.createElement("span");


    name.className =
        "message-name";


    name.textContent =
        "Volby";


    header.appendChild(
        name
    );


    if (modelUsed) {

        const modelBadge =
            document.createElement("span");


        modelBadge.className =
            "model-badge";


        modelBadge.textContent =
            modelUsed;


        header.appendChild(
            modelBadge
        );

    }


    /* -----------------------------------------
       Response bubble
    ----------------------------------------- */

    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble assistant-bubble";


    bubble.appendChild(
        formatAIResponse(
            content
        )
    );


    contentWrapper.appendChild(
        header
    );


    contentWrapper.appendChild(
        bubble
    );


    wrapper.appendChild(
        avatar
    );


    wrapper.appendChild(
        contentWrapper
    );


    messagesContainer.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}
/* ============================================================
   SCRIPT.JS — CHUNK 5B/6
   VOLBY AI — MESSAGE ACTIONS + HISTORY
============================================================ */


/* ============================================================
   ADD MESSAGE ACTIONS
============================================================ */

function addMessageActions(
    bubble,
    content,
    role
) {

    if (!bubble) {
        return;
    }


    const actions =
        document.createElement("div");


    actions.className =
        "message-actions";


    /* -----------------------------------------
       COPY
    ----------------------------------------- */

    const copyButton =
        document.createElement("button");


    copyButton.type =
        "button";


    copyButton.className =
        "message-action";


    copyButton.textContent =
        "Copy";


    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    String(content)
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


            } catch (error) {

                console.error(
                    "Message copy error:",
                    error
                );

            }

        }
    );


    actions.appendChild(
        copyButton
    );


    /* -----------------------------------------
       REGENERATE — ASSISTANT ONLY
    ----------------------------------------- */

    if (
        role === "assistant"
    ) {

        const regenerateButton =
            document.createElement("button");


        regenerateButton.type =
            "button";


        regenerateButton.className =
            "message-action";


        regenerateButton.textContent =
            "Regenerate";


        regenerateButton.addEventListener(
            "click",
            () => {

                if (
                    typeof regenerateLastResponse ===
                    "function"
                ) {

                    regenerateLastResponse();

                }

            }
        );


        actions.appendChild(
            regenerateButton
        );

    }


    bubble.appendChild(
        actions
    );

}


/* ============================================================
   ADD ACTIONS TO ASSISTANT MESSAGE
============================================================ */

function addAssistantMessageWithActions(
    content,
    modelUsed
) {

    const wrapper =
        addAssistantMessage(
            content,
            modelUsed
        );


    if (!wrapper) {
        return null;
    }


    const bubble =
        wrapper.querySelector(
            ".assistant-bubble"
        );


    if (bubble) {

        addMessageActions(
            bubble,
            content,
            "assistant"
        );

    }


    return wrapper;

}


/* ============================================================
   ADD ACTIONS TO USER MESSAGE
============================================================ */

function addUserMessageWithActions(
    content
) {

    const wrapper =
        addUserMessage(
            content
        );


    if (!wrapper) {
        return null;
    }


    const bubble =
        wrapper.querySelector(
            ".user-bubble"
        );


    if (bubble) {

        addMessageActions(
            bubble,
            content,
            "user"
        );

    }


    return wrapper;

}


/* ============================================================
   CHAT TITLE GENERATOR
============================================================ */

function generateChatTitle(
    text
) {

    const clean =
        String(text || "")
            .replace(/\s+/g, " ")
            .trim();


    if (!clean) {
        return "New Chat";
    }


    if (clean.length <= 42) {
        return clean;
    }


    return (
        clean.substring(0, 42)
        .trim() +
        "…"
    );

}


/* ============================================================
   SAVE CHAT HISTORY
============================================================ */

function saveChatHistory() {

    try {

        setStorage(
            "volby_chat_history",
            chatHistory
        );


        renderChatHistory();

    } catch (error) {

        console.error(
            "Chat history save error:",
            error
        );

    }

}


/* ============================================================
   CREATE HISTORY ENTRY
============================================================ */

function createHistoryEntry(
    userMessage
) {

    const entry = {

        id:
            "chat_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title:
            generateChatTitle(
                userMessage
            ),

        messages:
            messages.map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            ),

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    chatHistory.unshift(
        entry
    );


    /*
       Keep local history manageable.
       This prevents localStorage from becoming
       unnecessarily large.
    */

    if (
        chatHistory.length > 50
    ) {

        chatHistory =
            chatHistory.slice(
                0,
                50
            );

    }


    saveChatHistory();


    return entry;

}


/* ============================================================
   UPDATE CURRENT CHAT HISTORY
============================================================ */

function updateCurrentChatHistory() {

    if (
        !messages.length
    ) {

        return;

    }


    const firstUserMessage =
        messages.find(
            message =>
                message.role ===
                "user"
        );


    if (!firstUserMessage) {
        return;
    }


    let currentEntry =
        chatHistory[0];


    /*
       If there is no current history item,
       create one.
    */

    if (
        !currentEntry ||
        currentEntry._active !== true
    ) {

        currentEntry =
            createHistoryEntry(
                firstUserMessage.content
            );

    }


    currentEntry.messages =
        messages.map(
            message => ({
                role:
                    message.role,

                content:
                    message.content
            })
        );


    currentEntry.updatedAt =
        Date.now();


    currentEntry._active =
        true;


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    renderChatHistory();

}


/* ============================================================
   HISTORY LIST
============================================================ */

function renderChatHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML =
        "";


    if (
        !Array.isArray(chatHistory) ||
        chatHistory.length === 0
    ) {

        if (emptyHistory) {

            emptyHistory.style.display =
                "";

        }

        return;

    }


    if (emptyHistory) {

        emptyHistory.style.display =
            "none";

    }


    chatHistory.forEach(
        (chat, index) => {

            const item =
                document.createElement("button");


            item.type =
                "button";


            item.className =
                "history-item";


            item.dataset.index =
                String(index);


            const icon =
                document.createElement("span");


            icon.className =
                "history-item-icon";


            icon.textContent =
                "◌";


            const title =
                document.createElement("span");


            title.className =
                "history-item-title";


            title.textContent =
                chat.title ||
                "New Chat";


            item.appendChild(
                icon
            );


            item.appendChild(
                title
            );


            item.addEventListener(
                "click",
                () => {

                    loadChatFromHistory(
                        index
                    );

                }
            );


            historyList.appendChild(
                item
            );

        }
    );

}


/* ============================================================
   LOAD CHAT FROM HISTORY
============================================================ */

function loadChatFromHistory(
    index
) {

    const chat =
        chatHistory[index];


    if (!chat) {
        return;
    }


    messages =
        Array.isArray(
            chat.messages
        )
            ? chat.messages.map(
                message => ({
                    role:
                        message.role,

                    content:
                        message.content
                })
            )
            : [];


    if (!messagesContainer) {
        return;
    }


    messagesContainer.innerHTML =
        "";


    if (
        messages.length === 0
    ) {

        if (welcomeScreen) {

            messagesContainer.appendChild(
                welcomeScreen
            );

            welcomeScreen.style.display =
                "";

        }

    } else {

        if (welcomeScreen) {

            welcomeScreen.style.display =
                "none";

        }


        messages.forEach(
            message => {

                if (
                    message.role ===
                    "user"
                ) {

                    addUserMessage(
                        message.content
                    );

                } else if (
                    message.role ===
                    "assistant"
                ) {

                    addAssistantMessage(
                        message.content,
                        selectedModel ===
                            "openrouter"
                            ? "Volby Pro"
                            : "Volby"
                    );

                }

            }
        );

    }


    chat._active =
        true;


    chatHistory.forEach(
        (item, itemIndex) => {

            item._active =
                itemIndex === index;

        }
    );


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    closeSidebarMenu();

    scrollToBottom();

}


/* ============================================================
   CLEAR CURRENT CHAT
============================================================ */

function clearCurrentChat() {

    messages = [];


    if (messagesContainer) {

        messagesContainer.innerHTML =
            "";


        if (welcomeScreen) {

            messagesContainer.appendChild(
                welcomeScreen
            );


            welcomeScreen.style.display =
                "";

        }

    }


    if (input) {

        input.value =
            "";

        updateCharacterCount();

        autoResize();

    }


    /*
       Mark previous history entries inactive.
    */

    chatHistory.forEach(
        chat => {

            chat._active =
                false;

        }
    );


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    renderChatHistory();

}


/* ============================================================
   DELETE HISTORY ITEM
============================================================ */

function deleteHistoryItem(
    index
) {

    if (
        index < 0 ||
        index >= chatHistory.length
    ) {

        return;

    }


    chatHistory.splice(
        index,
        1
    );


    setStorage(
        "volby_chat_history",
        chatHistory
    );


    renderChatHistory();

}


/* ============================================================
   NEW CHAT BUTTON
============================================================ */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        () => {

            clearCurrentChat();

            closeSidebarMenu();

            if (input) {
                input.focus();
            }

        }
    );

}


/* ============================================================
   PREPARE MESSAGE ARRAY
============================================================ */

function addConversationMessage(
    role,
    content
) {

    messages.push({

        role:
            role,

        content:
            String(content)

    });

}


/* ============================================================
   GET CURRENT CONVERSATION
============================================================ */

function getConversationMessages() {

    return messages.map(
        message => ({

            role:
                message.role,

            content:
                message.content

        })
    );

}


/* ============================================================
   GET LAST USER MESSAGE
============================================================ */

function getLastUserMessage() {

    for (
        let i = messages.length - 1;
        i >= 0;
        i--
    ) {

        if (
            messages[i].role ===
            "user"
        ) {

            return messages[i];

        }

    }


    return null;

}


/* ============================================================
   REGENERATE PLACEHOLDER
============================================================ */

async function regenerateLastResponse() {

    const lastUser =
        getLastUserMessage();


    if (!lastUser) {

        return;

    }


    /*
       Remove the most recent assistant response
       from the local conversation.
    */

    while (
        messages.length > 0 &&
        messages[messages.length - 1]
            .role === "assistant"
    ) {

        messages.pop();

    }


    /*
       Re-use the main send function if available.
    */

    if (
        typeof requestAIResponse ===
        "function"
    ) {

        await requestAIResponse(
            true
        );

    }

}
/* ============================================================
   SCRIPT.JS — CHUNK 6/6
   VOLBY AI — API + SEND FLOW + INITIALIZATION
============================================================ */


/* ============================================================
   API REQUEST
============================================================ */

async function requestAIResponse(
    isRegeneration = false
) {

    if (!messages.length) {
        return;
    }


    const thinkingMessage =
        addLoadingMessage();


    setSendingState(true);


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

                        messages:
                            getConversationMessages(),

                        model:
                            selectedModel

                    })

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Invalid JSON response:",
                jsonError
            );

        }


        if (!response.ok) {

            const serverError =
                data?.detail ||
                data?.error ||
                `Server returned ${response.status}`;

            throw new Error(
                String(serverError)
            );

        }


        const answer =
            data?.response ||
            data?.message ||
            data?.answer;


        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {

            throw new Error(
                "Volby returned an empty response."
            );

        }


        /* -----------------------------------------
           Remove thinking indicator
        ----------------------------------------- */

        if (thinkingMessage) {

            thinkingMessage.remove();

        }


        /* -----------------------------------------
           Add assistant response
        ----------------------------------------- */

        addConversationMessage(
            "assistant",
            answer
        );


        addAssistantMessageWithActions(
            answer,
            data?.model_used ||
                (
                    selectedModel ===
                    "openrouter"
                        ? "Volby Pro"
                        : "Volby"
                )
        );


        /* -----------------------------------------
           Save conversation
        ----------------------------------------- */

        updateCurrentChatHistory();


        scrollToBottom();


    } catch (error) {

        console.error(
            "Volby API error:",
            error
        );


        if (thinkingMessage) {

            thinkingMessage.remove();

        }


        const errorMessage =
            getFriendlyErrorMessage(
                error
            );


        addAssistantMessageWithActions(
            errorMessage,
            "Volby"
        );


    } finally {

        setSendingState(false);


        if (input) {

            input.focus();

        }

    }

}


/* ============================================================
   SEND MESSAGE
============================================================ */

async function sendMessage() {

    if (!input) {
        return;
    }


    if (
        sendButton &&
        sendButton.disabled
    ) {

        return;

    }


    const text =
        input.value.trim();


    if (!text) {

        input.focus();

        return;

    }


    /*
       Protect the frontend from accidentally
       sending extremely large requests.
    */

    if (
        text.length > 10000
    ) {

        alert(
            "Your message is too long. Please keep it under 10,000 characters."
        );

        return;

    }


    /* -----------------------------------------
       Hide welcome screen
    ----------------------------------------- */

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }


    /* -----------------------------------------
       Add user message to state
    ----------------------------------------- */

    addConversationMessage(
        "user",
        text
    );


    /* -----------------------------------------
       Render user message
    ----------------------------------------- */

    addUserMessageWithActions(
        text
    );


    /* -----------------------------------------
       Clear input
    ----------------------------------------- */

    input.value =
        "";

    updateCharacterCount();

    autoResize();


    /* -----------------------------------------
       Create history entry
       before requesting AI
    ----------------------------------------- */

    if (
        messages.length === 1
    ) {

        createHistoryEntry(
            text
        );

    }


    scrollToBottom();


    /* -----------------------------------------
       Request AI
    ----------------------------------------- */

    await requestAIResponse();

}


/* ============================================================
   SEND BUTTON
============================================================ */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => {

            sendMessage();

        }
    );

}


/* ============================================================
   SUGGESTION PROMPTS
============================================================ */

if (suggestions) {

    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    const prompt =
                        suggestion.dataset.prompt ||
                        suggestion.getAttribute(
                            "data-prompt"
                        ) ||
                        suggestion.textContent.trim();


                    if (!prompt || !input) {
                        return;
                    }


                    input.value =
                        prompt;


                    updateCharacterCount();

                    autoResize();

                    input.focus();

                }
            );

        }
    );

}


/* ============================================================
   SIDEBAR EVENTS
============================================================ */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (closeSidebar) {

    closeSidebar.addEventListener(
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


/* ============================================================
   NEW CHAT
============================================================ */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        () => {

            clearCurrentChat();

            closeSidebarMenu();

            if (input) {

                input.focus();

            }

        }
    );

}


/* ============================================================
   MOBILE SIDEBAR — CLOSE AFTER HISTORY CLICK
============================================================ */

if (historyList) {

    historyList.addEventListener(
        "click",
        event => {

            const item =
                event.target.closest(
                    ".history-item"
                );


            if (!item) {
                return;
            }


            closeSidebarMenu();

        }
    );

}


/* ============================================================
   MODEL CHANGE VISUAL FEEDBACK
============================================================ */

function showModelChangedFeedback(
    model
) {

    const selectedOption =
        MODEL_OPTIONS.find(
            option =>
                option.value === model
        );


    if (!selectedOption) {
        return;
    }


    /*
       Small temporary toast.
    */

    const oldToast =
        document.getElementById(
            "volby-model-toast"
        );


    if (oldToast) {
        oldToast.remove();
    }


    const toast =
        document.createElement("div");


    toast.id =
        "volby-model-toast";


    toast.className =
        "volby-toast";


    toast.textContent =
        `${selectedOption.label} selected`;


    document.body.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        1600
    );

}


/* ============================================================
   PATCH MODEL SELECTOR FEEDBACK
============================================================ */

const originalSetSelectedModel =
    setSelectedModel;


setSelectedModel =
    function(model) {

        originalSetSelectedModel(
            model
        );


        showModelChangedFeedback(
            model
        );

    };


/* ============================================================
   INITIAL MODEL UI UPDATE
============================================================ */

updateModelSelectorUI();


/* ============================================================
   INITIAL CHAT STATE
============================================================ */

function initializeChatUI() {

    if (!messagesContainer) {
        return;
    }


    /*
       If there is no active conversation,
       show the welcome screen.
    */

    if (
        messages.length === 0 &&
        welcomeScreen
    ) {

        if (
            !messagesContainer.contains(
                welcomeScreen
            )
        ) {

            messagesContainer.appendChild(
                welcomeScreen
            );

        }


        welcomeScreen.style.display =
            "";

    }


    updateCharacterCount();

    autoResize();

}


/* ============================================================
   GLOBAL KEYBOARD SHORTCUTS
============================================================ */

document.addEventListener(
    "keydown",
    event => {

        /*
           Ctrl/Cmd + K
           = focus chat input
        */

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();


            if (input) {

                input.focus();

            }

        }


        /*
           Escape closes sidebar
        */

        if (
            event.key === "Escape"
        ) {

            closeSidebarMenu();

        }

    }
);


/* ============================================================
   ONLINE / OFFLINE STATUS
============================================================ */

window.addEventListener(
    "online",
    () => {

        document.body.classList.remove(
            "offline"
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        document.body.classList.add(
            "offline"
        );

    }
);


if (!navigator.onLine) {

    document.body.classList.add(
        "offline"
    );

}


/* ============================================================
   INITIALIZE AUTHENTICATION
============================================================ */

initializeChatUI();


initializeAuthentication();


/* ============================================================
   VOLBY READY
============================================================ */

console.log(
    "Volby AI initialized successfully."
);

console.log(
    "Selected model:",
    selectedModel
);

console.log(
    "Backend:",
    BACKEND_URL
);


/* ============================================================
   END OF SCRIPT
============================================================ */