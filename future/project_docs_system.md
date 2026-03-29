# Project Documentation System

**What this file is:** A reusable specification for setting up the three-document system (`brief.md`, `journal.md`, `working_agreement.md`) that gives any AI coding assistant complete project context across sessions.

---

## How to Use This File

**For the human (you):**
1. Keep this file outside any specific project folder — it is reusable infrastructure, not project-specific
2. When starting a new project, drop this file into your project folder or attach it to your AI conversation
3. Copy the bootstrap prompt below and paste it as your first message
4. Remove this file from the project folder once the three documents are created — it is not part of the three-file context bundle

**For the AI reading this:**
Read this entire file before creating any documents. The three documents are a system — understanding how they relate to each other is as important as understanding each one individually. Do not create any files until you have read the full document, asked clarifying questions, proposed the structure, and received confirmation.

---

## Bootstrap Prompt

Copy and paste this as your first message when starting a new project:

```
I am starting a new coding project and want to set up the three-file documentation
system described in `project_docs_system.md`.

Read `project_docs_system.md` fully before doing anything.

Here is what I can tell you about the project so far:

[PROJECT DESCRIPTION — what it does, who it is for, what tech stack you are
considering, what the deadline or goal is]

Using only what I have told you and what is in `project_docs_system.md`, do the
following in order:

1. Ask me any clarifying questions you need before creating any files. Surface them
   all at once, not one at a time.
2. Once I have answered, propose the structure of each of the three files — what
   sections will be populated, what will be marked TODO, and why.
3. Wait for my confirmation before creating anything.
4. Create all three files: brief.md, journal.md, working_agreement.md.
5. Confirm what is populated, what is marked TODO, and what the first actionable
   step is.

Do not skip step 3. Do not create files before I confirm the proposed structure.
```

---

## The Problem This System Solves

AI coding assistants have no memory between sessions. Every time a new session starts, the AI has zero context about what has been built, what decisions were made, and how the developer wants to work. Without a structured solution, the developer must re-explain everything from scratch — or accept that the AI will make decisions that conflict with previous ones.

This system solves that problem with three markdown files that together give any AI session complete context in a single prompt.

---

## The Three Files

### `brief.md`
**What it is:** The technical ground truth of the project.
**Primary reader:** The AI coding assistant (Claude Code or equivalent).
**Secondary reader:** The developer returning to the project after a break.
**Tone:** Precise, lean, zero narrative. Only what is needed to write correct code.
**Key rule:** If a piece of information does not help an AI write better code, it does not belong here.

### `journal.md`
**What it is:** A running log of decisions, bugs, learnings, and milestones.
**Primary reader:** The developer — for interview prep, presentations, and build retrospectives.
**Secondary reader:** The AI, to understand the history and reasoning behind the current state.
**Tone:** Narrative, explicit reasoning, written in the developer's voice.
**Key rule:** Every meaningful decision gets an entry. Every bug that took more than 30 minutes to fix gets an entry. Every milestone gets an entry.

### `working_agreement.md`
**What it is:** The rules for how the developer and AI work together on this project.
**Primary reader:** The AI at the start of every session.
**Secondary reader:** The developer, to hold the AI accountable.
**Tone:** Direct, specific, no ambiguity. Written as instructions, not suggestions.
**Key rule:** If the developer has a preference about how the AI should behave, it goes here — not repeated in conversation every session.

---

## How to Gather Project Context

Before writing the project overview in `brief.md`, the AI must establish sufficient context. This section defines what to ask, what to derive, and how to ask it.

### The rule on asking questions

Surface all clarifying questions at once — never one at a time. Only ask what is not already answered by what the developer has told you. If the developer says "I'm building a React dashboard that pulls from a REST API, deadline is next Friday," do not ask what the project does or what the deadline is. Read what you have been given, identify the gaps, and ask only about the gaps.

### Always establish before writing anything

These topics must be covered before the project overview can be written. If any are not answered by the developer's initial description, ask about them:

**What the project does**
- What does it do, in one sentence, for someone who has never heard of it?
- Who uses it — a developer, an end user, a scientist, a business?
- What problem does it solve that a simpler solution would not?

