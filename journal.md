# TFScope Build Journal

**Project:** TFScope — AI-Powered Transcription Factor Research Assistant
**Interview:** Flare Therapeutics, April 8, 2026
**Role:** Data Engineering / AI/ML Intern
**Started:** March 28, 2026

---

## How to Use This Journal

- **During the build:** Add rough notes here after completing any meaningful section. Ask Claude to clean them up into formal entries.
- **Before the interview:** Read through Architecture Decisions and Phase Milestones. The "Interview line" on each decision entry is what you say out loud.
- **To generate a PDF:** Ask Claude: "Generate a clean PDF of the build journal."
- **VS Code markdown preview:** Press `Cmd + Shift + V` to read this file rendered.

---

## Entry Index

| ID | Type | Title | Phase | Date |
|----|------|-------|-------|------|
| AD-01 | Architecture Decision | Phased build plan to guarantee a demo by April 5 | Planning | Mar 28 |
| AD-02 | Architecture Decision | Designed phases to be additive — no rewrites between phases | Planning | Mar 28 |
| AD-03 | Architecture Decision | Local Express over AWS Lambda for Phase 1 | Planning | Mar 28 |
| AD-04 | Architecture Decision | serverless-http from day one for Lambda readiness | Planning | Mar 28 |
| AD-05 | Architecture Decision | MongoDB Atlas over AWS DocumentDB | Planning | Mar 28 |
| AD-06 | Architecture Decision | Anthropic API over Groq / Llama for the LLM layer | Planning | Mar 28 |
| AD-07 | Architecture Decision | MCP over direct API calls | Planning | Mar 28 |
| AD-08 | Architecture Decision | Schema derived from real ChEMBL API before writing any code | Planning | Mar 28 |
| AD-09 | Architecture Decision | Two documents (brief + journal) over one mega-document | Planning | Mar 28 |
| AD-10 | Architecture Decision | Markdown over PDF as live working format for both documents | Planning | Mar 28 |
| AD-11 | Architecture Decision | pchembl_value over raw standard_value for compound ranking | Planning | Mar 28 |
| AD-12 | Architecture Decision | AWS Amplify for frontend, Lambda deferred to Phase 3 | Planning | Mar 28 |
| AD-13 | Architecture Decision | Created brief.md as a dedicated technical spec document | Planning | Mar 28 |
| AD-14 | Architecture Decision | Ordered brief.md sections by mental model depth | Planning | Mar 28 |
| AD-15 | Architecture Decision | Placed seed data spec before schema in the brief | Planning | Mar 28 |
| AD-16 | Architecture Decision | Annotated every file in folder structure with one-line description | Planning | Mar 28 |
| AD-17 | Architecture Decision | Wrote function reference before writing any code | Planning | Mar 28 |
| AD-18 | Architecture Decision | Two Mermaid diagrams — system diagram and call flow diagram | Planning | Mar 28 |

---

## Section 1 — Architecture Decisions

---

### [AD-01] Phased build plan to guarantee a demo by April 5

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Three explicit phases with hard cutoffs — Phase 1 must be demo-ready by April 5, three days before the interview
**Alternative:** Build the full project end-to-end in one pass, adding features as time allows
**Why:** With 11 days until the interview and a biology background of zero, building everything at once risked having nothing working by April 8. A phased plan guarantees a floor — even if Phases 2 and 3 never happen, Phase 1 is a complete, demonstrable project. The phases were ordered by interview impact: the AI + data layer first (what Flare cares about), AWS deployment last (nice to have).
**Interview line:** "I structured the build in phases with a hard deadline for Phase 1 three days before the interview — so I always had something I could demo regardless of what else I got done."

---

### [AD-02] Designed phases to be fully additive — no rewrites between phases

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Identify and solve phase transition traps before writing any code, so each phase only adds to the previous one
**Alternative:** Build Phase 1 quickly with whatever decisions felt natural, then deal with compatibility issues when starting Phase 2 and 3
**Why:** Two specific traps were identified upfront that would have forced rewrites:

**Trap 1 — Schema mismatch:** If field names were invented during manual Phase 1 seeding, the Phase 2 ETL pulling from ChEMBL's real API would produce differently named fields. MCP server queries would break. Solution: derive the schema from the real API first, then seed manually using that exact shape. The ETL in Phase 2 just automates the same shape going in.

**Trap 2 — Express to Lambda rewrite:** A standard Express app uses `app.listen()` which doesn't run on AWS Lambda. Solution: wrap with `serverless-http` from day one — two lines of code that make the same Express app run locally and on Lambda identically.

