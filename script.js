/* ============================================================
   VOLBY AI — CLEAN SCRIPT.JS
   Single-file replacement
   - Removed duplicate chunks/declarations
   - Preserved chat, history, model selector, themes,
     auth, suggestions, message actions and API flow
   - Fixed send-state and initialization issues
============================================================ */

"use strict";

(() => {

    /* ========================================================
       CONFIGURATION
    ======================================================== */

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

    /* ========================================================
       SAFE SUPABASE INITIALIZATION
    ======================================================== */

    let supabaseClient = null;

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
                "Supabase initialization error:",
                error
            );
        }
    } else {
        console.warn(
            "Supabase library is not available."
        );
    }

    /* ========================================================
       DOM
    ======================================================== */

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

    /* ========================================================
       STATE
    ======================================================== */

    let messages = [];

    let chatHistory =
        getStorage(
            HISTORY_STORAGE_KEY,
            []
        );

    if (!Array.isArray(chatHistory)) {
        chatHistory = [];
    }

    let currentUser = null;

    let selectedModel =
        getSelectedModel();

    let isSending = false;

    let currentChatId = null;

    /* ========================================================
       STORAGE
    ======================================================== */

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

    /* ========================================================
       MODEL
    ======================================================== */

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

        } catch (error) {
            console.error(
                "Model storage read error:",
                error
            );
        }

        return "groq";
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

        updateModelSelectorUI();
        updateInputPlaceholder();
        updateSendButtonState();
        showModelChangedFeedback(model);
    }

    function createModelSelector() {

        if (
            document.getElementById(
                "volby-model-selector"
            )
        ) {
            updateModelSelectorUI();
            return;
        }

        const inputControls =
            document.getElementById(
                "input-controls"
            );

        if (!inputControls) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.id =
            "volby-model-selector";

        wrapper.className =
            "volby-model-selector";

        const currentButton =
            document.createElement("button");

        currentButton.type = "button";
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

        const menu =
            document.createElement("div");

        menu.id =
            "model-selector-menu";

        menu.className =
            "model-selector-menu";

        menu.setAttribute(
            "role",
            "menu"
        );

        MODEL_OPTIONS.forEach(option => {

            const optionButton =
                document.createElement("button");

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
                    class="model-option-icon"
                    aria-hidden="true"
                >
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

                <span
                    class="model-option-check"
                    aria-hidden="true"
                >
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

        currentButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                const open =
                    menu.classList.toggle(
                        "open"
                    );

                currentButton.setAttribute(
                    "aria-expanded",
                    open ? "true" : "false"
                );
            }
        );

        wrapper.appendChild(
            currentButton
        );

        wrapper.appendChild(
            menu
        );

        inputControls.insertBefore(
            wrapper,
            inputControls.firstChild
        );

        updateModelSelectorUI();
    }

    function updateModelSelectorUI() {

        const currentButton =
            document.getElementById(
                "current-model-button"
            );

        if (!currentButton) {
            return;
        }

        const option =
            MODEL_OPTIONS.find(
                item =>
                    item.value === selectedModel
            );

        if (!option) {
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
                ${option.label}
            </span>

            <span
                class="model-arrow"
                aria-hidden="true"
            >
                ▾
            </span>
        `;

        document
            .querySelectorAll(".model-option")
            .forEach(button => {

                const active =
                    button.dataset.model ===
                    selectedModel;

                button.classList.toggle(
                    "selected",
                    active
                );

                const check =
                    button.querySelector(
                        ".model-option-check"
                    );

                if (check) {
                    check.style.visibility =
                        active
                            ? "visible"
                            : "hidden";
                }
            });
    }

    /* ========================================================
       THEME
    ======================================================== */

    function setTheme(theme) {

        if (!theme) {
            theme = "midnight";
        }

        if (body) {
            body.dataset.theme =
                theme;
        }

        try {
            localStorage.setItem(
                THEME_STORAGE_KEY,
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

    function loadTheme() {

        let theme =
            "midnight";

        try {
            theme =
                localStorage.getItem(
                    THEME_STORAGE_KEY
                ) || "midnight";
        } catch (error) {
            console.error(
                "Theme read error:",
                error
            );
        }

        setTheme(theme);
    }

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

    /* ========================================================
       SIDEBAR
    ======================================================== */

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

        body.classList.add(
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

        body.classList.remove(
            "sidebar-open"
        );
    }

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

    /* ========================================================
       ABOUT MODAL
    ======================================================== */

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

    /* ========================================================
       INPUT
    ======================================================== */

    function updateCharacterCount() {

        if (
            !characterCount ||
            !input
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

    function autoResize() {

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

    function updateSendButtonState() {

        if (!sendButton) {
            return;
        }

        const hasText =
            Boolean(
                input &&
                input.value.trim()
            );

        sendButton.disabled =
            isSending ||
            !hasText;

        sendButton.classList.toggle(
            "ready",
            hasText &&
            !isSending
        );

        sendButton.classList.toggle(
            "sending",
            isSending
        );
    }

    function setSendingState(state) {

        isSending =
            Boolean(state);

        updateSendButtonState();
    }

    function updateInputPlaceholder() {

        if (!input) {
            return;
        }

        input.placeholder =
            selectedModel === "openrouter"
                ? "Message Volby Pro..."
                : "Message Volby...";
    }

    if (input) {

        input.addEventListener(
            "input",
            () => {
                updateCharacterCount();
                autoResize();
                updateSendButtonState();
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

        input.addEventListener(
            "focus",
            () => {
                body.classList.add(
                    "input-focused"
                );
            }
        );

        input.addEventListener(
            "blur",
            () => {
                body.classList.remove(
                    "input-focused"
                );
            }
        );
    }

    /* ========================================================
       HELPERS
    ======================================================== */

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

    function generateId(prefix) {

        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }

    function safeText(value) {
        return String(
            value ?? ""
        );
    }

    function scrollToBottom(
        smooth = true
    ) {

        if (!messagesContainer) {
            return;
        }

        requestAnimationFrame(
            () => {

                messagesContainer.scrollTo({
                    top:
                        messagesContainer.scrollHeight,
                    behavior:
                        smooth
                            ? "smooth"
                            : "auto"
                });
            }
        );
    }

    /* ========================================================
       MARKDOWN RENDERING
    ======================================================== */

    function formatInlineMarkdown(text) {

        const fragment =
            document.createDocumentFragment();

        const parts =
            String(text)
                .split(
                    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
                );

        parts.forEach(part => {

            if (
                part.startsWith("`") &&
                part.endsWith("`")
            ) {

                const code =
                    document.createElement(
                        "code"
                    );

                code.className =
                    "inline-code";

                code.textContent =
                    part.slice(
                        1,
                        -1
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

                const strong =
                    document.createElement(
                        "strong"
                    );

                strong.textContent =
                    part.slice(
                        2,
                        -2
                    );

                fragment.appendChild(
                    strong
                );

                return;
            }

            if (
                part.startsWith("*") &&
                part.endsWith("*") &&
                part.length > 2
            ) {

                const italic =
                    document.createElement(
                        "em"
                    );

                italic.textContent =
                    part.slice(
                        1,
                        -1
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
            code.indexOf("\n");

        if (
            firstNewLine !== -1
        ) {

            const possibleLanguage =
                code
                    .slice(
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
                    code.slice(
                        firstNewLine + 1
                    );
            }
        }

        code =
            code.trim();

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "code-block";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "code-header";

        const languageLabel =
            document.createElement(
                "span"
            );

        languageLabel.className =
            "code-language";

        languageLabel.textContent =
            language;

        const copyButton =
            document.createElement(
                "button"
            );

        copyButton.type =
            "button";

        copyButton.className =
            "code-copy-button";

        copyButton.textContent =
            "Copy";

        copyButton.addEventListener(
            "click",
            async () => {

                const copied =
                    await copyText(code);

                if (copied) {

                    copyButton.textContent =
                        "Copied!";

                    setTimeout(
                        () => {
                            copyButton.textContent =
                                "Copy";
                        },
                        1800
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

        const pre =
            document.createElement(
                "pre"
            );

        pre.className =
            "code-pre";

        const codeElement =
            document.createElement(
                "code"
            );

        codeElement.className =
            `language-${language.toLowerCase()}`;

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

    function createTextContent(
        text,
        container
    ) {

        if (
            !text ||
            !text.trim()
        ) {
            return;
        }

        const lines =
            text.split("\n");

        let currentList = null;

        lines.forEach(line => {

            const trimmed =
                line.trim();

            if (
                trimmed.startsWith("- ") ||
                trimmed.startsWith("* ")
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

                    currentList.className =
                        "ai-list";

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
                        trimmed.slice(2)
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

                    currentList.className =
                        "ai-list";

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

            currentList = null;

            if (
                trimmed.startsWith("### ")
            ) {

                const heading =
                    document.createElement(
                        "h4"
                    );

                heading.className =
                    "ai-heading";

                heading.appendChild(
                    formatInlineMarkdown(
                        trimmed.slice(4)
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
                    document.createElement(
                        "h3"
                    );

                heading.className =
                    "ai-heading";

                heading.appendChild(
                    formatInlineMarkdown(
                        trimmed.slice(3)
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
                    document.createElement(
                        "h2"
                    );

                heading.className =
                    "ai-heading";

                heading.appendChild(
                    formatInlineMarkdown(
                        trimmed.slice(2)
                    )
                );

                container.appendChild(
                    heading
                );

                return;
            }

            if (!trimmed) {

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

            const paragraph =
                document.createElement(
                    "p"
                );

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

    function formatAIResponse(content) {

        const fragment =
            document.createDocumentFragment();

        const parts =
            String(content)
                .split(
                    /(```[\s\S]*?```)/g
                );

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

    /* ========================================================
       CLIPBOARD
    ======================================================== */

    async function copyText(text) {

        try {

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                await navigator.clipboard.writeText(
                    String(text)
                );

                return true;
            }

        } catch (error) {
            console.warn(
                "Clipboard API failed:",
                error
            );
        }

        try {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                String(text);

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";

            document.body.appendChild(
                textarea
            );

            textarea.focus();
            textarea.select();

            const success =
                document.execCommand(
                    "copy"
                );

            textarea.remove();

            return success;

        } catch (error) {

            console.error(
                "Clipboard fallback failed:",
                error
            );

            return false;
        }
    }

    /* ========================================================
       MESSAGES
    ======================================================== */

    function generateMessageId() {
        return generateId("msg");
    }

    function addConversationMessage(
        role,
        content
    ) {

        messages.push({
            id:
                generateMessageId(),
            role:
                role,
            content:
                safeText(content)
        });
    }

    function addUserMessage(
        content
    ) {

        if (!messagesContainer) {
            return null;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "message-wrapper user-message-wrapper";

        wrapper.dataset.role =
            "user";

        wrapper.dataset.messageId =
            generateMessageId();

        const contentWrapper =
            document.createElement(
                "div"
            );

        contentWrapper.className =
            "message-content-wrapper user-content-wrapper";

        const bubble =
            document.createElement(
                "div"
            );

        bubble.className =
            "message-bubble user-bubble";

        const paragraph =
            document.createElement(
                "p"
            );

        paragraph.className =
            "user-message-text";

        paragraph.textContent =
            safeText(content);

        bubble.appendChild(
            paragraph
        );

        contentWrapper.appendChild(
            bubble
        );

        const avatar =
            document.createElement(
                "div"
            );

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

        return wrapper;
    }

    function addAssistantMessage(
        content,
        modelUsed
    ) {

        if (!messagesContainer) {
            return null;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "message-wrapper assistant-message-wrapper";

        wrapper.dataset.role =
            "assistant";

        wrapper.dataset.messageId =
            generateMessageId();

        const avatar =
            document.createElement(
                "div"
            );

        avatar.className =
            "message-avatar";

        const logo =
            document.createElement(
                "img"
            );

        logo.src =
            "volby-logo.png";

        logo.alt =
            "Volby";

        logo.className =
            "message-avatar-logo";

        avatar.appendChild(
            logo
        );

        const contentWrapper =
            document.createElement(
                "div"
            );

        contentWrapper.className =
            "message-content-wrapper";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "message-header";

        const name =
            document.createElement(
                "span"
            );

        name.className =
            "message-name";

        name.textContent =
            "Volby";

        header.appendChild(
            name
        );

        if (modelUsed) {

            const badge =
                document.createElement(
                    "span"
                );

            badge.className =
                "model-badge";

            badge.textContent =
                modelUsed;

            header.appendChild(
                badge
            );
        }

        const bubble =
            document.createElement(
                "div"
            );

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

        return wrapper;
    }

    function addLoadingMessage() {

        if (!messagesContainer) {
            return null;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "message-wrapper loading-wrapper";

        wrapper.dataset.role =
            "assistant";

        const avatar =
            document.createElement(
                "div"
            );

        avatar.className =
            "message-avatar";

        const logo =
            document.createElement(
                "img"
            );

        logo.src =
            "volby-logo.png";

        logo.alt =
            "Volby";

        logo.className =
            "message-avatar-logo";

        avatar.appendChild(
            logo
        );

        const contentWrapper =
            document.createElement(
                "div"
            );

        contentWrapper.className =
            "message-content-wrapper";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "message-header";

        const name =
            document.createElement(
                "span"
            );

        name.className =
            "message-name";

        name.textContent =
            "Volby";

        header.appendChild(
            name
        );

        const bubble =
            document.createElement(
                "div"
            );

        bubble.className =
            "message-bubble thinking-bubble";

        const text =
            document.createElement(
                "span"
            );

        text.className =
            "thinking-text";

        text.textContent =
            "Thinking";

        const dots =
            document.createElement(
                "span"
            );

        dots.className =
            "thinking-dots";

        dots.innerHTML =
            "<i></i><i></i><i></i>";

        bubble.appendChild(
            text
        );

        bubble.appendChild(
            dots
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

    function addMessageActions(
        bubble,
        content,
        role
    ) {

        if (!bubble) {
            return;
        }

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

        copyButton.type =
            "button";

        copyButton.className =
            "message-action";

        copyButton.textContent =
            "Copy";

        copyButton.addEventListener(
            "click",
            async () => {

                if (
                    await copyText(
                        content
                    )
                ) {

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
            }
        );

        actions.appendChild(
            copyButton
        );

        if (
            role === "assistant"
        ) {

            const regenerateButton =
                document.createElement(
                    "button"
                );

            regenerateButton.type =
                "button";

            regenerateButton.className =
                "message-action";

            regenerateButton.textContent =
                "Regenerate";

            regenerateButton.addEventListener(
                "click",
                () => {
                    regenerateLastResponse();
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

        addMessageActions(
            wrapper.querySelector(
                ".user-bubble"
            ),
            content,
            "user"
        );

        scrollToBottom();

        return wrapper;
    }

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

        addMessageActions(
            wrapper.querySelector(
                ".assistant-bubble"
            ),
            content,
            "assistant"
        );

        scrollToBottom();

        return wrapper;
    }

    function addMessageToUI(
        role,
        content
    ) {

        if (
            role === "user"
        ) {

            return addUserMessage(
                content
            );

        }

        if (
            role === "assistant"
        ) {

            return addAssistantMessage(
                content,
                selectedModel ===
                    "openrouter"
                    ? "Volby Pro"
                    : "Volby"
            );
        }

        return null;
    }

    /* ========================================================
       CHAT HISTORY
    ======================================================== */

    function generateChatTitle(
        text
    ) {

        const clean =
            safeText(text)
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        if (!clean) {
            return "New Chat";
        }

        if (
            clean.length <= 42
        ) {
            return clean;
        }

        return (
            clean
                .slice(0, 42)
                .trim() +
            "…"
        );
    }

    function createHistoryEntry(
        firstMessage
    ) {

        const entry = {
            id:
                generateId("chat"),
            title:
                generateChatTitle(
                    firstMessage
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
            model:
                selectedModel,
            createdAt:
                Date.now(),
            updatedAt:
                Date.now(),
            _active:
                true
        };

        chatHistory.forEach(
            chat => {
                chat._active =
                    false;
            }
        );

        chatHistory.unshift(
            entry
        );

        currentChatId =
            entry.id;

        trimHistory();

        setStorage(
            HISTORY_STORAGE_KEY,
            chatHistory
        );

        renderChatHistory();

        return entry;
    }

    function updateCurrentChatHistory() {

        if (!messages.length) {
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

        let entry =
            chatHistory.find(
                chat =>
                    chat.id ===
                    currentChatId
            );

        if (!entry) {

            entry =
                createHistoryEntry(
                    firstUserMessage.content
                );
        }

        entry.messages =
            messages.map(
                message => ({
                    role:
                        message.role,
                    content:
                        message.content
                })
            );

        entry.model =
            selectedModel;

        entry.updatedAt =
            Date.now();

        entry._active =
            true;

        chatHistory.forEach(
            chat => {

                if (
                    chat.id !==
                    entry.id
                ) {
                    chat._active =
                        false;
                }
            }
        );

        chatHistory.sort(
            (a, b) =>
                (b.updatedAt || 0) -
                (a.updatedAt || 0)
        );

        trimHistory();

        setStorage(
            HISTORY_STORAGE_KEY,
            chatHistory
        );

        renderChatHistory();
    }

    function trimHistory() {

        if (
            chatHistory.length >
            MAX_HISTORY
        ) {

            chatHistory =
                chatHistory.slice(
                    0,
                    MAX_HISTORY
                );
        }
    }

    function renderChatHistory() {

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

                item.classList.toggle(
                    "active",
                    chat.id ===
                        currentChatId
                );

                const icon =
                    document.createElement(
                        "span"
                    );

                icon.className =
                    "history-item-icon";

                icon.textContent =
                    "◌";

                const title =
                    document.createElement(
                        "span"
                    );

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
                        loadChat(
                            chat.id
                        );
                    }
                );

                item.addEventListener(
                    "contextmenu",
                    event => {

                        event.preventDefault();

                        if (
                            confirm(
                                "Delete this conversation?"
                            )
                        ) {
                            deleteChat(
                                chat.id
                            );
                        }
                    }
                );

                historyList.appendChild(
                    item
                );
            }
        );
    }

    function loadChat(
        chatId
    ) {

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
                ? chat.messages.map(
                    message => ({
                        role:
                            message.role,
                        content:
                            message.content
                    })
                )
                : [];

        if (
            chat.model === "groq" ||
            chat.model === "openrouter"
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
        updateInputPlaceholder();

        if (messagesContainer) {

            messagesContainer.innerHTML =
                "";

            if (!messages.length) {

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
                        addMessageToUI(
                            message.role,
                            message.content
                        );
                    }
                );
            }
        }

        chatHistory.forEach(
            item => {
                item._active =
                    item.id ===
                    currentChatId;
            }
        );

        setStorage(
            HISTORY_STORAGE_KEY,
            chatHistory
        );

        renderChatHistory();
        closeSidebarMenu();
        scrollToBottom(false);
    }

    function deleteChat(
        chatId
    ) {

        chatHistory =
            chatHistory.filter(
                chat =>
                    chat.id !==
                    chatId
            );

        if (
            currentChatId ===
            chatId
        ) {

            currentChatId =
                null;

            messages =
                [];

            showWelcomeScreen();
        }

        setStorage(
            HISTORY_STORAGE_KEY,
            chatHistory
        );

        renderChatHistory();
    }

    function clearChatHistory() {

        if (
            !confirm(
                "Clear all Volby chat history?"
            )
        ) {
            return;
        }

        chatHistory =
            [];

        setStorage(
            HISTORY_STORAGE_KEY,
            []
        );

        startNewChat();
    }

    function showWelcomeScreen() {

        if (!messagesContainer) {
            return;
        }

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

    function startNewChat() {

        currentChatId =
            null;

        messages =
            [];

        showWelcomeScreen();

        if (input) {
            input.value =
                "";
        }

        updateCharacterCount();
        autoResize();
        updateSendButtonState();
        renderChatHistory();
        closeSidebarMenu();

        if (input) {
            input.focus();
        }
    }

    if (newChatButton) {
        newChatButton.addEventListener(
            "click",
            startNewChat
        );
    }

    /* ========================================================
       SUGGESTIONS
    ======================================================== */

    suggestions.forEach(
        suggestion => {

            suggestion.addEventListener(
                "click",
                () => {

                    if (!input) {
                        return;
                    }

                    const prompt =
                        suggestion.dataset.prompt ||
                        suggestion.getAttribute(
                            "data-prompt"
                        ) ||
                        suggestion.textContent.trim();

                    if (!prompt) {
                        return;
                    }

                    input.value =
                        prompt;

                    updateCharacterCount();
                    autoResize();
                    updateSendButtonState();
                    input.focus();
                }
            );
        }
    );

    /* ========================================================
       API
    ======================================================== */

    function getFriendlyErrorMessage(
        error
    ) {

        const raw =
            safeText(
                error?.message
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
                "cors"
            )
        ) {

            return (
                "Volby's server rejected the browser request. " +
                "Please check the backend CORS settings."
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
                "The selected Volby model is unavailable. " +
                "Please switch models and try again."
            );
        }

        if (
            lower.includes(
                "500"
            )
        ) {

            return (
                "Volby's server returned an internal error. " +
                "Please try again in a moment."
            );
        }

        return (
            raw ||
            "Something went wrong while connecting to Volby."
        );
    }

    async function requestAIResponse() {

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
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                messages:
                                    messages.map(
                                        message => ({
                                            role:
                                                message.role,
                                            content:
                                                message.content
                                        })
                                    ),
                                model:
                                    selectedModel
                            })
                    }
                );

            let data =
                null;

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
                    String(
                        serverError
                    )
                );
            }

            const answer =
                data?.response ||
                data?.message ||
                data?.answer;

            if (
                typeof answer !==
                    "string" ||
                !answer.trim()
            ) {

                throw new Error(
                    "Volby returned an empty response."
                );
            }

            if (
                thinkingMessage
            ) {
                thinkingMessage.remove();
            }

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

            updateCurrentChatHistory();
            scrollToBottom();

        } catch (error) {

            console.error(
                "Volby API error:",
                error
            );

            if (
                thinkingMessage
            ) {
                thinkingMessage.remove();
            }

            addAssistantMessageWithActions(
                getFriendlyErrorMessage(
                    error
                ),
                "Volby"
            );

        } finally {

            setSendingState(
                false
            );

            if (input) {
                input.focus();
            }
        }
    }

    /* ========================================================
       SEND
    ======================================================== */

    async function sendMessage() {

        if (
            !input ||
            isSending
        ) {
            return;
        }

        const text =
            input.value.trim();

        if (!text) {
            input.focus();
            return;
        }

        if (
            text.length >
            MAX_MESSAGE_LENGTH
        ) {

            alert(
                "Your message is too long. Please keep it under 10,000 characters."
            );

            return;
        }

        if (welcomeScreen) {
            welcomeScreen.style.display =
                "none";
        }

        addConversationMessage(
            "user",
            text
        );

        addUserMessageWithActions(
            text
        );

        input.value =
            "";

        updateCharacterCount();
        autoResize();

        if (!currentChatId) {

            createHistoryEntry(
                text
            );

        } else {

            updateCurrentChatHistory();
        }

        scrollToBottom();

        await requestAIResponse();
    }

    if (sendButton) {
        sendButton.addEventListener(
            "click",
            sendMessage
        );
    }

    /* ========================================================
       REGENERATE
    ======================================================== */

    async function regenerateLastResponse() {

        if (isSending) {
            return;
        }

        let lastUserIndex =
            -1;

        for (
            let i =
                messages.length - 1;
            i >= 0;
            i--
        ) {

            if (
                messages[i].role ===
                "user"
            ) {

                lastUserIndex =
                    i;

                break;
            }
        }

        if (
            lastUserIndex ===
            -1
        ) {
            return;
        }

        messages =
            messages.slice(
                0,
                lastUserIndex + 1
            );

        if (messagesContainer) {

            messagesContainer.innerHTML =
                "";

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

        updateCurrentChatHistory();

        await requestAIResponse();
    }

    /* ========================================================
       MODEL TOAST
    ======================================================== */

    function showModelChangedFeedback(
        model
    ) {

        const option =
            MODEL_OPTIONS.find(
                item =>
                    item.value ===
                    model
            );

        if (!option) {
            return;
        }

        const existing =
            document.getElementById(
                "volby-model-toast"
            );

        if (existing) {
            existing.remove();
        }

        const toast =
            document.createElement(
                "div"
            );

        toast.id =
            "volby-model-toast";

        toast.className =
            "volby-toast";

        toast.textContent =
            `${option.label} selected`;

        body.appendChild(
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

    /* ========================================================
       AUTH
    ======================================================== */

    function createAuthScreen() {

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
                    type="button"
                >
                    Log In
                </button>

                <button
                    id="auth-toggle"
                    class="auth-toggle"
                    type="button"
                >
                    Don't have an account? Sign Up
                </button>

                <p class="auth-note">
                    Your account keeps your Volby experience connected.
                </p>

            </div>
        `;

        body.appendChild(
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

        async function authenticate() {

            if (!supabaseClient) {

                errorElement.textContent =
                    "Authentication service is unavailable. Please check that the Supabase script is loaded.";

                return;
            }

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
                password.length <
                6
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
                            email:
                                email,
                            password:
                                password
                        });

                } else {

                    result =
                        await supabaseClient.auth.signInWithPassword({
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

                currentUser =
                    result.data.user ||
                    null;

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

        passwordInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {
                    authenticate();
                }
            }
        );

        emailInput.focus();
    }

    function showAuthenticatedUI() {

        body.classList.add(
            "authenticated"
        );

        addLogoutButton();
        createModelSelector();
    }

    function addLogoutButton() {

        if (
            document.getElementById(
                "volby-logout-button"
            )
        ) {
            return;
        }

        const sidebarBottom =
            document.querySelector(
                ".sidebar-bottom"
            );

        if (!sidebarBottom) {
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

        logoutButton.type =
            "button";

        logoutButton.innerHTML =
            "↪ <span>Log Out</span>";

        logoutButton.addEventListener(
            "click",
            async () => {

                if (
                    !supabaseClient
                ) {
                    return;
                }

                if (
                    !confirm(
                        "Are you sure you want to log out?"
                    )
                ) {
                    return;
                }

                logoutButton.disabled =
                    true;

                try {

                    const result =
                        await supabaseClient.auth.signOut();

                    if (
                        result.error
                    ) {
                        throw result.error;
                    }

                    currentUser =
                        null;

                    body.classList.remove(
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

        sidebarBottom.appendChild(
            logoutButton
        );
    }

    async function initializeAuthentication() {

        if (!supabaseClient) {

            /*
             * Do not completely kill the UI if the
             * Supabase CDN script failed to load.
             */
            console.warn(
                "Skipping Supabase authentication initialization."
            );

            body.classList.add(
                "authenticated"
            );

            createModelSelector();

            return;
        }

        try {

            const result =
                await supabaseClient.auth.getSession();

            if (
                result.error
            ) {
                throw result.error;
            }

            const session =
                result.data?.session;

            if (
                session?.user
            ) {

                currentUser =
                    session.user;

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

        supabaseClient.auth.onAuthStateChange(
            (
                event,
                session
            ) => {

                if (
                    session?.user
                ) {

                    currentUser =
                        session.user;

                    body.classList.add(
                        "authenticated"
                    );

                    const authScreen =
                        document.getElementById(
                            "volby-auth-screen"
                        );

                    if (
                        authScreen
                    ) {
                        authScreen.remove();
                    }

                    showAuthenticatedUI();

                } else {

                    currentUser =
                        null;

                    body.classList.remove(
                        "authenticated"
                    );
                }
            }
        );
    }

    /* ========================================================
       GLOBAL KEYBOARD / NETWORK
    ======================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeSidebarMenu();
                closeAboutModal();

                const modelMenu =
                    document.getElementById(
                        "model-selector-menu"
                    );

                const modelButton =
                    document.getElementById(
                        "current-model-button"
                    );

                if (modelMenu) {
                    modelMenu.classList.remove(
                        "open"
                    );
                }

                if (modelButton) {
                    modelButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                if (input) {
                    input.focus();
                }
            }
        }
    );

    document.addEventListener(
        "click",
        event => {

            const modelSelector =
                document.getElementById(
                    "volby-model-selector"
                );

            const modelMenu =
                document.getElementById(
                    "model-selector-menu"
                );

            const modelButton =
                document.getElementById(
                    "current-model-button"
                );

            if (
                modelSelector &&
                modelMenu &&
                !modelSelector.contains(
                    event.target
                )
            ) {

                modelMenu.classList.remove(
                    "open"
                );

                if (modelButton) {
                    modelButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        }
    );

    window.addEventListener(
        "online",
        () => {
            body.classList.remove(
                "offline"
            );
        }
    );

    window.addEventListener(
        "offline",
        () => {
            body.classList.add(
                "offline"
            );
        }
    );

    /* ========================================================
       INITIALIZATION
    ======================================================== */

    loadTheme();

    updateCharacterCount();

    autoResize();

    updateInputPlaceholder();

    updateSendButtonState();

    createModelSelector();

    renderChatHistory();

    if (
        messagesContainer &&
        messages.length === 0 &&
        welcomeScreen &&
        !messagesContainer.contains(
            welcomeScreen
        )
    ) {
        messagesContainer.appendChild(
            welcomeScreen
        );
    }

    if (
        !navigator.onLine
    ) {
        body.classList.add(
            "offline"
        );
    }

    initializeAuthentication();

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

})();