**What makes it non-trivial**
- What is the hardest part technically?
- What would make someone who reviews this project say "that's interesting" rather than "that's a tutorial"?

**The goal and deadline**
- What does success look like concretely — a working demo, a deployed app, a portfolio piece, a passing interview?
- Is there a hard deadline? If so, what is it?
- What is the floor — the minimum that must exist by the deadline?

**Tech stack and constraints**
- Is the tech stack decided, partially decided, or open?
- Are there constraints — free tier only, specific language, specific cloud provider?
- Are there external APIs or data sources involved? If so, which ones?

**Starting point**
- Is this day one, or is there existing code?
- If there is existing code, what exists and what does not?
- Are there architectural decisions already made that should not be revisited?

**The brief's primary reader**
- Will this brief be read only by the developer, or also by a team or another AI?
- Will it be fed to Claude Code or an equivalent coding assistant?
- This determines how lean or annotated the brief needs to be.

### Derive from context — do not ask explicitly

These should be inferred from what the developer tells you, not asked as direct questions:

- **How detailed the phase breakdown should be** — infer from deadline proximity. Three days to deadline means very granular steps. Three months means higher-level phases.
- **How many TODOs to leave** — infer from how much the developer already knows. If they have already made key architectural decisions, fewer TODOs. If the project is early and open, more TODOs.
- **Tone of the working agreement** — infer from how the developer communicates. Formal and precise, or conversational and flexible.

### What a good project overview contains

Once context is gathered, the project overview in `brief.md` should answer these questions in two to four short paragraphs:

1. What does the project do and who uses it?
2. What is the end-to-end flow — what happens when a user takes the primary action?
3. What makes it non-trivial — what is the technically interesting part?
4. What are the named targets, entities, or concepts that will appear throughout the brief (e.g. specific API names, database collections, clinical targets, user roles)?

The overview should be dense enough that someone who has never heard of the project understands it fully after one read, and lean enough that it does not repeat information covered in later sections.

---

## Why Three Files and Not One

Each file serves a different reader with different needs at different times.

`brief.md` is processed by the AI on every session start. Padding it with narrative, rationale, or history adds tokens that the AI processes but that do not improve its code output. Keeping it lean makes every session faster and the AI's outputs more focused.

`journal.md` is read by the developer preparing for an interview, a presentation, or a conversation about the project. It needs to be rich, narrative, and searchable. Mixing it into the brief would make the brief too long and the journal too technical.

`working_agreement.md` contains meta-instructions about the working relationship. If these were in the brief, the AI would have to parse behavioral rules alongside technical specs. Separating them makes both cleaner and makes the working agreement easy to update without touching the technical ground truth.

---

## How to Populate Each File

---

### How to Build `brief.md`

#### Ordering principle
Order sections so that each one builds on the last. A reader — human or AI — should never encounter a reference before it is defined. The correct order is:

1. **Project overview** — one paragraph. What the project does, who it is for, what makes it non-trivial.
2. **System diagram** — Mermaid `graph TD`. Shows components and connections. Read before anything else.
3. **Folder structure** — annotated file tree. Every file gets a one-line comment describing its purpose and responsibility.
4. **Environment variables** — every `.env` variable with name, purpose, and which file uses it. Never include actual values.
5. **Dependencies** — every package with install command and one-line reason for choosing it.
6. **Phase breakdown** — ordered build steps per phase. Each step small enough to complete in one sitting.
7. **Call flow diagram** — Mermaid `sequenceDiagram`. Shows the step-by-step execution of one complete user action.
8. **Function reference** — every function with parameters, return shape, caller, callees, and error handling contract.
9. **Seed data spec** — if the project uses a database, define the initial data before the schema.
10. **Schema** — the exact data model. Field names, types, and any transformation rules.
11. **Testing suite** — unit tests, integration tests, and manual demo tests. Every test references functions defined above it.