**Interview line:** "Before writing a single line of code I mapped out the two places where moving between phases would have forced rewrites, and made specific technical decisions in Phase 1 to prevent them."

---

### [AD-03] Local Express server over AWS Lambda for Phase 1

**Date:** March 28, 2026
**Phase:** 1
**Chose:** Run the MCP server as a local Express app during Phase 1
**Alternative:** Deploy to AWS Lambda from the start
**Why:** Lambda cold starts + MongoDB Atlas connection + MCP over HTTP adds three independent failure points for a first-time AWS user. Debugging a broken Lambda function means checking CloudWatch logs, wrestling with IAM permissions, dealing with VPC/IP whitelist issues, and redeploying zip files — all before writing any real app logic. The time cost was estimated at 2-3 days of debugging. That time was better spent on the data and AI layers, which are what Flare's interviewers will actually care about. Lambda is Phase 3 — by then the code is working and tested, and the deployment is just a lift not a build.
**Interview line:** "I chose to run locally in Phase 1 because debugging Lambda cold starts and IAM permissions would have eaten days I needed for the data and AI layers — the parts that actually matter to Flare."

---

### [AD-04] serverless-http wrapper from day one

**Date:** March 28, 2026
**Phase:** 1
**Chose:** Add `serverless-http` to the Express server from the first line of code, even though Phase 1 runs locally
**Alternative:** Write standard Express, rewrite as Lambda handlers in Phase 3
**Why:** `serverless-http` costs two lines of code added once. Without it, moving to Lambda in Phase 3 requires rewriting every route handler into the Lambda function signature — a non-trivial change that would need full retesting. With it, Phase 3 deployment is just pointing Lambda at the existing handler. The two lines are:
```js
const serverless = require('serverless-http');
module.exports.handler = serverless(app);
```
The app runs identically locally with `node server.js` and on Lambda via the exported handler.
**Interview line:** "I added serverless-http in Phase 1 so that moving to Lambda in Phase 3 is a deployment, not a rewrite — the same Express code runs in both environments."

---

### [AD-05] MongoDB Atlas over AWS DocumentDB

**Date:** March 28, 2026
**Phase:** 1
**Chose:** MongoDB Atlas free tier (M0 cluster, 512MB–5GB)
**Alternative:** AWS DocumentDB (MongoDB-compatible, managed by AWS)
**Why:** DocumentDB requires a VPC, which means configuring subnets, security groups, and private endpoints just to connect to a database — significant setup overhead for a POC. Atlas has a genuinely free tier with no VPC required, a browser-based UI for inspecting documents, and connection via a simple connection string. For a project where the goal is a working demo by April 5, Atlas eliminates days of infrastructure work. DocumentDB would be the right choice in production at a company with existing AWS infrastructure.
**Interview line:** "I used MongoDB Atlas because DocumentDB requires VPC configuration that would have taken days to set up — Atlas gets me a working database in 10 minutes on the free tier, and I can always migrate to DocumentDB in a production deployment."

---

### [AD-06] Anthropic API over Groq / Llama for the LLM layer

**Date:** March 28, 2026
**Phase:** 1
**Chose:** Anthropic API (Claude) as the LLM powering natural language queries
**Alternative:** Groq API or Hugging Face Inference API with Llama 3 or Mistral (both offer free tiers)
**Why:** MCP is Anthropic's own protocol. Claude's tool-use behavior — the mechanism that lets the LLM call MCP tools rather than hallucinating answers — is most reliable with the Anthropic API. Groq and Llama support function calling, but the reliability of structured tool calls (correct parameter types, no hallucinated tool names) is lower. For a project where the entire value proposition is the LLM querying real structured data, tool-call reliability is not a place to cut corners. The Anthropic API also has a free tier sufficient for a POC.
**Interview line:** "I used the Anthropic API because MCP is their protocol — tool-use reliability is highest with Claude, and for a project where the AI is supposed to query real data rather than hallucinate it, that reliability is the whole point."

---

### [AD-07] MCP over direct API calls from the frontend

**Date:** March 28, 2026
**Phase:** 1
**Chose:** Model Context Protocol (MCP) as the layer between the LLM and MongoDB
**Alternative:** Have the React frontend call the LLM directly, and have the LLM generate MongoDB queries as text that the backend executes
**Why:** MCP gives the LLM access to typed, named tools with defined input schemas. The LLM cannot call a tool that doesn't exist, cannot pass a parameter of the wrong type, and cannot return data it didn't actually retrieve. Direct query generation means the LLM could hallucinate a compound name, invent an IC50 value, or generate a malformed query. For a drug discovery tool where data accuracy matters, MCP is the difference between a research assistant and a text generator that sounds plausible. MCP is also what makes the project technically sophisticated — it's cutting-edge in 2026, and most intern candidates would not know to use it.
**Interview line:** "MCP forces the LLM to query real data through typed tools — it physically cannot hallucinate a compound because it has to retrieve it from MongoDB. That's the difference between a demo and something a scientist could trust."

