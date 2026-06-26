<script lang="ts">
  export let onOpenChat: (text?: string) => void;

  let quickInput = "";

  function startWith(text: string) {
    onOpenChat(text);
  }

  function submitQuick() {
    const trimmed = quickInput.trim();
    if (!trimmed) return;
    onOpenChat(trimmed);
    quickInput = "";
  }

  const examples = [
    "What's your return policy?",
    "Do you ship to the UK?",
    "What are your support hours?",
  ];

  const faqs = [
    {
      q: "How fast is shipping?",
      a: "Standard is 5-7 business days (free over $50). Express gets it to you in 2-3 days.",
    },
    {
      q: "Can I return something?",
      a: "Yes — 30 days, unused, original packaging. Refund hits your card in 5-7 business days.",
    },
    {
      q: "When can I reach a human?",
      a: "Mon-Fri, 9am-6pm EST. Outside that, the agent below is still on.",
    },
  ];

  let openFaq = -1;
  function toggleFaq(i: number) {
    openFaq = openFaq === i ? -1 : i;
  }
</script>

<div class="page">
  <nav class="nav">
    <div class="inner nav-inner">
      <span class="logo">Lumen Goods</span>
      <button type="button" class="nav-cta" on:click={() => onOpenChat()}>Talk to support</button>
    </div>
  </nav>

  <section class="hero">
    <div class="inner hero-inner">
      <div class="hero-left">
        <span class="tag">01 — Support, rebuilt</span>
        <h1>
          Ask us<br />
          <em>anything.</em><br />
          Get an answer.
        </h1>
        <p class="hero-sub">
          No tickets. No "we'll get back to you in 24 hours." Just type the question
          you actually have, and our agent answers it — right now, with our real
          shipping and return policies.
        </p>

        <form class="prompt-row" on:submit|preventDefault={submitQuick}>
          <input type="text" bind:value={quickInput} placeholder="Type a question…" aria-label="Ask a question" />
          <button type="submit">Ask →</button>
        </form>

        <div class="examples">
          {#each examples as ex, i}
            {#if i > 0}<span class="example-sep">·</span>{/if}
            <button type="button" class="example" on:click={() => startWith(ex)}>{ex}</button>
          {/each}
        </div>
      </div>

      <div class="hero-right">
        <div class="mock-window">
          <div class="mock-bar">
            <span></span><span></span><span></span>
          </div>
          <div class="mock-body">
            <div class="mock-row user">
              <div class="mock-bubble user">do you ship to the UK?</div>
            </div>
            <div class="mock-row ai">
              <div class="mock-bubble ai">
                Yes — standard shipping (5-7 days) is free over $50, otherwise $5.99.
                Express is 2-3 days for $14.99.
              </div>
            </div>
            <div class="mock-row user">
              <div class="mock-bubble user">nice, and returns?</div>
            </div>
            <div class="mock-row ai">
              <div class="mock-bubble ai typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
        <span class="hero-right-caption">an actual conversation, not a mockup of one</span>
      </div>
    </div>
  </section>

  <section class="divider">
    <div class="inner">
      <span>02 — Questions people actually ask</span>
    </div>
  </section>

  <section class="faq-section">
    <div class="inner">
      <div class="faq-list">
        {#each faqs as f, i}
          <button type="button" class="faq-row" on:click={() => toggleFaq(i)}>
            <div class="faq-row-top">
              <span class="faq-q">{f.q}</span>
              <span class="faq-toggle" class:open={openFaq === i}>+</span>
            </div>
            {#if openFaq === i}
              <p class="faq-a">{f.a}</p>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="inner cta-inner">
      <div class="cta-text">
        <span class="tag tag-light">03 — Right now</span>
        <h2>Skip the FAQ.<br />Just ask.</h2>
      </div>
      <button type="button" class="cta-btn" on:click={() => onOpenChat()}>Open the chat</button>
    </div>
  </section>

  <footer class="footer">
    <div class="inner footer-inner">
      <span>Lumen Goods, 2026</span>
      <span class="footer-note">Fictional store, built for a take-home assignment.</span>
    </div>
  </footer>
</div>

<style>
  :global(html, body) {
    margin: 0;
    background: #fdfdfb;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #141414;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .page {
    width: 100%;
  }

  .inner {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 64px;
  }

  .nav {
    width: 100%;
    border-bottom: 1px solid #e6e6e6;
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 26px;
    padding-bottom: 26px;
  }

  .logo {
    font-weight: 700;
    font-size: 15px;
    letter-spacing: -0.01em;
  }

  .nav-cta {
    background: none;
    border: 1px solid #141414;
    color: #141414;
    font-size: 13px;
    padding: 9px 16px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .nav-cta:hover {
    background: #141414;
    color: #fdfdfb;
  }

  .hero {
    width: 100%;
  }

  .hero-inner {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 96px;
    padding-top: 64px;
    padding-bottom: 96px;
    align-items: start;
  }

  .tag {
    display: inline-block;
    font-size: 11.5px;
    font-family: "Courier New", monospace;
    letter-spacing: 0.04em;
    color: #8a8a8a;
    margin-bottom: 22px;
  }

  .hero h1 {
    font-size: 62px;
    line-height: 1.02;
    letter-spacing: -0.02em;
    margin: 0 0 24px;
    font-weight: 700;
  }

  .hero h1 em {
    font-style: italic;
    font-weight: 400;
    color: #d4541f;
  }

  .hero-sub {
    font-size: 17px;
    line-height: 1.65;
    color: #4a4a4a;
    max-width: 540px;
    margin: 0 0 32px;
  }

  .prompt-row {
    display: flex;
    align-items: center;
    border-bottom: 2px solid #141414;
    padding-bottom: 10px;
    margin-bottom: 18px;
    max-width: 540px;
  }

  .prompt-row input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 15px;
    line-height: 1.4;
    font-family: inherit;
    padding: 0;
  }

  .prompt-row input::placeholder {
    color: #b0b0b0;
  }

  .prompt-row button {
    background: none;
    border: none;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    color: #141414;
    cursor: pointer;
    font-family: inherit;
    padding: 0 0 0 12px;
    flex-shrink: 0;
  }

  .prompt-row button:hover {
    color: #d4541f;
  }

  .examples {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0;
  }

  .example {
    background: none;
    border: none;
    color: #8a8a8a;
    font-size: 12.5px;
    line-height: 1.4;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    text-decoration: underline;
    text-decoration-color: #d8d8d8;
    text-underline-offset: 3px;
  }

  .example:hover {
    color: #141414;
    text-decoration-color: #141414;
  }

  .example-sep {
    color: #d8d8d8;
    margin: 0 10px;
    font-size: 12.5px;
  }

  .hero-right {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: 38px;
  }

  .mock-window {
    border: 1px solid #e6e6e6;
    background: #fff;
  }

  .mock-bar {
    display: flex;
    gap: 6px;
    padding: 10px 12px;
    border-bottom: 1px solid #e6e6e6;
  }

  .mock-bar span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e6e6e6;
  }

  .mock-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 300px;
  }

  .mock-row {
    display: flex;
  }

  .mock-row.user {
    justify-content: flex-end;
  }

  .mock-bubble {
    max-width: 80%;
    padding: 9px 13px;
    font-size: 12.5px;
    line-height: 1.5;
  }

  .mock-bubble.user {
    background: #141414;
    color: #fff;
  }

  .mock-bubble.ai {
    background: #f0f0ed;
    color: #141414;
  }

  .mock-bubble.typing {
    display: flex;
    gap: 4px;
    padding: 12px 14px;
  }

  .mock-bubble.typing span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #aaa;
    animation: blink 1.2s infinite ease-in-out;
  }

  .mock-bubble.typing span:nth-child(2) {
    animation-delay: 0.15s;
  }
  .mock-bubble.typing span:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }

  .hero-right-caption {
    font-size: 11.5px;
    font-family: "Courier New", monospace;
    color: #b0b0b0;
    margin-top: 10px;
    text-align: right;
  }

  .divider {
    width: 100%;
    border-top: 1px solid #e6e6e6;
    padding: 28px 0;
  }

  .divider span {
    font-size: 11.5px;
    font-family: "Courier New", monospace;
    letter-spacing: 0.04em;
    color: #8a8a8a;
  }

  .faq-section {
    width: 100%;
    padding-bottom: 80px;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
  }

  .faq-row {
    background: none;
    border: none;
    border-bottom: 1px solid #e6e6e6;
    padding: 24px 0;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
  }

  .faq-row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .faq-q {
    font-size: 18px;
    font-weight: 600;
    color: #141414;
  }

  .faq-toggle {
    font-size: 20px;
    color: #8a8a8a;
    transition: transform 0.2s ease;
    line-height: 1;
  }

  .faq-toggle.open {
    transform: rotate(45deg);
    color: #d4541f;
  }

  .faq-a {
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.6;
    color: #4a4a4a;
    max-width: 600px;
  }

  .cta {
    width: 100%;
    background: #141414;
  }

  .cta-inner {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 64px;
    padding-bottom: 64px;
    gap: 24px;
    flex-wrap: wrap;
  }

  .tag-light {
    color: #888;
  }

  .cta h2 {
    font-size: 38px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin: 0;
    font-weight: 700;
    color: #fdfdfb;
  }

  .cta-btn {
    background: #d4541f;
    color: #fff;
    border: none;
    font-size: 14px;
    font-weight: 600;
    padding: 16px 28px;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    transition: background 0.15s ease;
  }

  .cta-btn:hover {
    background: #b8441a;
  }

  .footer {
    width: 100%;
  }

  .footer-inner {
    padding-top: 24px;
    padding-bottom: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #8a8a8a;
  }

  @media (min-width: 1400px) {
    .hero h1 {
      font-size: 76px;
    }
    .hero-sub {
      font-size: 18px;
      max-width: 600px;
    }
    .prompt-row {
      max-width: 600px;
    }
    .mock-body {
      min-height: 360px;
      padding: 24px;
    }
    .mock-bubble {
      font-size: 13.5px;
    }
    .cta h2 {
      font-size: 48px;
    }
    .faq-q {
      font-size: 20px;
    }
  }

  @media (max-width: 760px) {
    .inner {
      padding: 0 24px;
    }
    .hero-inner {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .hero h1 {
      font-size: 40px;
    }
    .hero-right {
      margin-top: 0;
    }
    .hero-right-caption {
      text-align: left;
    }
    .cta-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