#### What belongs in brief.md
- Folder structure with file-level annotations
- Environment variable names and locations (never values)
- Package names and why each was chosen
- Phase checklists with granular ordered steps
- Function signatures, parameters, return types, callers, callees
- Error handling contracts per function
- Data schema with exact field names and types
- Type conversion rules (e.g. API returns string, store as float)
- Test cases with pass conditions
- Mermaid diagrams

#### What does not belong in brief.md
- Why a decision was made (belongs in journal.md)
- What alternatives were considered (belongs in journal.md)
- Bug history (belongs in journal.md)
- Interview talking points (belongs in journal.md)
- Actual secret values for environment variables (belong only in .env)
- Narrative or conversational prose

#### Annotating the folder structure
Every file in the folder tree must have a one-line comment. Without annotations, an AI will make its own judgment about what belongs in each file — which creates inconsistency across the codebase.

```
src/
  db/
    connection.js     # MongoDB connection setup — called once on server start
    queries.js        # All database query functions — called by handlers.js only
  mcp/
    tools.js          # MCP tool schema definitions — sent to LLM with every request
    handlers.js       # Tool handler functions — calls queries.js, called by server.js
```

#### Writing function references
Every function needs six things:
1. **Purpose** — one sentence describing what it does
2. **Parameters** — name, type, and valid values for each
3. **Returns** — exact shape of the return value, including the null/empty case
4. **Called by** — which file and function calls this one
5. **Calls** — which functions this one calls
6. **Error handling** — what happens on failure. Never leave this implicit.

Include a concrete JavaScript example showing expected input and output. Type signatures are not enough — show real values.

#### Writing the phase breakdown
Each phase has a goal statement and an ordered checklist. Rules for checklist items:
- Each item is one sitting of work (1-3 hours maximum)
- Each item is specific enough that the developer knows exactly what file to open
- Items that have associated tests must include a "run tests" step before moving on
- Do not write "build the X module" — write "create `src/X.js`, implement `functionA()` and `functionB()`, run unit tests"

#### Marking TODOs
Use `TODO:` as a prefix for any section that cannot be filled in yet. TODOs should be filled in just before they are needed — not all at once upfront and not after the code is already written. The brief is a living document.

---

### How to Build `journal.md`

#### Structure
The journal has five sections. All five exist from the start, even when empty. Each has a template so entries are consistent.

**Section 1 — Architecture Decisions**
Every time a meaningful technical choice is made — framework, library, data model, deployment approach, document structure — it gets an entry. The entry captures: what was chosen, what the alternative was, why one was chosen over the other, and one polished sentence the developer can say out loud in an interview.

Entry template:
```
### [AD-XX] Title
**Date:**
**Phase:**
**Chose:** What you went with
**Alternative:** What you considered instead
**Why:** The full reasoning
**Interview line:** One polished sentence, ready to say out loud
```

**Section 2 — Bug Log**
Every bug that took more than 30 minutes to resolve gets an entry. Captures: what broke, what was tried, what fixed it, what was learned.

Entry template:
```
### [BUG-XX] Title
**Date:**
**Phase:**
**What broke:**
**What I tried:**
**What fixed it:**
**What I learned:**
```

**Section 3 — Things I Didn't Know Before**
Genuine learning moments. Things the developer had to look up, figure out, or had wrong until building this project. These are valuable interview material — they show real learning during the build.

Entry template:
```
### [LRN-XX] Title
**Date:**
**Phase:**
**What I learned:**
**Why it matters for the project:**
```

**Section 4 — Phase Milestones**
A short entry when something works end-to-end for the first time. Timestamped. These give the build a narrative arc.

Entry template:
```
### [MS-XX] Title
**Date:**
**Phase:**
**What started working:**
**Notes:**
```

**Section 5 — Things I'd Do Differently**
Honest retrospective notes. Things the developer would change if starting over. Populated as the build progresses, not at the end. These are valuable in interviews — they demonstrate self-awareness and technical maturity.

Entry template:
```
### [RET-XX] Title
**Date:**
**Phase:**
**What I'd change:**
**Why:**
```

#### Entry index
Maintain a table at the top of the journal listing every entry with its ID, type, title, phase, and date. This makes it scannable before an interview without reading every entry.

