/* ========================================= */
/* VOLBY AI - FRONTEND + SUPABASE AUTH */
/* ========================================= */


/* ========================================= */
/* BACKEND */
/* ========================================= */

const BACKEND_URL =
    "https://volby-ai-backend.onrender.com/chat";


/* ========================================= */
/* SUPABASE */
/* ========================================= */

/*
    Use the values from:
    Supabase → Connect → Framework → Next.js

    The publishable key is safe to use
    in frontend code.

    NEVER put your secret key here.
*/

const SUPABASE_URL =
    "https://eyxhphclrpmtmikgwmnx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_T5x5nYsNFTznpBdotgxfTQ_x0ITpd38";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


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

let currentUser = null;


/* ========================================= */
/* SAFE LOCAL STORAGE */
/* ========================================= */

function getChatHistory() {

    try {

        const saved =
            localStorage.getItem(
                "volby_chat_history"
            );

        if (!saved) {

            return [];

        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Could not load chat history:",
            error
        );

        return [];

    }

}


let chatHistory =
    getChatHistory();


/* ========================================= */
/* SAFE SAVE HISTORY */
/* ========================================= */

function saveChatHistoryToStorage() {

    try {

        localStorage.setItem(

            "volby_chat_history",

            JSON.stringify(
                chatHistory
            )

        );

    } catch (error) {

        console.error(
            "Could not save chat history:",
            error
        );

    }

}


/* ========================================= */
/* THEME */
/* ========================================= */

function getSavedTheme() {

    try {

        return (
            localStorage.getItem(
                "volby_theme"
            ) || "midnight"
        );

    } catch (error) {

        return "midnight";

    }

}


const savedTheme =
    getSavedTheme();


setTheme(
    savedTheme
);


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
            "Could not save theme:",
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
/* AUTH UI */
/* ========================================= */

