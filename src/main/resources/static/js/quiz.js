/* ==========================================================
   Readiness Quiz page
   ========================================================== */
(function () {
  const idx = questionIndexFromUrl();
  const q = QUESTIONS[idx];
  const num = idx + 1;
  const total = QUESTIONS.length;
  const pad = n => String(n).padStart(2, "0");

  // ----- Header + progress -----
  document.title = `Question ${num} · Readiness Quiz · COS212 DFS Tutor`;
  document.getElementById("eyebrow").textContent = `Readiness quiz / Question ${num} of ${total}`;
  document.getElementById("q-tag").textContent = `QUESTION ${pad(num)} • ${q.tag}`;
  document.getElementById("q-prompt").textContent = q.prompt;
  document.getElementById("progress-bar").style.width = `${(num / total) * 100}%`;
  document.querySelector(".progress").setAttribute("aria-valuenow", num);

  // ----- Options -----
  const optionsEl = document.getElementById("options");
  q.options.forEach(opt => {
    const input = el("input", { type: "radio", name: "answer", value: opt.key, id: `opt-${opt.key}` });
    const label = el("label", { class: "option", for: `opt-${opt.key}` },
      input,
      el("span", { class: "option__key", "aria-hidden": "true", text: opt.key }),
      el("span", { class: "option__text", text: opt.text })
    );
    optionsEl.appendChild(label);
  });

  // ----- Tree -----
  const treeBlock = document.getElementById("tree-block");
  if (q.tree) renderTree(document.getElementById("tree"), q.tree);
  else treeBlock.hidden = true;

  // ----- Restore a previous answer (e.g. after "Previous") -----
  const form = document.getElementById("quiz-form");
  const submitBtn = document.getElementById("submit-btn");
  const msg = document.getElementById("form-msg");
  const saved = Store.getAnswer(idx);
  const retry = new URLSearchParams(location.search).get("retry") === "1";
  if (saved && !retry) {
    const a = form.querySelector(`input[name="answer"][value="${saved.choice}"]`);
    if (a) a.checked = true;
    const c = form.querySelector(`input[name="confidence"][value="${saved.confidence}"]`);
    if (c) c.checked = true;
  }

  function updateState() {
    const hasAnswer = !!form.querySelector('input[name="answer"]:checked');
    submitBtn.disabled = !hasAnswer;
    msg.textContent = hasAnswer ? "" : "Choose an answer to continue.";
  }
  form.addEventListener("change", updateState);
  updateState();

  // ----- Previous -----
  const prevBtn = document.getElementById("prev-btn");
  if (idx === 0) {
    prevBtn.setAttribute("aria-disabled", "true");
    prevBtn.removeAttribute("href");
  } else {
    prevBtn.href = `quiz.html?q=${num - 1}`;
  }

  // ----- Submit -----
  form.addEventListener("submit", e => {
    e.preventDefault();
    const answer = form.querySelector('input[name="answer"]:checked');
    if (!answer) { updateState(); return; }
    const conf = form.querySelector('input[name="confidence"]:checked');
    Store.setAnswer(idx, answer.value, conf ? conf.value : null);
    location.href = `feedback.html?q=${num}`;
  });

  // Keyboard shortcut: press A–D to choose
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toUpperCase();
    const input = form.querySelector(`input[name="answer"][value="${key}"]`);
    if (input) {
      input.checked = true;
      input.focus();
      updateState();
    }
  });
})();
