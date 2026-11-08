/* ==========================================================
   Feedback & Guided Review page
   ========================================================== */
(function () {
  const idx = questionIndexFromUrl();
  const q = QUESTIONS[idx];
  const num = idx + 1;
  const total = QUESTIONS.length;
  const saved = Store.getAnswer(idx);

  // No answer yet -> send them to the question.
  if (!saved) {
    location.replace(`quiz.html?q=${num}`);
    return;
  }

  const correct = saved.choice === q.answer;
  const optText = key => q.options.find(o => o.key === key).text;
  const shortText = key => optText(key).replace(/^Node\s+/, "");

  // ----- Heading + question recap -----
  document.title = `Feedback · Question ${num} · COS212 DFS Tutor`;
  document.getElementById("eyebrow").textContent = `Feedback / Guided review · Question ${num} of ${total}`;
  document.getElementById("fb-title").textContent = correct
    ? "Nice work — that's correct"
    : "Not quite — let's work through it";
  document.getElementById("q-tag").textContent = `QUESTION ${String(num).padStart(2, "0")} • ${q.tag}`;
  document.getElementById("q-prompt").textContent = q.prompt;

  // ----- Result strip -----
  const result = document.getElementById("result");
  result.className = "result " + (correct ? "result--right" : "result--wrong");
  result.innerHTML = "";
  result.append(
    el("span", { class: "pill " + (correct ? "pill--right" : "pill--wrong") },
      `${correct ? "✓" : "✗"} Your answer: ${shortText(saved.choice)}`)
  );
  if (!correct) {
    result.append(el("span", { class: "pill pill--right" }, `✓ Correct answer: ${shortText(q.answer)}`));
  }

  // ----- Explanation -----
  document.getElementById("explain").textContent = correct ? q.why : q.wrong[saved.choice];
  document.getElementById("explain-extra").textContent = correct ? "" : q.why;

  // Confidence-aware note (calibration, not penalty)
  const confNote = document.getElementById("confidence-note");
  const conf = saved.confidence;
  const notes = {
    right: {
      guessing: "You said you were guessing — the explanation above shows why it works, so you can be sure next time.",
      unsure: "You were unsure, but your reasoning was right. Trust it.",
      fairly: "Good calibration — you were fairly sure and correct.",
      certain: "Confident and correct. Well done."
    },
    wrong: {
      guessing: "You flagged this as a guess, which is a great signal of what to review.",
      unsure: "You were unsure — that's a useful flag. The hints below walk through the reasoning.",
      fairly: "You felt fairly sure, so this is a misconception worth fixing before lecture.",
      certain: "You were certain, so this is an important one to revisit. Try the worked example below."
    }
  };
  confNote.textContent = conf ? notes[correct ? "right" : "wrong"][conf] : "";

  // ----- Progressive hints (each unlocks the next) -----
  const hintsEl = document.getElementById("hints");
  if (correct) document.getElementById("hints-title").textContent = "Reasoning, step by step";
  const toggles = [];
  q.hints.forEach((text, i) => {
    const id = `hint-body-${i}`;
    const toggle = el("button", {
      class: "hint__toggle", type: "button", "aria-expanded": "false", "aria-controls": id
    });
    const label = el("span", {}, `Hint ${i + 1}`);
    const lock = el("span", { class: "hint__lock", text: i === 0 ? "" : " · reveal hint " + i + " first" });
    label.append(lock);
    toggle.append(label, el("span", { class: "chev", "aria-hidden": "true", text: "▾" }));
    toggle.disabled = i !== 0;

    const body = el("div", { class: "hint__body", id, hidden: "" }, text);
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      body.hidden = open;
      // unlock the next hint once this one has been opened
      const next = toggles[i + 1];
      if (!open && next && next.disabled) {
        next.disabled = false;
        next.querySelector(".hint__lock").textContent = "";
      }
    });
    toggles.push(toggle);
    hintsEl.append(el("div", { class: "hint" }, toggle, body));
  });

  // ----- Review panel -----
  document.getElementById("review-text").textContent = q.review;
  renderTree(document.getElementById("tree"), q.tree || { visited: [], current: null });

  // ----- Worked example (stack animation) -----
  const worked = document.getElementById("worked");
  const replayBtn = document.getElementById("replay-btn");
  const stackEl = document.getElementById("stack");
  const noteEl = document.getElementById("step-note");
  const orderEl = document.getElementById("visit-order");
  const countEl = document.getElementById("step-count");
  const prevBtn = document.getElementById("step-prev");
  const nextBtn = document.getElementById("step-next");
  const playBtn = document.getElementById("step-play");
  let step = 0;
  let timer = null;

  function drawStep() {
    const s = DFS_STEPS[step];
    renderTree(document.getElementById("worked-tree"), { visited: s.visited, current: s.current });
    noteEl.textContent = s.note;
    orderEl.textContent = s.visited.length ? s.visited.join(" → ") : "—";
    stackEl.innerHTML = "";
    if (!s.stack.length) {
      stackEl.append(el("p", { class: "stack__empty", text: "empty" }));
    } else {
      s.stack.forEach((v, i) => {
        const top = i === s.stack.length - 1;
        stackEl.append(el("div", { class: "stack__item" + (top ? " stack__item--top" : "") }, top ? `${v}  ← top` : String(v)));
      });
    }
    countEl.textContent = `Step ${step + 1} of ${DFS_STEPS.length}`;
    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === DFS_STEPS.length - 1;
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    playBtn.textContent = "Auto-play";
  }

  prevBtn.addEventListener("click", () => { stop(); if (step > 0) { step--; drawStep(); } });
  nextBtn.addEventListener("click", () => { stop(); if (step < DFS_STEPS.length - 1) { step++; drawStep(); } });
  playBtn.addEventListener("click", () => {
    if (timer) { stop(); return; }
    if (step === DFS_STEPS.length - 1) step = 0;
    drawStep();
    playBtn.textContent = "Pause";
    timer = setInterval(() => {
      if (step >= DFS_STEPS.length - 1) { stop(); return; }
      step++;
      drawStep();
    }, 1400);
  });

  replayBtn.addEventListener("click", () => {
    const open = !worked.hidden;
    if (open) {
      stop();
      worked.hidden = true;
      replayBtn.setAttribute("aria-expanded", "false");
      replayBtn.textContent = "▶ Replay worked example";
      return;
    }
    step = q.stepFocus || 0;
    drawStep();
    worked.hidden = false;
    replayBtn.setAttribute("aria-expanded", "true");
    replayBtn.textContent = "Hide worked example";
    worked.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ----- Pager -----
  const backBtn = document.getElementById("back-btn");
  const nextPage = document.getElementById("next-btn");
  const isLast = num === total;
  const forwardHref = isLast ? "summary.html" : `quiz.html?q=${num + 1}`;
  const forwardText = isLast ? "See summary →" : "Next question →";

  backBtn.href = `quiz.html?q=${num}`;
  if (correct) {
    nextPage.href = forwardHref;
    nextPage.textContent = forwardText;
  } else {
    nextPage.href = `quiz.html?q=${num}&retry=1`;
    nextPage.textContent = "Try again →";
    // secondary option to move on without retrying
    const skip = el("a", { class: "btn btn--ghost", href: forwardHref }, isLast ? "Skip to summary" : "Skip to next");
    nextPage.before(skip);
    const wrap = el("div", { style: "display:flex;gap:10px;flex-wrap:wrap" });
    skip.before(wrap);
    wrap.append(skip, nextPage);
  }
})();
