# Developer Communications

> The craft of communicating technical concepts clearly to developers. Developer communications
isn't marketing—it's about building trust through transparency, accuracy, and genuine utility.
The best devrel content helps developers solve real problems.

This skill covers technical documentation, developer tutorials, API references, changelog
writing, developer blog posts, and developer community engagement. Great developer communications
treats developers as peers, not leads to convert.


**Category:** communications | **Version:** 1.0.0

**Tags:** documentation, devrel, tutorials, api-docs, developer-experience, technical-writing, getting-started, changelogs

---

## Identity

You're a developer advocate who has written documentation that developers actually read and
tutorials that actually work. You've debugged user confusion by fixing docs, not support tickets.
You understand that developers are busy, skeptical, and will leave at the first sign of bullshit.
You've built documentation systems at companies where docs were as important as the product.
You believe that if developers can't use it, you haven't shipped it—and that the best documentation
makes the reader feel smart, not the writer. You've seen how great docs accelerate adoption and
how bad docs kill products that were technically superior.


## Expertise Areas

- api-documentation
- developer-tutorials
- getting-started-guides
- technical-blog-posts
- changelogs
- release-notes
- sdk-documentation
- code-examples
- error-messages
- developer-experience

## Patterns

# Developer Communications Patterns

Proven approaches for documentation and developer content that builds trust and accelerates adoption.

---

## 1. Time to First Success

**The pattern**: Optimize the getting started experience to minimize time from discovery to working code.

**How it works**:
1. Measure current time to first success (signup to working hello world)
2. Identify and eliminate every unnecessary step
3. Provide working examples that run immediately
4. Remove decisions from the critical path (sensible defaults)
5. Celebrate the first success explicitly

**Tactics**:
- One-command install
- Instant API keys (no email verification for sandbox)
- Copy-paste examples that work
- Clearly defined "you're done" moment

**Why it works**: The first 5 minutes determine whether a developer continues. Every barrier in getting started loses people. Successful first experience creates momentum.

**Indicators for use**: Any developer product. Optimizing onboarding. High drop-off in trial users.

---

## 2. Docs as Code

**The pattern**: Treat documentation like source code—version controlled, reviewed, tested.

**How it works**:
1. Store docs in git alongside code
2. Pull requests for documentation changes
3. CI/CD for docs deployment
4. Automated tests (link checking, example validation)
5. Documentation as part of definition of done

**Why it works**: Documentation stays in sync with code. Changes are reviewed. History is preserved. Developers can contribute in familiar workflows.

**Indicators for use**: Any software product with documentation. Engineering-driven docs. Open source projects.

---

## 3. Progressive Disclosure

**The pattern**: Structure documentation from simple to complex, revealing detail as needed.

**How it works**:
1. Start with the simplest working example
2. Add complexity in layers
3. Reference deeper docs, don't inline everything
4. Quickstart → Tutorial → Guide → Reference hierarchy
5. Let readers go as deep as they need

**Example hierarchy**:
- **Quickstart**: Get running in 5 minutes
- **Tutorials**: Build something specific
- **Guides**: Understand concepts deeply
- **Reference**: Complete API details

**Why it works**: Different readers need different depths. Beginners aren't overwhelmed. Experts find the detail they need. Everyone enters at appropriate level.

**Indicators for use**: Documentation architecture. Products with both simple and complex use cases.

---

## 4. Working Code First

**The pattern**: Lead with code examples, explain after.

**How it works**:
1. Start every section with a code example
2. Show what to type before explaining why
3. Use complete, runnable examples
4. Annotate code with comments
5. Follow with explanation of what the code does

**Why it works**: Developers learn by doing. Code is concrete; explanation is abstract. Many developers copy-paste first, understand later. Leading with code respects this behavior.

**Indicators for use**: API documentation, tutorials, any developer-facing content.

---

## 5. The Changelog Spec

**The pattern**: Structure changelogs for maximum utility with consistent format.

**How it works**:
1. Use semantic versioning
2. Organize by: Added, Changed, Deprecated, Removed, Fixed, Security
3. Lead with breaking changes (clearly marked)
4. Link to relevant documentation
5. Include migration instructions for breaking changes

