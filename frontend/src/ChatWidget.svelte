<script lang="ts">
  import { onMount, tick } from "svelte";
  import { fetchHistory, sendMessage, type ChatMessage } from "./api";

  export let open = false;
  export let prefill = "";
  export let onClose: () => void = () => {};

  const SESSION_KEY = "spur_chat_session_id";

  let messages: ChatMessage[] = [];
  let input = "";
  let sending = false;
  let errorBanner = "";
  let sessionId: string | null = localStorage.getItem(SESSION_KEY);
  let scrollEl: HTMLDivElement;
  let textareaEl: HTMLTextAreaElement;
  let historyLoaded = false;
  let lastPrefill = "";

  $: if (prefill && prefill !== lastPrefill) {
    lastPrefill = prefill;
    input = prefill;
    tick().then(() => {
      textareaEl?.focus();
      resizeTextarea();
    });
  }

  async function loadHistory() {
    if (historyLoaded || !sessionId) return;
    historyLoaded = true;
    try {
      const history = await fetchHistory(sessionId);
      messages = history.messages;
      await scrollToBottom();
    } catch {
      // No prior history reachable; start fresh silently.
    }
  }

  onMount(() => {
    loadHistory();
    textareaEl?.focus();
  });

  $: if (open) loadHistory();

  async function scrollToBottom() {
    await tick();
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
  }

  function tempMessage(sender: "user" | "ai", text: string): ChatMessage {
    return { id: `temp-${Date.now()}-${Math.random()}`, sender, text, createdAt: new Date().toISOString() };
  }

  function resizeTextarea() {
    if (!textareaEl) return;
    textareaEl.style.height = "auto";
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 160) + "px";
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    errorBanner = "";
    messages = [...messages, tempMessage("user", trimmed)];
    input = "";
    sending = true;
    await tick();
    resizeTextarea();
    await scrollToBottom();

    try {
      const result = await sendMessage(trimmed, sessionId);
      sessionId = result.sessionId;
      localStorage.setItem(SESSION_KEY, sessionId);
      messages = [...messages, tempMessage("ai", result.reply)];
    } catch (err) {
      errorBanner = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    } finally {
      sending = false;
      await scrollToBottom();
      textareaEl?.focus();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  const suggestions = ["What's your return policy?", "Do you ship to the UK?", "What are your support hours?"];

  function useSuggestion(text: string) {
    input = text;
    handleSend();
  }
</script>

<div class="chat-screen">
  <header class="chat-header">
    <div class="header-left">
      <div class="avatar">L</div>
      <div class="header-text">
        <h1>Lumen Goods</h1>
        <p><span class="dot"></span> AI agent · usually replies instantly</p>
      </div>
    </div>
    <button type="button" class="close-btn" on:click={onClose} aria-label="Close chat">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Close</span>
    </button>
  </header>

  <div class="messages" bind:this={scrollEl}>
    <div class="messages-inner">
      {#if messages.length === 0}
        <div class="empty-state">
          <div class="empty-badge">L</div>
          <h2>How can I help?</h2>
          <p>Ask about shipping, returns, or support hours — I have real answers.</p>
          <div class="suggestions">
            {#each suggestions as s}
              <button type="button" class="suggestion" on:click={() => useSuggestion(s)}>{s}</button>
            {/each}
          </div>
        </div>
      {/if}

      {#each messages as msg (msg.id)}
        <div class="message-row {msg.sender}">
          {#if msg.sender === "ai"}
            <div class="avatar small">L</div>
          {/if}
          <div class="bubble {msg.sender}">
            <div class="bubble-text">{msg.text}</div>
            <div class="bubble-time">{formatTime(msg.createdAt)}</div>
          </div>
        </div>
      {/each}

      {#if sending}
        <div class="message-row ai">
          <div class="avatar small">L</div>
          <div class="bubble ai typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="composer-wrap">
    {#if errorBanner}
      <div class="error-banner">{errorBanner}</div>
    {/if}

    <form class="composer" on:submit|preventDefault={handleSend}>
      <textarea
        bind:this={textareaEl}
        bind:value={input}
        on:keydown={handleKeydown}
        on:input={resizeTextarea}
        placeholder="Message Lumen Goods…"
        rows="1"
        disabled={sending}
      ></textarea>
      <button type="submit" disabled={sending || !input.trim()} aria-label="Send message">
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
          <path d="M2 8L14 8M14 8L9 3M14 8L9 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </form>
    <p class="composer-hint">Press Enter to send · Esc to close</p>
  </div>
</div>

<style>
  .chat-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fdfdfb;
    font-family: "Helvetica Neue", Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif;
    color: #141414;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid #ececec;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #141414;
    color: #fdfdfb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
  }

  .avatar.small {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    font-size: 11px;
    margin-top: 2px;
  }

  .header-text h1 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .header-text p {
    margin: 3px 0 0;
    font-size: 12px;
    color: #8a8a8a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2e9e5b;
  }

  .close-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid #e0e0e0;
    border-radius: 100px;
    padding: 8px 14px;
    color: #444;
    font-size: 12.5px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .close-btn:hover {
    border-color: #141414;
    color: #141414;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 36px 32px;
  }

  .messages-inner {
    max-width: 680px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .empty-state {
    margin: 60px 0;
    text-align: center;
    color: #666;
  }

  .empty-badge {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: #141414;
    color: #fdfdfb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    margin: 0 auto 18px;
  }

  .empty-state h2 {
    font-size: 22px;
    margin: 0 0 8px;
    font-weight: 700;
    color: #141414;
  }

  .empty-state p {
    margin: 0 0 24px;
    font-size: 14px;
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .suggestion {
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 100px;
    color: #141414;
    font-size: 13px;
    padding: 10px 18px;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .suggestion:hover {
    border-color: #d4541f;
    background: #fdf1e8;
  }

  .message-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    animation: rise 0.2s ease-out;
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-row.user {
    justify-content: flex-end;
  }

  .message-row.ai {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 72%;
    padding: 12px 16px;
    font-size: 14.5px;
    line-height: 1.6;
    border-radius: 16px;
  }

  .bubble-text {
    white-space: pre-wrap;
  }

  .bubble-time {
    margin-top: 5px;
    font-size: 10.5px;
    opacity: 0.5;
  }

  .bubble.user {
    background: #141414;
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .bubble.ai {
    background: #f0f0ed;
    color: #141414;
    border-bottom-left-radius: 4px;
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 14px 18px;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #aaa;
    animation: blink 1.2s infinite ease-in-out;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.15s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes blink {
    0%, 80%, 100% {
      opacity: 0.3;
    }
    40% {
      opacity: 1;
    }
  }

  .composer-wrap {
    flex-shrink: 0;
    padding: 16px 32px 24px;
    border-top: 1px solid #ececec;
    background: #fdfdfb;
  }

  .error-banner {
    max-width: 680px;
    margin: 0 auto 12px;
    padding: 10px 16px;
    border: 1px solid #d4541f;
    border-radius: 10px;
    font-size: 12.5px;
    color: #b8441a;
    background: #fdf1e8;
  }

  .composer {
    max-width: 680px;
    margin: 0 auto;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 22px;
    padding: 10px 10px 10px 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  }

  .composer textarea {
    flex: 1;
    resize: none;
    border: none;
    outline: none;
    padding: 8px 0;
    font-size: 14.5px;
    font-family: inherit;
    max-height: 160px;
    line-height: 1.4;
    background: transparent;
  }

  .composer textarea::placeholder {
    color: #aaa;
  }

  .composer button {
    background: #141414;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .composer button:disabled {
    background: #ececec;
    color: #bbb;
    cursor: not-allowed;
  }

  .composer button:not(:disabled):hover {
    background: #d4541f;
  }

  .composer-hint {
    max-width: 680px;
    margin: 10px auto 0;
    text-align: center;
    font-size: 11px;
    color: #b0b0b0;
  }

  @media (max-width: 640px) {
    .chat-header {
      padding: 16px 20px;
    }
    .messages {
      padding: 24px 20px;
    }
    .composer-wrap {
      padding: 14px 20px 20px;
    }
    .close-btn span {
      display: none;
    }
  }
</style>