---

### [AD-08] Schema derived from real ChEMBL API calls before writing any code

**Date:** March 28, 2026
**Phase:** Planning / Phase 1
**Chose:** Run actual ChEMBL API calls, inspect the raw JSON responses, and finalize the MongoDB schema from real field names and types before writing any seed data or application code
**Alternative:** Design the schema from documentation and intuition, then adjust when the ETL is built in Phase 2
**Why:** The planned schema based on documentation alone had several errors that would have caused the Phase 2 ETL to produce documents incompatible with what the MCP server was already querying:

- `standard_value` comes back from the API as a string (`"291.0"`) not a number — querying it numerically would fail silently
- `max_phase` also comes as `"4.0"` (string) not an integer
- The field is called `standard_inchi_key` in ChEMBL, not `inchi_key`
- `pchembl_value` exists in the API and is more useful than raw IC50 for ranking — it was missing from the planned schema entirely
- `ligand_efficiency` is a nested object `{ bei, le, lle, sei }` — not individual flat fields

Running the real API calls took 10 minutes and prevented days of schema migration work later.

**Real API calls run:**
```bash
curl "https://www.ebi.ac.uk/chembl/api/data/activity.json?target_chembl_id=CHEMBL235&standard_type=IC50&limit=2" | python3 -m json.tool
curl "https://www.ebi.ac.uk/chembl/api/data/molecule/CHEMBL121.json" | python3 -m json.tool
```
**Interview line:** "I ran the actual ChEMBL API calls before writing a single line of code and found five field-level errors in my planned schema — including two fields that come back as strings instead of numbers, which would have broken all my numeric filters silently."

---

### [AD-09] Two separate documents over one mega-document

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** TFScope Project Brief (technical ground truth for Claude Code) + Build Journal (decision log for interview prep) as two separate files
**Alternative:** One comprehensive document containing architecture, schema, decisions, and bug log
**Why:** The project brief is fed into Claude Code as context at the start of every session. Every token in that file is processed by the LLM — padding it with decision rationale, bug logs, and retrospective notes burns tokens on content that doesn't help Claude Code write better queries or MCP tools. The two documents serve different audiences: the brief serves Claude Code and needs to be lean and precise; the journal serves the interviewer and needs to be rich and narrative. Conflating them makes both worse.
**Interview line:** "I kept the technical brief lean specifically because it's fed to an LLM — every token gets processed, so I only include what helps it write correct code. The decision rationale lives in a separate journal I use for interview prep."

---

### [AD-10] Markdown as live working format, PDF generated on demand

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Maintain both documents as `.md` files inside the project folder; generate PDF only when needed for upload or final review
**Alternative:** Maintain as PDFs, regenerating the full document on every update
**Why:** PDF generation requires running a JavaScript build script (docx library) then a LibreOffice conversion — a full rebuild every time regardless of how small the change. A markdown file updates in under a second. Markdown files inside the project folder are also readable by Claude Code directly, meaning Claude Code stays aware of decisions and schema in real time without being explicitly told. VS Code renders markdown natively (`Cmd + Shift + V`) so readability is not sacrificed. PDFs are generated on demand — once before the interview for a clean printable copy.
**Interview line:** N/A — this is a workflow decision, not worth raising in the interview.

---

### [AD-11] pchembl_value over raw standard_value for compound ranking

**Date:** March 28, 2026
**Phase:** 1
**Chose:** Store and use `pchembl_value` as the primary field for ranking and filtering compounds by potency
**Alternative:** Sort and filter by `standard_value` (raw IC50 in nM)
**Why:** `pchembl_value` is `-log10(IC50)`, which means higher values indicate more potent compounds — a more intuitive direction for a filter ("show me compounds with pchembl_value above 7"). Raw IC50 sorts in the opposite direction (lower = more potent), which is counterintuitive in a UI and requires the MCP tool to explain the inversion. pchembl_value is also how medicinal chemists actually discuss potency in the literature. Both fields are stored in the document — standard_value for completeness and scientific accuracy, pchembl_value as the primary sort/filter key.
**Interview line:** "I use pchembl_value rather than raw IC50 for ranking because it's -log10(IC50) — higher means more potent, which is how medicinal chemists actually discuss potency, and it's more intuitive in a UI filter."

