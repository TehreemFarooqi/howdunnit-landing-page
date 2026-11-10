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

const kitSignup = document.querySelector(".kit-signup");
if (kitSignup) {
  const setSubmitLabel = () => {
    const label = kitSignup.querySelector(
      '.formkit-submit span',
    );
    if (!label || label.textContent.trim() !== "Notify me!") return false;
    label.textContent = "Notify me at launch";
    return true;
  };

  if (!setSubmitLabel()) {
    const observer = new MutationObserver(() => {
      if (setSubmitLabel()) observer.disconnect();
    });
    observer.observe(kitSignup, { childList: true, subtree: true });
  }

  const showConfirmation = () => {
    const alert = kitSignup.querySelector(
      ".formkit-alert-success, .formkit-alert[data-element='success']",
    );
    if (!alert || !/confirm/i.test(alert.textContent)) return false;

    const form = kitSignup.querySelector(".formkit-form");
    if (form) form.insertAdjacentElement("afterend", alert);
    alert.hidden = false;
    alert.removeAttribute("aria-hidden");
    alert.textContent = "You're on the list. Check your inbox to confirm.";
    alert.classList.add("howdunnit-confirmation");
    alert.setAttribute("role", "status");
    alert.setAttribute("aria-live", "polite");
    alert.setAttribute("aria-atomic", "true");
    kitSignup.dataset.signupState = "success";
    return true;
  };

  const successObserver = new MutationObserver(() => {
    if (showConfirmation()) successObserver.disconnect();
  });
  successObserver.observe(kitSignup, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
  if (showConfirmation()) successObserver.disconnect();
}
