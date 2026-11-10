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

  const successObserver = new MutationObserver(() => {
    const alert = kitSignup.querySelector(
      ".formkit-alert-success, .formkit-alert[data-element='success']",
    );
    if (!alert || alert.hasAttribute("data-howdunnit-message")) return;
    if (!/confirm/i.test(alert.textContent)) return;

    alert.setAttribute("data-howdunnit-message", "true");
    alert.textContent = "You're on the list. Check your inbox to confirm.";
    successObserver.disconnect();
  });
  successObserver.observe(kitSignup, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
}
