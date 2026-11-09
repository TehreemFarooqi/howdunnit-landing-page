const stageTabs = [...document.querySelectorAll("[data-stage]")];
const stagePanels = [...document.querySelectorAll("[data-panel]")];

function selectStage(index, moveFocus = false) {
  const tab = stageTabs[index];
  if (!tab) return;

  stageTabs.forEach((item, itemIndex) => {
    const active = itemIndex === index;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  stagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab.dataset.stage;
  });

  if (moveFocus) tab.focus();
}

stageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStage(index));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % stageTabs.length;
    if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + stageTabs.length) % stageTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = stageTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectStage(nextIndex, true);
  });
});

const investigation = document.querySelector("[data-investigation]");
if (investigation && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      investigation.classList.add("is-visible");
      observer.disconnect();
    },
    { threshold: 0.18 },
  );
  observer.observe(investigation);
} else {
  investigation?.classList.add("is-visible");
}

const signupForm = document.querySelector("[data-signup-endpoint]");
if (signupForm) {
  const status = signupForm.querySelector(".form-status");
  const submitButton = signupForm.querySelector('button[type="submit"]');

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";
    status.classList.remove("is-success");

    if (!signupForm.reportValidity()) return;

    const endpoint = signupForm.dataset.signupEndpoint.trim();
    if (!endpoint) {
      status.textContent =
        "Early access signup isn't connected yet. Please check back soon.";
      status.classList.add("is-error");
      return;
    }

    let url;
    try {
      url = new URL(endpoint);
    } catch {
      status.textContent =
        "Signup couldn't be completed. Please try again later.";
      status.classList.add("is-error");
      return;
    }

    if (url.protocol !== "https:") {
      status.textContent =
        "Signup couldn't be completed. Please try again later.";
      status.classList.add("is-error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: new FormData(signupForm),
        headers: { Accept: "application/json" },
        mode: "cors",
      });

      if (!response.ok) throw new Error("Signup request was rejected");
      signupForm.reset();
      status.textContent =
        "You're on the list. We'll be in touch when the Windows alpha is ready.";
      status.classList.add("is-success");
    } catch {
      status.textContent =
        "Signup didn't go through. Please try again in a moment.";
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Notify me <span aria-hidden="true">↗</span>';
    }
  });
}