function createAuthScreen() {

    /*
        Do not create another auth screen
        if one already exists.
    */

    if (
        document.getElementById(
            "volby-auth-screen"
        )
    ) {

        return;

    }


    const authScreen =
        document.createElement(
            "div"
        );


    authScreen.id =
        "volby-auth-screen";


    authScreen.innerHTML = `

        <div class="auth-box">

            <div class="auth-logo">
                <img
                    src="volby-logo.png"
                    alt="Volby AI Logo"
                >
            </div>

            <h2>
                Welcome to Volby AI
            </h2>

            <p class="auth-subtitle">
                Sign in to continue chatting with Volby.
            </p>


            <div
                id="auth-error"
                class="auth-error"
            ></div>


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
                Don't have an account? Sign Up
            </button>


            <p class="auth-note">
                You will stay logged in until you log out.
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


    toggleButton.addEventListener(
        "click",
        () => {

            isSignup =
                !isSignup;


            if (isSignup) {

                submitButton.textContent =
                    "Sign Up";


                toggleButton.textContent =
                    "Already have an account? Log In";

            } else {

                submitButton.textContent =
                    "Log In";


                toggleButton.textContent =
                    "Don't have an account? Sign Up";

            }

        }
    );


    submitButton.addEventListener(
        "click",
        async () => {

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
                        await supabaseClient.auth
                            .signUp({

                                email:
                                    email,

                                password:
                                    password

                            });

                } else {

                    result =
                        await supabaseClient.auth
                            .signInWithPassword({

                                email:
                                    email,

                                password:
                                    password

                            });

                }


                if (
                    result.error
                ) {

                    throw result.error;

                }


                /*
                    If email confirmation is enabled
                    in Supabase, the user may need
                    to confirm their email first.
                */

                if (
                    isSignup &&
                    result.data.user &&
                    !result.data.session
                ) {

                    errorElement.textContent =
                        "Account created. Please check your email to confirm your account.";

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Sign Up";

                    return;

                }


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

            }


            submitButton.disabled =
                false;


            submitButton.textContent =
                isSignup
                    ? "Sign Up"
                    : "Log In";

        }
    );

}


/* ========================================= */
/* AUTHENTICATED UI */
/* ========================================= */

function showAuthenticatedUI() {

    /*
        Make the main app visible.
    */

    document.body.classList.add(
        "authenticated"
    );


    /*
        Add logout button.
    */

    addLogoutButton();

}


/* ========================================= */
/* LOGOUT BUTTON */
/* ========================================= */

function addLogoutButton() {

    if (
        document.getElementById(
            "volby-logout-button"
        )
    ) {

        return;

    }


    const logoutButton =
        document.createElement(
            "button"
        );


    logoutButton.id =
        "volby-logout-button";


    logoutButton.className =
        "about-button";


    logoutButton.innerHTML =
        "↪ Log Out";


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


            const {
                error
            } =
                await supabaseClient.auth
                    .signOut();


            if (
                error
            ) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Could not log out. Please try again."
                );

                return;

            }


            currentUser =
                null;


            logoutButton.remove();


            createAuthScreen();

        }
    );


    const sidebarBottom =
        document.querySelector(
            ".sidebar-bottom"
        );


    if (
        sidebarBottom
    ) {

        sidebarBottom.appendChild(
            logoutButton
        );

    }

}


/* ========================================= */
/* CHECK AUTH SESSION */
/* ========================================= */

async function initializeAuthentication() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (
            error
        ) {

            throw error;

        }


        if (
            data.session &&
            data.session.user
        ) {

            /*
                User is already logged in.

                Supabase automatically restores
                the session after page refresh.
            */

            currentUser =
                data.session.user;


            showAuthenticatedUI();

        } else {

            /*
                No active session.
                Show login/signup.
            */

            createAuthScreen();

        }


    } catch (error) {

        console.error(
            "Session error:",
            error
        );


        createAuthScreen();

    }


    /*
        Listen for future authentication changes.
    */

    supabaseClient.auth
        .onAuthStateChange(
            (
                event,
                session
            ) => {

                if (
                    session &&
                    session.user
                ) {

                    currentUser =
                        session.user;

                } else {

                    currentUser =
                        null;

                }

            }
        );

}


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


        welcomeScreen.style.display =
            "";


        input.value =
            "";


        updateCharacterCount();


        autoResize();


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
/* MARKDOWN FORMATTER */
/* ========================================= */

function formatAIResponse(
    content
) {

    const fragment =
        document.createDocumentFragment();


    const parts =
        content.split(
            /(```[\s\S]*?```)/g
        );


    parts.forEach(
        part => {

            if (
                part.startsWith(
                    "```"
                ) &&
                part.endsWith(
                    "```"
                )
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

        }
    );


    return fragment;

}