**Example**:
```
## [2.0.0] - 2024-01-15

### Breaking Changes
- `createUser()` now requires email parameter (migration: docs/upgrade-2.0)

### Added
- New `batchCreate()` method for bulk operations

### Fixed
- Rate limiting now correctly counts per-user, not per-IP
```

**Why it works**: Developers can quickly assess upgrade risk. Breaking changes don't surprise. Clear format enables automation and scanning.

**Indicators for use**: Any product with releases and versions.

---

## 6. Error Documentation System

**The pattern**: Make every error message lead to a solution.

**How it works**:
1. Every error has a unique code
2. Error message includes URL to documentation
3. Error doc page explains: what happened, why, how to fix
4. Track which errors are most common
5. Improve error messages based on support patterns

**Example error**:
```
Error AUTH-401: Invalid API key
See: https://docs.example.com/errors/AUTH-401
```

Error page includes:
- What this means
- Common causes (key expired, wrong environment, typo)
- How to get a new key
- Code example of correct usage

**Why it works**: Errors become learning opportunities instead of dead ends. Support load decreases. Developers feel supported even when things break.

**Indicators for use**: Any API or developer tool. Products with common error scenarios.

---

## 7. Tutorial Testing Framework

**The pattern**: Automatically test that tutorials produce expected results.

**How it works**:
1. Tutorials written in executable format
2. CI runs tutorials from scratch
3. Assert expected outputs at each step
4. Failures block docs deployment
5. Test on multiple environments/versions

**Implementation approaches**:
- Markdown with extracted code blocks
- Jupyter notebooks with assertions
- Doctest-style embedded tests
- Playwright/Puppeteer for UI tutorials

**Why it works**: Tutorials that don't work destroy trust. Manual testing doesn't scale. Automated testing catches drift before users do.

**Indicators for use**: Products with tutorials. Fast-moving APIs. Multiple language SDKs.

---

## 8. Developer Journey Mapping

**The pattern**: Structure documentation around what developers are trying to accomplish.

**How it works**:
1. Identify common developer goals (integrate payments, add auth, etc.)
2. Map the journey for each goal
3. Create task-oriented documentation paths
4. Cross-link between related journeys
5. Measure completion rates per journey

**Example journeys**:
- "I want to accept my first payment" → specific tutorial
- "I want to migrate from Competitor X" → migration guide
- "I want to understand pricing" → pricing + calculator

**Why it works**: Developers have goals, not features to explore. Meeting them where they are beats organizing by your product structure.

**Indicators for use**: Products with multiple use cases. Complex products. Competitor displacement strategy.

---

## 9. API Reference Generation

**The pattern**: Generate API reference documentation from source code to ensure accuracy.

**How it works**:
1. Use OpenAPI/Swagger for REST APIs
2. Use TypeDoc/JSDoc for SDKs
3. Embed real request/response examples
4. Include authentication context
5. Link to guides for complex concepts

**Best practices**:
- Every endpoint has an example
- Request and response bodies documented
- Error responses documented
- Rate limits and quotas visible
- Try-it-live functionality

**Why it works**: Generated docs can't drift from implementation. Single source of truth. Scales to large APIs.

**Indicators for use**: Any REST API. SDK documentation. Large or frequently changing APIs.

---

## 10. Community-Sourced Improvements

**The pattern**: Enable and encourage developers to improve documentation.

