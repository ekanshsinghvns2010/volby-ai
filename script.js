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

        welcomeScreen.style.display =
            "";

        input.value = "";

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
/* MARKDOWN / RESPONSE FORMATTER */
/* ========================================= */

/*
    This function formats AI responses.

    Supported:

    **bold text**

    # Headings

    - Bullet lists

    ```python
    code
    ```

    Code blocks get their own Copy button.
*/

function formatAIResponse(content) {

    const fragment =
        document.createDocumentFragment();


    /*
        Split response into normal text
        and fenced code blocks.
    */

    const parts =
        content.split(
            /(```[\s\S]*?```)/g
        );


    parts.forEach(
        part => {

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
        text.split("\n");


    let currentList = null;


    lines.forEach(
        line => {

            const trimmed =
                line.trim();


            /*
                Bullet list
            */

            if (
                trimmed.startsWith("- ") ||
                trimmed.startsWith("* ")
            ) {

                if (!currentList) {

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
                        trimmed.substring(2)
                    )
                );


                currentList.appendChild(
                    li
                );


                return;

            }


            /*
                Numbered list
            */

            const numbered =
                trimmed.match(
                    /^\d+\.\s+(.*)/
                );


            if (numbered) {

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


            /*
                Reset list
            */

            currentList =
                null;


            /*
                Heading
            */

            if (
                trimmed.startsWith("# ")
            ) {

                const heading =
                    document.createElement(
                        "h3"
                    );


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


            /*
                Empty line
            */

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


            /*
                Normal paragraph
            */

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


    /*
        Split **bold** text
    */

    const parts =
        text.split(
            /(\*\*.*?\*\*)/g
        );


    parts.forEach(
        part => {

            if (
                part.startsWith("**") &&
                part.endsWith("**")
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

    /*
        Remove ``` markers
    */

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


    /*
        Detect language

        ```python
        ```javascript
        ```html
        */

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
            /^[a-zA-Z0-9+#.-]+$/
                .test(
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


    /*
        Code wrapper
    */

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "code-block";


    /*
        Header
    */

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "code-header";


    /*
        Language
    */

    const languageLabel =
        document.createElement(
            "span"
        );


    languageLabel.className =
        "code-language";


    languageLabel.textContent =
        language;


    /*
        Copy button
    */

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

                await navigator.clipboard
                    .writeText(
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


    /*
        Code element
    */

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


    /*
        User messages remain plain text.

        AI messages get formatting.
    */

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

                /*
                    IMPORTANT:

                    This copies ONLY the AI response.

                    The user's question is NOT included.
                */

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


        /* Display AI response */

        const aiMessage =
            addMessage(
                answer,
                "ai"
            );


        /*
            Add main Copy button.

            This copies only the AI answer.
        */

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

  