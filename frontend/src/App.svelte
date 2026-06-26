<script lang="ts">
  import ChatWidget from "./ChatWidget.svelte";
  import Landing from "./Landing.svelte";

  let chatOpen = false;
  let prefill = "";

  function openChat(text = "") {
    if (text) prefill = text;
    chatOpen = true;
    document.body.style.overflow = "hidden";
  }

  function closeChat() {
    chatOpen = false;
    document.body.style.overflow = "";
  }

  function toggleChat() {
    if (chatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }
</script>

<Landing onOpenChat={openChat} />

<button
  type="button"
  class="launcher"
  class:hidden={chatOpen}
  on:click={toggleChat}
  aria-label="Open chat"
>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M2 9.5C2 5.36 5.36 2 9.5 2S17 5.36 17 9.5c0 1.4-.38 2.7-1.05 3.83L17 17l-3.86-1c-1.1.6-2.36.95-3.64.95C5.36 17 2 13.64 2 9.5Z"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linejoin="round"
    />
  </svg>
</button>

{#if chatOpen}
  <div class="overlay" on:click|self={closeChat} role="presentation">
    <div class="overlay-panel">
      <ChatWidget open={chatOpen} {prefill} onClose={closeChat} />
    </div>
  </div>
{/if}

<style>
  .launcher {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #141414;
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 50;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  .launcher:hover {
    transform: scale(1.06);
  }

  .launcher.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 17, 14, 0.45);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.18s ease-out;
    padding: 32px;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .overlay-panel {
    width: 100%;
    max-width: 920px;
    height: 100%;
    max-height: 760px;
    background: #fdfdfb;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
    animation: rise-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes rise-in {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 640px) {
    .overlay {
      padding: 0;
    }
    .overlay-panel {
      max-width: 100%;
      max-height: 100%;
      border-radius: 0;
    }
    .launcher {
      bottom: 20px;
      right: 20px;
    }
  }
</style>