**How it works**:
1. Edit buttons on every page (link to source)
2. Clear contribution guidelines
3. Quick review and merge process
4. Recognition for contributors
5. Feedback mechanisms (was this helpful? what's missing?)

**Why it works**: Developers who hit problems can fix them for others. Scales documentation effort. Community investment increases loyalty. Fresh eyes catch what internal team misses.

**Indicators for use**: Open source projects. Developer platforms. Any docs where community investment is valuable.

## Anti-Patterns

# Developer Communications Anti-Patterns

Approaches that seem like good documentation practices but undermine developer trust and adoption.

---

## 1. Comprehensive Before Useful

**What it looks like**: Documenting every feature before documenting any workflow. Complete API reference, but no getting started guide. All the details, none of the context.

**Why it seems good**: Thoroughness. Complete coverage. "Everything is documented."

**Why it fails**: Developers can't find what they need. They drown in reference material without learning how to accomplish their goals. Documentation exists but doesn't help.

**What to do instead**: Start with the happy path. Document what developers actually need to do. Build out from common use cases to edge cases.

---

## 2. Internal Wiki as External Docs

**What it looks like**: Publishing internal documentation externally with minimal editing. Internal terminology, internal context, internal organization—exposed to customers.

**Why it seems good**: Fast. Content already exists. "Developers will figure it out."

**Why it fails**: External developers lack context. Internal docs assume knowledge they don't have. Organization doesn't match external mental models.

**What to do instead**: Rewrite for external audience. Explain context. Structure around developer goals, not internal organization. Have external developer review.

---

## 3. Auto-Generated Everything

**What it looks like**: Relying entirely on generated documentation. JSDoc comments become the only documentation. No tutorials, no guides, just API reference.

**Why it seems good**: Efficient. Always in sync. Developers can figure it out.

**Why it fails**: Generated docs lack narrative. They explain what, not why or how. Developers need to understand concepts, not just method signatures.

**What to do instead**: Generated reference + human-written guides. Use generation for what it's good at (accuracy, completeness), humans for what they're good at (explanation, examples, narrative).

---

## 4. The Living Document Excuse

**What it looks like**: "Documentation is a living document" as excuse for publishing incomplete or inaccurate docs. Ship now, fix later. Version 0.1 documentation for version 2.0 product.

**Why it seems good**: Agile. Iterative. "We'll improve it."

**Why it fails**: Developers experience the docs as they are, not as they will be. Trust lost now isn't recovered by improvements later. "Living document" often means "nobody's responsible."

**What to do instead**: Minimum viable documentation must actually be viable. Incomplete is okay if clearly marked. Inaccurate is never okay. Own and prioritize documentation work.

---

## 5. Docs Team Silo

**What it looks like**: Technical writers producing documentation without engineering involvement. Content created by people who don't use the product.

**Why it seems good**: Specialists do what they're good at. Writers write, engineers engineer.

**Why it fails**: Writers lack deep technical knowledge. Examples may not reflect real usage. Accuracy requires engineering review anyway. Docs lag behind product.

**What to do instead**: Engineers own accuracy, writers own clarity. Collaborative process. Engineers write first drafts for technical content. Writers polish and structure.

---

## 6. One Doc Fits All

**What it looks like**: Same documentation for all audiences. New developers and experts read the same content. Beginners wade through advanced concepts. Experts can't find deep details.

**Why it seems good**: Simpler to maintain. Single source of truth.

**Why it fails**: Different audiences need different content. Beginners are overwhelmed. Experts are slowed down. Nobody is well-served.

**What to do instead**: Audience-specific paths. Beginner tutorials, expert guides. Progressive disclosure. "If you already know X, skip to Y."

---

## 7. Format Over Function

**What it looks like**: Beautiful documentation portal with poor content. Sophisticated search, zero helpful results. Great design, wrong information.

**Why it seems good**: Looks professional. Modern tooling. Good first impression.

**Why it fails**: Developers need answers, not aesthetics. A beautiful lie is worse than an ugly truth. Format can't compensate for content failures.

**What to do instead**: Content first, format second. Accurate beats beautiful. Invest in what matters to developers: accuracy, completeness, examples.

---

## 8. PDF Documentation

**What it looks like**: Primary documentation delivered as PDF downloads. Static documents rather than web pages.

**Why it seems good**: Offline access. Print-friendly. Feels "official."

**Why it fails**: Can't be linked to specific sections. Can't be updated incrementally. Can't be searched alongside other docs. Can't embed interactive examples. Developers hate PDFs.

**What to do instead**: Web-native documentation. Deep linking. Real-time updates. PDF export only as secondary option for those who really need it.

---

## 9. Hiding Breaking Changes

**What it looks like**: Breaking changes buried in release notes. Major API changes without prominent warning. "Oh, we deprecated that three versions ago."

**Why it seems good**: Don't scare developers. Minimize perceived disruption.

**Why it fails**: Developers discover breaking changes when their code breaks. They feel blindsided. Trust evaporates. "Why didn't you tell me?"

**What to do instead**: Breaking changes prominently highlighted. Migration guides front and center. Deprecation warnings loud and early. Treat breaking changes as first-class content.

---

## 10. Optimizing for SEO Over Users

**What it looks like**: Documentation structured for search engines, not developers. Keyword stuffing. Thin pages to capture search terms. Content split unnaturally.

**Why it seems good**: More traffic. Better rankings. Developers find you through Google.

**Why it fails**: Developers find you but can't use what they find. Traffic without utility. High bounce rates. User experience sacrificed for discovery.

**What to do instead**: Write for developers first. Good content ranks naturally. Structure for usability, not keywords. If SEO and usability conflict, pick usability.

---

## 11. Changelog As Afterthought

**What it looks like**: Changelogs written at the last minute. "Bump version" commits. Autogenerated from commit messages without curation.

**Why it seems good**: Fast. Automated. "It's there."

**Why it fails**: Changelogs are for humans, not robots. Commit messages don't explain impact. Developers can't assess whether to upgrade.

**What to do instead**: Changelogs written deliberately. User-facing changes explained. Impact assessed. Migration guidance included. Treat changelogs as user communication, not technical logging.

---

## 12. Tribal Knowledge Documentation

**What it looks like**: Documentation that captures knowledge once held by one person. Internal terminology enshrined. Context that made sense to the author but nobody else.

**Why it seems good**: Knowledge preserved. Author documented what they know.

**Why it fails**: Without context, documentation doesn't transfer knowledge. Future readers (including the author) won't understand. Tribal knowledge becomes tribal confusion.

**What to do instead**: Document for someone who doesn't know. Have someone who doesn't know review. Explain context, not just facts. Write to be understood by future strangers.

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Developer Communications Sharp Edges

Critical mistakes that destroy developer trust and tank adoption.

---

## 1. The Broken Example

**The mistake**: Publishing code examples that don't actually work. Copy-paste examples with syntax errors, missing imports, or outdated API calls.

**Why it happens**: Examples written but never tested. API changed after docs written. "It worked when I wrote it."

**Why it's devastating**: Developers copy-paste your example. It fails. They blame themselves first, then discover it's your fault. Trust evaporates. They assume all your docs are unreliable. One broken example poisons the well.

**The fix**: Every code example must be tested, ideally automatically. Extract examples from actual tests. Version examples with API. Prefer runnable snippets (CodeSandbox, Replit) that can't go stale.

---

## 2. The Missing Prereq

**The mistake**: Tutorials that assume setup steps without mentioning them. "Just call `api.configure()`"—without explaining that you need to install the SDK, get an API key, and initialize first.

**Why it happens**: Expert writes docs, forgets what beginners don't know. Seems obvious to the author.

**Why it's devastating**: New developers get stuck on step one. They can't distinguish "I did it wrong" from "the docs skipped something." They leave before they start.

**The fix**: Test tutorials with fresh environments. Have someone unfamiliar follow them literally. Start from zero. State every prerequisite explicitly. Link to getting started guide from every tutorial.

---

## 3. The Outdated Screenshot

**The mistake**: UI screenshots that don't match the current product. Dashboard screenshots from three versions ago. Instructions referencing buttons that moved.

**Why it happens**: Screenshots are expensive to update. Nobody owns screenshot freshness. Product moves faster than docs.

**Why it's devastating**: Developers can't follow instructions. They waste time hunting for features. They question whether the product works at all.

**The fix**: Minimize reliance on screenshots. Use text instructions where possible. When screenshots are necessary, tag them with version. Automated screenshot testing for critical flows. Treat screenshot updates as part of release process.

---

## 4. The Marketing Docs

**The mistake**: Documentation that reads like marketing copy. "Our revolutionary API enables seamless integration with our powerful platform." Adjectives instead of information.

**Why it happens**: Marketing writes it. Pressure to sell instead of explain. Don't understand developer mindset.

**Why it's devastating**: Developers see through marketing instantly. They're looking for how to do something, not why they should be impressed. Marketing copy signals that you don't respect their time.

**The fix**: Facts, not adjectives. Show what it does, not how great it is. Let the capability speak for itself. If you have to convince them it's good, it probably isn't.

---

## 5. The Jargon Trap

**The mistake**: Using internal terminology that developers don't know. "Configure your workspace's environment settings in the fleet dashboard." What's a fleet? What's a workspace here?

**Why it happens**: Internal terms are natural to the team. Nobody questioned whether outsiders understand. No glossary maintained.

**Why it's devastating**: Developers feel stupid. They can't complete tasks because they don't understand the vocabulary. They search for terms and find nothing.

**The fix**: Define terms on first use. Maintain a glossary. Have outsiders review docs. Use standard industry terms where possible. When you must use unique terms, explain them clearly.

---

## 6. The Copy-Paste Trap

**The mistake**: Duplicating content across multiple pages without a single source of truth. Same setup instructions in 5 places, each slightly different.

**Why it happens**: Easier to copy than to link. Different authors, different times. No content architecture.

**Why it's devastating**: Content diverges. One version gets updated, others don't. Developers find conflicting information. Which one is right?

**The fix**: Single source of truth for each concept. Include or link, don't copy. Content reuse systems. When you must duplicate, track all instances.

---

## 7. The Missing Error

**The mistake**: Not documenting error messages and how to fix them. API returns "Error 4019" with no explanation anywhere in docs.

**Why it happens**: Errors are edge cases. "They shouldn't happen." Nobody thinks to document what went wrong.

**Why it's devastating**: Developer hits error, searches for it, finds nothing. They're stuck. They open a support ticket. They tweet their frustration. They evaluate competitors.

**The fix**: Document every error code. Include: what it means, why it happens, how to fix it. Error message text should be searchable. Errors are first-class documentation.

---

## 8. The Dead Link

**The mistake**: Links in documentation that go to 404 pages. References to moved or deleted content. Broken internal navigation.

**Why it happens**: Docs reorganized, links not updated. External resources moved. Nobody checks links regularly.

**Why it's devastating**: Developers hit dead ends. They lose trust. They assume the product is abandoned or unmaintained.

**The fix**: Automated link checking. Redirects for moved content. Regular audits. Treat broken links as bugs.

---

## 9. The Version Mismatch

**The mistake**: Documentation that doesn't specify which version of the product it applies to. Examples that work in v2 but not v3, without mentioning the version.

**Why it happens**: Only latest version documented. Historical docs not maintained. Version tags not implemented.

**Why it's devastating**: Developers using older versions can't find relevant docs. Developers upgrading don't know what changed. Everyone is confused about what applies to them.

**The fix**: Version your docs. Make version selector prominent. Document migration paths. Keep docs for supported versions.

---

## 10. The Wall of Text

**The mistake**: Dense paragraphs without structure. No headers, no code, no examples—just explanation after explanation.

**Why it happens**: Author knows the material deeply. Writes like an essay. Doesn't consider how developers read.

**Why it's devastating**: Developers scan, they don't read. A wall of text is unscannable. They miss what they need. They give up.

**The fix**: Structure everything. Headers, bullets, code blocks. One idea per paragraph. Scannable headings that answer "what will I learn here?"

---

## 11. The Assumed Context

**The mistake**: Documentation that only makes sense if you already know the answer. "To fix this, just configure the resolver correctly." What resolver? Correctly how?

**Why it happens**: Expert curse. Author knows the context, assumes reader does too.

**Why it's devastating**: The people who need docs most are the ones without context. They read it, don't understand, and assume they're the problem.

**The fix**: Explain from first principles. Link to context when needed. Test with beginners. Ask "would someone encountering this for the first time understand?"

---

## 12. The Changelog Non-Change

**The mistake**: Changelogs that don't tell you what changed. "Various bug fixes and improvements." "Updated dependencies." Version numbers without substance.

**Why it happens**: Lazy changelog entries. Nobody wants to write them. "Nobody reads changelogs anyway."

**Why it's devastating**: Developers deciding whether to upgrade have no information. They can't assess risk. They can't find what broke their code. They don't trust your releases.

**The fix**: Specific, actionable changelogs. What changed, why, and what you need to do. Breaking changes highlighted. Migration instructions included.

## Decision Framework

# Developer Communications Decisions

Decision frameworks for documentation structure, tooling, and content strategy.

---

## 1. Documentation Platform Selection

**Context**: Choosing where and how to host documentation.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Docusaurus/VuePress** | Open source, custom needs, engineering-owned | Setup and maintenance, less out-of-box |
| **ReadMe/Mintlify** | SaaS, quick setup, API focus, interactive features | Cost, less customization, vendor lock-in |
| **GitBook** | Non-technical contributors, collaboration focus | Less developer-oriented, slower for large docs |
| **Custom solution** | Unique requirements, deep integration needs | High cost, maintenance burden |

**Decision criteria**: Team technical capability, budget, customization needs, content type.

**Red flags**: Custom solution for simple docs, GitBook for heavy API reference, ignoring developer experience to save budget.

---

## 2. Documentation Ownership

**Context**: Who is responsible for creating and maintaining documentation.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Engineering owns all** | Small team, technical product, engineers write well | Engineers resent doc work, quality varies |
| **Technical writers own all** | Complex product, dedicated docs team, high volume | Writers lack depth, need heavy engineering review |
| **Hybrid (engineers draft, writers polish)** | Balance of accuracy and clarity, medium+ team size | Coordination overhead, dual ownership complexity |
| **Product/feature owners** | Documentation as product requirement, clear ownership | Inconsistent quality, variable commitment |

**Decision criteria**: Team size, engineering culture, documentation complexity, resources.

**Red flags**: Nobody clearly owns docs, engineers with no writing support, writers without engineering access.

---

## 3. Documentation Structure

**Context**: How to organize documentation for findability.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **By feature/component** | Mature product, exploring users, reference-heavy | Doesn't match user goals, assumes product knowledge |
| **By user task/goal** | Task-oriented product, new users, tutorial-heavy | Harder to maintain as features grow |
| **By audience/persona** | Multiple distinct audiences, different needs | Duplication, more content to maintain |
| **Hybrid (task entry + feature reference)** | Complex product, both tutorials and reference needed | Complex architecture, navigation challenges |

**Decision criteria**: User mental model, product complexity, content types.

**Red flags**: Internal org chart as documentation structure, no clear entry point, every page orphaned.

---

## 4. API Reference Approach

**Context**: How to create and maintain API documentation.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **OpenAPI/Swagger generated** | REST API, accuracy critical, automation desired | Limited narrative, generic presentation |
| **Hand-written reference** | Small API, want craft, complex explanations | Drift risk, maintenance burden |
| **Postman collections** | Already using Postman, want try-it functionality | Platform dependency, separate from main docs |
| **Generated + hand-enriched** | Want accuracy + narrative, have resources | Dual maintenance, merge complexity |

**Decision criteria**: API size, change frequency, narrative needs, existing tooling.

**Red flags**: Hand-written for huge API, pure generation for complex concepts, no try-it functionality.

---

## 5. Versioning Strategy

**Context**: How to handle documentation across product versions.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Latest only** | Fast-moving product, short upgrade cycles, low backward compat | Users on old versions have no docs |
| **Major versions** | Breaking changes between majors, users stick to versions | Maintenance of multiple doc sets |
| **All versions** | Long support windows, enterprise customers, slow upgrade | Heavy maintenance, confusion between versions |
| **Latest + LTS** | Mix of fast-moving and stable customers | Clear policy needed, two doc sets |

**Decision criteria**: Support policy, upgrade velocity, customer base, resources.

**Red flags**: No version strategy, outdated version docs never updated, version confusion in navigation.

---

## 6. Tutorial Scope

**Context**: How much to cover in tutorial content.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Minimal (5-minute quickstart)** | Simple product, fast time-to-value, developers figure it out | Abandons users who need more guidance |
| **Comprehensive (end-to-end)** | Complex product, high-touch, enterprise users | Long content, maintenance burden |
| **Modular (composable tutorials)** | Many use cases, different paths, flexible learning | Navigation complexity, overlap management |
| **Interactive (hands-on sandbox)** | Learn by doing, complex setup to abstract | Infrastructure cost, maintenance complexity |

**Decision criteria**: Product complexity, user patience, setup difficulty, resources.

**Red flags**: Comprehensive tutorials for simple product, minimal tutorials for complex product, tutorials nobody completes.

---

## 7. Example Language Coverage

**Context**: Which programming languages to show in examples.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **One language (canonical)** | Single SDK, simple product, clear primary language | Alienates other language users |
| **Top 2-3 languages** | Multi-language SDK, clear top users, manageable scope | Maintenance multiplied, some left out |
| **All supported languages** | Language-agnostic API, broad user base | Massive maintenance, quality variance |
| **Community-contributed** | Open source, language diversity, limited resources | Quality control, inconsistency |

**Decision criteria**: SDK support, user language distribution, maintenance capacity.

**Red flags**: JavaScript-only examples for Python-heavy audience, examples in languages nobody uses, stale non-primary language examples.

---

## 8. Changelog Format

**Context**: How to communicate product changes.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Keep a Changelog format** | Standard format, developer audience, clear structure | May not fit all change types |
| **Narrative release notes** | Marketing-influenced, feature launches, user storytelling | Less scannable, harder to find specifics |
| **GitHub releases** | Open source, developer-only audience, git-integrated | Limited formatting, scattered with code |
| **In-app changelog** | SaaS, want engagement with changes, non-developer users | Implementation cost, separate from docs |

**Decision criteria**: Audience, change frequency, marketing involvement, distribution channels.

**Red flags**: Marketing release notes as only changelog, no changelog at all, changelog nobody can find.

---

## 9. Community Documentation

**Context**: How much to rely on community-contributed content.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Official only** | Quality control critical, small community, resources available | Miss community knowledge, limited scale |
| **Community supplements official** | Active community, clear separation, quality process | Moderation burden, quality variance |
| **Community-first** | Large open source, limited resources, engaged community | Less control, reliability variance |
| **Curated community** | Want contributions with quality bar, resources to review | Review bottleneck, contributor friction |

**Decision criteria**: Community size and engagement, resources, quality requirements.

**Red flags**: Community-first with no moderation, ignoring community contributions, community contributions competing with official docs.

---

## 10. Documentation Success Metrics

**Context**: How to measure documentation effectiveness.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Time to first success** | Developer experience focus, onboarding optimization | Hard to measure accurately, one metric |
| **Support ticket reduction** | Docs as support deflection, cost focus | Lagging indicator, hard to attribute |
| **Page engagement (time, scroll)** | Content quality focus, optimization mindset | Vanity metric risk, doesn't measure success |
| **Task completion rate** | Tutorial-heavy, clear user journeys | Requires instrumentation, privacy considerations |
| **NPS/satisfaction surveys** | Qualitative insight, understanding pain points | Response bias, infrequent signal |

**Decision criteria**: Business goals, measurement capability, optimization focus.

**Red flags**: No measurement, vanity metrics only, metrics without action.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `api|endpoint|rest|graphql` | backend | Docs need API details |
| `tutorial|guide|walkthrough` | copywriting | Docs need writing polish |
| `example|code|sample` | frontend | Docs need code examples |
| `marketing|launch|announcement` | marketing | Docs need marketing alignment |

### Receives Work From

- **backend**: Backend needs API documentation
- **product-management**: Product needs feature documentation
- **frontend**: Frontend needs SDK documentation
- **marketing**: Marketing needs developer content

### Works Well With

- backend
- frontend
- product-management
- copywriting
- content-strategy
- marketing

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/communications/dev-communications/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

**Deep content:**
- `patterns.md` - Comprehensive pattern library
- `anti-patterns.md` - What to avoid and why
- `sharp-edges.md` - Detailed gotcha documentation
- `decisions.md` - Decision frameworks

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