/* ========================================= */
/* CREATE NORMAL TEXT */
/* ========================================= */

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
        text.split(
            "\n"
        );


    let currentList =
        null;


    lines.forEach(
        line => {

            const trimmed =
                line.trim();


            if (
                trimmed.startsWith(
                    "- "
                ) ||
                trimmed.startsWith(
                    "* "
                )
            ) {

                if (
                    !currentList ||
                    currentList.tagName !==
                        "UL"
                ) {

                    currentList =
                        document.createElement(
                            "ul"
                        );


                    container.appendChild(
                        currentList
                    );

                }


                const li =
                    document.createElement(
                        "li"
                    );


                li.appendChild(
                    formatInlineMarkdown(
                        trimmed.substring(
                            2
                        )
                    )
                );


                currentList.appendChild(
                    li
                );


                return;

            }


            const numbered =
                trimmed.match(
                    /^\d+\.\s+(.*)/
                );


            if (
                numbered
            ) {

                if (
                    !currentList ||
                    currentList.tagName !==
                        "OL"
                ) {

                    currentList =
                        document.createElement(
                            "ol"
                        );


                    container.appendChild(
                        currentList
                    );

                }


                const li =
                    document.createElement(
                        "li"
                    );


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


            currentList =
                null;


            if (
                trimmed.startsWith(
                    "# "
                )
            ) {

                const heading =
                    document.createElement(
                        "h3"
                    );


                heading.appendChild(
                    formatInlineMarkdown(
                        trimmed.substring(
                            2
                        )
                container.appendChild(
                    heading
                );

                return;

            }


            /* Empty line */

            if (
                trimmed === ""
            ) {

                const spacer =
                    document.createElement(
                        "div"
                    );

                spacer.className =
                    "text-spacer";

                container.appendChild(
                    spacer
                );

                return;

            }


            /* Normal paragraph */

            const paragraph =
                document.createElement(
                    "p"
                );

            paragraph.appendChild(
                formatInlineMarkdown(
                    line
                )
            );

            container.appendChild(
                paragraph
            );

        }
    );

}


/* ========================================= */
/* INLINE MARKDOWN */
/* ========================================= */

function formatInlineMarkdown(
    text
) {

    const fragment =
        document.createDocumentFragment();


    const parts =
        text.split(
            /(\*\*.*?\*\*)/g
        );


    parts.forEach(
        part => {

            if (
                part.startsWith(
                    "**"
                ) &&
                part.endsWith(
                    "**"
                )
            ) {

                const bold =
                    document.createElement(
                        "strong"
                    );

                bold.textContent =
                    part.substring(
                        2,
                        part.length - 2
                    );

                fragment.appendChild(
                    bold
                );

            } else {

                fragment.appendChild(
                    document.createTextNode(
                        part
                    )
                );

            }

        }
    );


    return fragment;

}


/* ========================================= */
/* CREATE CODE BLOCK */
/* ========================================= */

function createCodeBlock(
    codePart,
    container
) {

    let code =
        codePart
            .replace(
                /^```/,
                ""
            )
            .replace(
                /```$/,
                ""
            );


    let language =
        "Code";


    const firstNewLine =
        code.indexOf(
            "\n"
        );


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
            /^[a-zA-Z0-9+#.-]+$/.test(
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


    /* Code wrapper */

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "code-block";


    /* Code header */

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "code-header";


    /* Language label */

    const languageLabel =
        document.createElement(
            "span"
        );

    languageLabel.className =
        "code-language";

    languageLabel.textContent =
        language;


    /* Copy button */

    const copyButton =
        document.createElement(
            "button"
        );

    copyButton.className =
        "code-copy-button";

    copyButton.textContent =
        "Copy";


    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    code
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
                    "Copy failed:",
                    error
                );

            }

        }
    );


    header.appendChild(
        languageLabel
    );

    header.appendChild(
        copyButton
    );


    /* Code element */

    const pre =
        document.createElement(
            "pre"
        );

    const codeElement =
        document.createElement(
            "code"
        );

    codeElement.textContent =
        code;


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


    if (
        role === "ai"
    ) {

        message.appendChild(
            formatAIResponse(
                content
            )
        );

    } else {

        message.textContent =
            content;

    }


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
/* ADD RESPONSE COPY BUTTON */
/* ========================================= */

function addResponseCopyButton(
    message,
    answer
) {

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

            try {

                await navigator.clipboard.writeText(
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

            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );


    actions.appendChild(
        copyButton
    );


    message.appendChild(
        actions
    );

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

        role:
            "user",

        content:
            text

    });


    addMessage(
        text,
        "user"
    );


    /* Clear input */

    input.value =
        "";

    updateCharacterCount();

    autoResize();


    /* Disable sending */

    sendButton.disabled =
        true;


    /* Show thinking */

    const thinking =
        addThinkingMessage();


    try {

        const response =
            await fetch(
                BACKEND_URL,
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


        /* Save AI response */

        messages.push({

            role:
                "assistant",

            content:
                answer

        });


        /* Display AI response */

        const aiMessage =
            addMessage(
                answer,
                "ai"
            );


        /* Add copy button */

        addResponseCopyButton(
            aiMessage,
            answer
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


        /* Remove failed user message */

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

        title:
            title,

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


    saveChatHistoryToStorage();


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
        (
            chat,
            index
        ) => {

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


    messagesContainer.innerHTML =
        "";


    welcomeScreen.style.display =
        "none";


    messages.forEach(
        message => {

            addMessage(

                message.content,

                message.role ===
                    "assistant"
                    ? "ai"
                    : "user"

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

initializeAuthentication();