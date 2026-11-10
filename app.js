const stageTabs = [...document.querySelectorAll(".stage-tab")];
const stagePanels = [...document.querySelectorAll(".stage-panel")];

function selectStage(index, moveFocus = false) {
  const tab = stageTabs[index];
  if (!tab) return;

  stageTabs.forEach((item, itemIndex) => {
    const active = itemIndex === index;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  stagePanels.forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute("aria-controls");
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

const markedFrames = [...document.querySelectorAll(".hero-demo, .contact-sheet")];
if ("IntersectionObserver" in window) {
  const markerObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-marked");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 },
  );
  markedFrames.forEach((frame) => markerObserver.observe(frame));
} else {
  markedFrames.forEach((frame) => frame.classList.add("is-marked"));
}