---

### [AD-12] AWS Amplify for frontend now, Lambda deferred to Phase 3

**Date:** March 28, 2026
**Phase:** 1 / 3
**Chose:** Deploy the React frontend to AWS Amplify as the one real AWS service in Phase 1; defer Lambda backend deployment to Phase 3
**Alternative (A):** Deploy everything to AWS from the start (Lambda + Amplify together)
**Alternative (B):** Keep everything local until Phase 3
**Why:** Amplify is essentially connecting a GitHub repo and clicking deploy — it has a live public URL within minutes and no VPC, IAM role, or zip file complexity. This means Phase 1 has a real AWS service with a real URL to share before the interview, which is meaningfully better than "it runs on my laptop." Lambda is a different complexity level — cold starts, IAM permissions, deployment packages — and the risk/reward during the pre-interview build period doesn't justify it. Discussing Lambda as planned architecture with a working Amplify deployment is a stronger interview position than a broken Lambda with nothing deployed.
**Interview line:** "The frontend is live on AWS Amplify — I prioritized that because it's low-risk and gives me a real URL to share. The backend is architected for Lambda with serverless-http, and deploying it is the next step."

---

### [AD-13] Created brief.md as a dedicated technical spec document

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** A dedicated markdown file (`brief.md`) as the single source of technical truth for the project — separate from the journal
**Alternative:** Keep all project information in one combined document, or rely on conversation history for context
**Why:** The brief serves two distinct audiences simultaneously: Claude Code (which reads it to write correct code) and the developer (who reads it to regain context between sessions). A combined document with decision rationale, bug logs, and interview prep mixed in would bloat the token count Claude Code processes on every session start without making it write better code. Separating them means the brief stays lean and precise, and the journal stays rich and narrative. Neither document compromises the other.
**Interview line:** "I maintained two separate documents — a lean technical brief for Claude Code to read as context, and a separate build journal for my own decision tracking. Mixing them would have wasted tokens on every session start without improving the code Claude Code produced."

---

### [AD-14] Ordered brief.md sections by mental model depth — orient, visualize, configure, plan, specify, verify

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** A deliberate top-to-bottom section order designed so that each section builds on the last, giving Claude Code (and a human reader) a complete mental model before encountering any detail
**Alternative:** Organize by importance, by phase, or alphabetically by topic
**Why:** Claude Code reads the brief sequentially before writing anything. If it encounters a function spec before understanding what the system does, the spec is context-free and the code will be worse. The ordering principle was: big picture first, then structure, then configuration, then plan, then detail, then verification. Specifically:
- Project overview first — establishes what exists and why before any technical detail
- System diagram second — turns the abstract description into a concrete visual before folder structure or function specs appear
- Folder structure third — now that components are understood from the diagram, where files live makes sense
- Environment variables and dependencies fourth — every function that follows references these; defining them before the function specs means no unexplained references
- Phase breakdown fifth — the ordered build steps reference packages and env vars already defined above
- Call flow diagram sixth — shows what functions exist and how they chain before the function reference, so each function is read in the context of how it fits the system
- Function reference seventh — the most detailed layer; only useful once everything above it is understood
- Seed data eighth — selection rationale that grounds the abstract schema in concrete examples
- Schema ninth — field definitions that seed data references
- Testing suite last — the most specific artifact; references exact function names, parameters, and expected outputs that must all be defined above it
**Interview line:** "I ordered the brief so that each section builds on the last — big picture to detail. Claude Code reads it top to bottom, so by the time it reaches a function spec it already understands the system architecture, where the file lives, and which environment variables the function uses."

---

### [AD-15] Placed seed data spec before schema in the brief

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Seed data spec (Section 9) appears before the MongoDB schema (Section 10)
**Alternative:** Schema first, then seed data
**Why:** The seed data section is a human-readable table of compound names and ChEMBL IDs with notes on why each compound was chosen. It does not require knowledge of field names to be useful — it is a selection rationale, not a document template. The schema section contains the field definitions. A reader who encounters the schema before the seed data has field names with no compounds to attach them to. A reader who sees the seed data first understands which real compounds exist, then sees the schema that describes how they are stored. The seed data grounds the abstract schema in concrete examples.
**Interview line:** N/A — internal document ordering decision.

---

