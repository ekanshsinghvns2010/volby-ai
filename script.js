/* =========================================================
   VOLBY AI
   FRONTEND + PERSISTENT SUPABASE AUTH
========================================================= */

const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";

const SUPABASE_URL =
    "https://eyxhphclrpmtmikgwmnx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_T5x5nYsNFTznpBdotgxfTQ_x0ITpd38";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   STATE
========================================================= */

let messages = [];

let chatHistory = [];

let currentUser = null;


/* =========================================================
   SAFE STORAGE
========================================================= */

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

    } catch (error) {

        console.error(
            "Storage write error:",
            error
        );
    }
}


chatHistory =
    getStorage(
        "volby_chat_history",
        []
    );


/* =========================================================
   MODEL SELECTION
========================================================= */

const MODEL_STORAGE_KEY =
    "volby_selected_model";


const MODEL_OPTIONS = [

    {
        label: "Volby",
        value: "groq"
    },

    {
        label: "Volby Pro",
        value: "openrouter"
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

    selectedModel =
        model;

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


/* =========================================================
   MODEL SELECTOR
========================================================= */

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


    const currentButton =
        document.createElement("button");

    currentButton.type =
        "button";

    currentButton.id =
        "current-model-button";

    currentButton.className =
        "current-model-button";

    currentButton.setAttribute(
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


            optionButton.innerHTML = `
                <span class="model-option-check">✓</span>
                <span class="model-option-name">
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


/* =========================================================
   MODEL SELECTOR UI
========================================================= */

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


    currentButton.innerHTML = `
        <span>
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


/* =========================================================
   THEME
========================================================= */

function setTheme(theme) {

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