#### How journal entries are created
The workflow is:
1. Developer gives rough notes (can be messy, incomplete, conversational)
2. AI drafts the formal entry using the correct template
3. Developer confirms or requests changes
4. AI (Claude Code) writes the confirmed entry to `journal.md` directly

The AI in the conversation shapes the entry. Claude Code writes it to disk. This keeps the conversational AI focused on thinking and the coding AI focused on file operations.

#### When to create entries
- After completing a full phase step from the checklist
- After resolving a bug
- After making a decision not already captured
- When something works end-to-end for the first time
- At natural stopping points, the AI asks: "Do you want to add a journal entry for what we just completed?"

---

### How to Build `working_agreement.md`

#### What it contains
The working agreement captures every preference, rule, and expectation the developer has about how the AI should behave on this project. It is written once at the start and updated only when the working relationship explicitly changes.

#### Required sections

**The three files** — confirms the names of all three documents and the order they are read at session start.

**How decisions are made** — specifies that the AI proposes before acting, pushes back when something is wrong, improves on developer ideas rather than executing literally, and surfaces decisions one at a time.

**How the AI communicates** — tone, directness, when to explain reasoning, when to be concise.

**How documents are updated** — exact workflow for updating each file. Who writes what, who confirms, who executes the file operation.

**How the build progresses** — phase discipline (no skipping phases), step granularity, just-in-time TODO filling, test-before-proceeding rule.

**Starting a new session checklist** — a literal checklist the AI runs through at the start of every session before doing anything else. Minimum items:
- Read all three files
- Confirm current phase and step
- Confirm last completed item
- Confirm next actionable step
- Flag relevant open TODOs
- Wait for go-ahead

**Project context** — project name, interview/deadline date if applicable, current phase, priority statement.

#### Tone
Write the working agreement as direct instructions, not suggestions. "Propose before acting" not "it would be good to propose before acting." The AI reading this should have no ambiguity about what is expected.

---

## Anti-Patterns

These are the failure modes this system is designed to prevent. An AI setting up these documents should know what went wrong in the past.

**Putting decision rationale in brief.md**
The brief is processed by the AI on every session start. Rationale adds tokens without improving code quality. The brief answers "what" and "how" — the journal answers "why."

**Not annotating the folder structure**
Without annotations, the AI makes its own judgment about what belongs in each file. This creates inconsistency — database logic ends up in the server file, handler logic ends up in the database file. Annotate every file.

**Inventing schema from documentation instead of real API calls**
If the project uses an external API as a data source, the schema must be derived from real API responses before writing any code or seed data. Documentation is often incomplete or outdated. Run the actual calls first.

**Making phases non-additive**
If later phases require rewriting earlier phase code, the build is at risk. Every architectural decision in Phase 1 should be made with Phase 2 and 3 in mind. Identify transition traps before writing any code.

**Filling in all TODOs upfront**
TODOs exist because some decisions cannot be made without information that comes later. Forcing those decisions early produces wrong answers. Fill in TODOs just before they are needed.

**Updating documents by re-uploading to the conversational AI**
The conversational AI (this chat) should shape documents — write entries, plan sections, confirm content. Claude Code should write files to disk. Re-uploading files to the conversational AI creates version confusion and slows everything down. Claude Code has direct file access — use it.

**One mega-document instead of three**
A single document serves no reader well. The AI needs a lean brief. The developer needs a rich journal. The working relationship needs its own explicit home. Conflating them makes all three worse.

---

## Maintaining the System Over Time

**brief.md** is updated when a TODO section is ready to be filled in, when a function signature changes, or when a new phase begins and its checklist needs to be populated. It is always updated by Claude Code directly in the project folder — never by re-uploading to the conversational AI.

**journal.md** is updated continuously throughout the build. New entries are added after every meaningful step, decision, bug, or milestone. The conversational AI drafts entries; Claude Code writes them to disk.

**working_agreement.md** is updated only when the working relationship explicitly changes. It should be stable after the first session.

**project_docs_system.md** (this file) is not project-specific. It lives outside the project folder and is reused across projects. Update it when a new pattern is discovered or a new anti-pattern is identified.