### [AD-16] Annotated every file in the folder structure with a one-line purpose description

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Include a one-line comment next to every file and folder in the folder structure section
**Alternative:** List the folder tree without annotations, or describe files in prose separately
**Why:** A bare folder tree tells Claude Code where files live but not what they do. When Claude Code creates a new file or decides where to put a function, it needs to know the intended responsibility of each file — otherwise it makes its own judgment, which may conflict with the intended architecture. For example, without annotations Claude Code might put MongoDB query logic directly in `server.js` rather than `src/db/queries.js`. The one-line annotation for each file makes the separation of concerns explicit and enforceable. It also makes the folder structure useful for a human reader returning to the project after a break — scanning the annotated tree is faster than reading code to remember what each file does.
**Interview line:** "I annotated every file in the folder structure with its purpose so Claude Code knows the intended separation of concerns — otherwise it makes its own judgment about where logic belongs, which creates inconsistencies across files."

---

### [AD-17] Wrote function reference with callers, callees, and error handling for every function before writing any code

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Write a complete function reference section — parameters, return shape, who calls it, what it calls, and error handling contract — for every function in the project before any code is written
**Alternative:** Write function specs as code is built, or rely on Claude Code to make reasonable decisions about function signatures
**Why:** Three reasons. First, specifying callers and callees upfront means every function is designed with its full call chain in mind — there are no surprises when wiring functions together. If `handlers.js` calls `queries.js` which calls Mongoose, that chain is explicit before any of those files exist. Second, defining error handling contracts upfront prevents inconsistency — without a spec, one function might throw on empty results while another returns null, breaking the caller's assumptions. The brief specifies that query functions always return `[]` or `null` on empty, never throw, so every handler can be written with that guarantee. Third, Claude Code uses these specs to write correct function signatures on the first attempt rather than generating plausible-looking code that needs correction. The function reference also includes two additions beyond basic parameters: expected input/output shape shown as real JavaScript examples (not abstract type signatures), and error handling expectations explicitly stated per function. These were added because they represent the two most common sources of bugs when wiring a multi-layer system together.
**Interview line:** "I wrote the full function reference before writing any code — including who calls each function and what it calls — so the entire call chain was designed as a system before any individual piece was implemented. That prevented interface mismatches when wiring the layers together."

---

### [AD-18] Included both a system diagram and a call flow diagram as separate Mermaid diagrams

**Date:** March 28, 2026
**Phase:** Planning
**Chose:** Two Mermaid diagrams — a `graph TD` system diagram showing component connections, and a `sequenceDiagram` showing the step-by-step flow through a single user query
**Alternative:** One combined diagram, or no diagrams, or a single flowchart
**Why:** The two diagrams answer different questions. The system diagram answers "what are the components and how are they connected?" — it is a map of the architecture. The sequence diagram answers "what happens, in what order, when a user submits a query?" — it is a trace through a single execution. A developer returning to the project after a break needs the system diagram to reorient. Claude Code needs the sequence diagram to understand the exact ordering of async operations in `server.js` — particularly the two-step Anthropic API interaction where a `tool_use` response must be sent back as a `tool_result` before the final answer is returned. That ordering is invisible in the system diagram but explicit in the sequence diagram. Using Mermaid means both diagrams live as plain text in the markdown file, version-controllable, readable by Claude Code, and renderable in VS Code's markdown preview without any external tools.
**Interview line:** "I used two separate diagrams — one showing system architecture and one showing the exact sequence of a user query. The sequence diagram is what makes the two-step Anthropic tool-use interaction explicit: tool_use response → tool_result sent back → final answer. That ordering is easy to get wrong and the diagram makes it unambiguous."

---

## Section 2 — Bug Log

*No entries yet. Add bugs as they occur during the build.*

**Template:**
```
### [BUG-XX] Title
**Date:**
**Phase:**
**What broke:**
**What I tried:**
**What fixed it:**
**What I learned:**
```

---

## Section 3 — Things I Didn't Know Before

*No entries yet. Add learning moments as they occur.*

**Template:**
```
### [LRN-XX] Title
**Date:**
**Phase:**
**What I learned:**
**Why it matters for the project:**
```

---

## Section 4 — Phase Milestones

*No entries yet. Add when something works end-to-end for the first time.*

**Template:**
```
### [MS-XX] Title
**Date:**
**Phase:**
**What started working:**
**Notes:**
```

---

## Section 5 — Things I'd Do Differently

*Populated as the build progresses. Honest retrospective notes for interview self-critique moments.*

**Template:**
```
### [RET-XX] Title
**Date:**
**Phase:**
**What I'd change:**
**Why:**
```
