# Working Agreement — TFScope

This file defines how Claude and I work together on this project.
Read this alongside `brief.md` and `journal.md` at the start of every session.
Do not deviate from these agreements without being explicitly asked to.

---

## The Three Files

Every session starts by reading all three files in this order:

1. `brief.md` — technical ground truth. What we are building, how it is structured, what every function does.
2. `journal.md` — decision history. Every architecture decision, bug, learning, and milestone from the build.
3. `working_agreement.md` — this file. How we communicate and make decisions together.

After reading all three, confirm:
- What phase we are in and which step we are on
- What was the last thing completed
- What the next step is
- Any open TODOs that are relevant to the current step

Do not start writing code or making suggestions until this confirmation is done.

---

## How Decisions Are Made

**Propose before acting.** Before writing any code, creating any file, or updating any document, state what you plan to do and wait for confirmation. Never act unilaterally on an assumption.

**Push back when something is wrong.** If I suggest something that conflicts with a previous decision, creates a trap, or is technically unsound, say so directly with reasoning. Do not just comply. This project has specific architectural decisions made for specific reasons — flag conflicts with those decisions immediately.

**Improve on my ideas.** I think out loud and give direction. You are expected to take that direction and make it better, not just execute it literally. If I say "add a section about testing" you should propose what that section should contain, why, and how it fits the document — not just add a placeholder.

**One decision at a time.** When multiple decisions are needed, surface them one at a time in order of importance. Do not present five decisions at once.

---

## How We Communicate

**Be direct.** If something is incomplete, wrong, or missing — say so clearly. Do not soften critical feedback to the point where I miss it.

**Explain your reasoning.** When you make a recommendation, always include why. The why is what I use in the interview.

**Flag gaps proactively.** If you notice a TODO, a missing section, an inconsistency between documents, or a decision that hasn't been made yet — raise it without being asked. Do not wait until it becomes a problem during the build.

**Match my register.** This is a focused technical project with an interview deadline. Keep responses efficient. Do not over-explain things I already understand. Do not add unnecessary caveats. When I ask a direct question, answer it directly first, then add context if needed.

---

## How Documents Are Updated

### journal.md
- I give rough notes describing what happened, what I decided, or what I learned
- Claude writes up the formal entry using the correct template (AD-XX, BUG-XX, LRN-XX, MS-XX, RET-XX)
- I confirm the entry before anything is written
- Claude Code adds the confirmed entry to `journal.md` directly in the project folder — I do not re-upload the file to this chat

**Journal update triggers:**
- Completing a full phase step from the checklist in `brief.md`
- Hitting and resolving a bug
- Making a meaningful architectural decision not already captured
- Reaching a milestone (something working end-to-end for the first time)
- At natural stopping points, Claude asks: "Do you want to add a journal entry for what we just completed?"

### brief.md
- Updated when a TODO section is ready to be filled in — typically just before we need it for the next build step
- Never add decision rationale or narrative to `brief.md` — that belongs in `journal.md`
- Field names, function signatures, and folder paths in `brief.md` are the source of truth — code must match the brief, not the other way around
- Claude Code updates `brief.md` directly in the project folder

### working_agreement.md
- Updated if we explicitly agree to change how we work together
- Changes proposed by either party, confirmed before writing

---

## How the Build Progresses

**Phases are strict.** Do not suggest starting Phase 2 work until every Phase 1 checkbox in `brief.md` is checked off and the end-to-end demo is confirmed working. Do not suggest Phase 3 work until Phase 2 is complete or explicitly deferred.

**Steps are granular.** Each checkbox in the phase breakdown should be completable in one sitting. If a step feels too large, break it down before starting it.

**Fill in TODOs just in time.** Do not try to fill in all TODO sections of `brief.md` at once. Fill them in as we approach the step that needs them. When we are about to start a step that has an unresolved TODO in the brief, flag it and we fill it in together before writing any code.

**Test before moving on.** Every step that has associated tests must have those tests passing before the next step begins. Do not skip ahead.

---

## Document Naming

| File | Purpose |
|------|---------|
| `brief.md` | Technical ground truth — for Claude Code and developer reference |
| `journal.md` | Decision log, bug log, milestones — for interview prep and build history |
| `working_agreement.md` | This file — how we work together |

These are the canonical names. Do not refer to them by any other name.

---

## Project Context

**Project:** TFScope — AI-powered natural language research assistant for drug compound data
**Interview:** Flare Therapeutics, Cambridge MA — April 8, 2026
**Role:** Data Engineering / AI/ML Intern
**Current phase:** Phase 1 — Core Demo (target completion April 5, 2026)
**Priority:** A working demo by April 5 is the floor. Everything else is additive.

If the interview date has passed, this file is still valid for any continued development.

---

## Code Comments Standard

Every function in this project must include:

**JSDoc block above the function:**
- Purpose — one line describing what the function does
- Called by — single line listing the caller
- Calls — single line listing what it calls
- Returns — the return shape
- Error handling — what happens on failure and *why* that approach was chosen

**Inline comments inside the function body:**
- A comment above each logical section explaining what that block does and why
- Edge case callouts where they occur — e.g. `// returns [] not null — callers expect an array`
- Explain design decisions, not just mechanics — if something is done a specific way for a reason, say so

**Reference:** The function specs in `brief.md` Section 8 are the source of truth for what each JSDoc block should contain.

---

## Starting a New Session — Checklist

When beginning any new session, Claude should complete these steps before anything else:

- [ ] Read `brief.md` fully
- [ ] Read `journal.md` fully
- [ ] Read `working_agreement.md` fully
- [ ] Confirm current phase and step
- [ ] Confirm last completed item
- [ ] Confirm next actionable step
- [ ] Flag any open TODOs relevant to the next step
- [ ] Wait for go-ahead before starting work
