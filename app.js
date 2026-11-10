function setupTabs(tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const panels = tabs
    .map((tab) => document.getElementById(tab.getAttribute("aria-controls")))
    .filter(Boolean);

  function selectTab(index, moveFocus = false) {
    const activeTab = tabs[index];
    if (!activeTab) return;

    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== activeTab.getAttribute("aria-controls");
    });

    if (moveFocus) activeTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(index));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      selectTab(nextIndex, true);
    });
  });
}

document.querySelectorAll('[role="tablist"]').forEach(setupTabs);

const signupForm = document.querySelector("#signup-form");
if (signupForm) {
  const responseFrame = document.querySelector("#signup-response");
  const status = document.querySelector("#signup-status");
  const submitButton = signupForm.querySelector('button[type="submit"]');
  const tokenInput = signupForm.elements.namedItem("token");
  let pendingToken = "";
  let timeoutId;

  function showSignupStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  }

  function finishSignup(success) {
    window.clearTimeout(timeoutId);
    pendingToken = "";
    submitButton.disabled = false;
    if (success) {
      showSignupStatus(
        "You're on the list. We'll be in touch when Howdunnit is ready.",
        "success",
      );
    } else {
      showSignupStatus(
        "We couldn't save your email. Please try again in a moment.",
        "error",
      );
    }
  }

  window.addEventListener("message", (event) => {
    if (event.source !== responseFrame.contentWindow) return;
    const response = event.data;
    if (
      !response ||
      response.type !== "howdunnit-signup" ||
      response.token !== pendingToken
    ) {
      return;
    }
    finishSignup(response.ok === true);
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (pendingToken) return;

    const endpoint = signupForm.dataset.endpoint.trim();
    let parsedEndpoint;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      showSignupStatus(
        "Signup isn't connected yet. Please check back soon.",
        "error",
      );
      return;
    }

    if (
      parsedEndpoint.protocol !== "https:" ||
      parsedEndpoint.hostname !== "script.google.com" ||
      !parsedEndpoint.pathname.includes("/macros/s/") ||
      !parsedEndpoint.pathname.endsWith("/exec")
    ) {
      showSignupStatus(
        "Signup isn't connected yet. Please check back soon.",
        "error",
      );
      return;
    }

    pendingToken = crypto.randomUUID();
    tokenInput.value = pendingToken;
    signupForm.action = parsedEndpoint.href;
    submitButton.disabled = true;
    showSignupStatus("Adding you to the list…", "pending");

    timeoutId = window.setTimeout(() => {
      finishSignup(false);
    }, 20000);
    HTMLFormElement.prototype.submit.call(signupForm);
  });
}
