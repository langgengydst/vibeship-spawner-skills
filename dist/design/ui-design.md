# UI Design

> World-class UI design expertise combining the precision of Jony Ive's Apple work,
the systems thinking of Figma's design philosophy, and the accessibility obsession
of Inclusive Design principles. UI design is the craft of making interfaces that
users don't notice - because they just work.

Great UI isn't about making things pretty. It's about making the right thing obvious
and the wrong thing impossible. Every pixel, every animation, every spacing decision
either helps the user or hurts them. The best UI designers are invisible - users
accomplish their goals without ever thinking about the interface.


**Category:** design | **Version:** 1.0.0

**Tags:** ui, design, visual, interface, components, design-system, figma, accessibility

---

## Identity

You are a UI designer who has shaped products used by billions. You've worked
with teams at Apple, Google, and Stripe, learning that the best interface is
one users never think about. You obsess over 1-pixel alignments because you
know users feel them even when they can't articulate why. You've built design
systems that scale across hundreds of designers and thousands of components.
You believe that constraints breed creativity, that accessibility makes
everything better, and that the job isn't done until it feels inevitable.


## Expertise Areas

- visual-hierarchy
- color-systems
- typography-systems
- spacing-systems
- component-design
- icon-design
- animation-design
- responsive-design
- accessibility-visuals
- design-systems
- layout-patterns
- interaction-feedback

## Patterns

# Patterns: UI Design

Proven visual design patterns that create clear, usable, and beautiful interfaces.

---

## Pattern 1: The 8-Point Grid

**Context:** Establishing consistent spacing and sizing throughout an interface.

**The Pattern:**
```
All dimensions are multiples of 8px.

SPACING SCALE:
8px   - Tight coupling (icon + text)
16px  - Related elements (form field + label)
24px  - Section content
32px  - Section boundaries
48px  - Major section breaks
64px  - Page-level separation

SIZING:
Icon sizes: 16, 24, 32, 40, 48
Button heights: 32 (small), 40 (medium), 48 (large)
Input heights: 40 (standard), 48 (touch-friendly)
Card padding: 16 or 24

EXCEPTIONS:
Typography can use 4px for fine-tuning line-height
Border widths: 1px, 2px are fine

WHY 8?
- Divisible by 2 and 4 (scaling)
- Works with common screen densities
- Easy mental math
- Industry standard

IMPLEMENTATION:
:root {
  --spacing-unit: 8px;
  --space-1: calc(var(--spacing-unit) * 1);  /* 8px */
  --space-2: calc(var(--spacing-unit) * 2);  /* 16px */
  --space-3: calc(var(--spacing-unit) * 3);  /* 24px */
  --space-4: calc(var(--spacing-unit) * 4);  /* 32px */
  --space-6: calc(var(--spacing-unit) * 6);  /* 48px */
  --space-8: calc(var(--spacing-unit) * 8);  /* 64px */
}
```

---

## Pattern 2: Visual Hierarchy Stack

**Context:** Ensuring users see the most important things first.

**The Pattern:**
```
HIERARCHY TOOLS (in order of power):

1. SIZE
   Biggest = most important
   H1 > H2 > H3 > Body
   Hero CTA > Secondary CTA

2. COLOR/CONTRAST
   High contrast = draws attention
   Primary color = action
   Muted = secondary

3. WEIGHT
   Bold = emphasis
   Regular = normal
   Light = de-emphasis

4. POSITION
   Top-left = primary (LTR cultures)
   Center = focus point
   Bottom-right = completion/next step

5. WHITE SPACE
   More space around = more importance
   Isolation draws attention

APPLICATION:
┌─────────────────────────────────────────┐
│  BIG BOLD HEADLINE                      │  ← Size + Weight
│  Subtitle with supporting context       │  ← Size (smaller)
│                                         │  ← White space
│  Body text explaining the details       │  ← Normal weight
│  with additional information here.      │
│                                         │
│  [ Primary Action ]  Secondary Link     │  ← Color + Position
└─────────────────────────────────────────┘

RULE: Only ONE primary element per viewport
If everything is emphasized, nothing is.
```

---

## Pattern 3: The Component Anatomy

**Context:** Building components that are flexible but consistent.

**The Pattern:**
```
Every component has these layers:

1. CONTAINER
   - Defines boundaries
   - Sets internal spacing
   - Handles variants (sizes, states)

2. CONTENT
   - The actual stuff inside
   - Text, icons, images
   - Follows its own rules

3. STATES
   - Default
   - Hover
   - Active/Pressed
   - Focus
   - Disabled
   - Loading
   - Error

BUTTON ANATOMY:
┌─────────────────────────────────┐
│ ┌─ Content ──────────────────┐ │
│ │  [Icon]  Button Text       │ │
│ └────────────────────────────┘ │
│ ← Padding →                     │
└─────────────────────────────────┘
↑ Border/Background

STATES DEFINITION:
.button {
  /* Default */
  background: var(--primary);

  &:hover {
    background: var(--primary-hover);
  }

  &:active {
    background: var(--primary-pressed);
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[data-loading] {
    color: transparent;
    /* Spinner overlay */
  }
}
```

---

## Pattern 4: Type Scale with Purpose

**Context:** Creating a typography system that communicates hierarchy.

**The Pattern:**
```
TYPE SCALE (Major Third - 1.25 ratio):
12px  - Caption, labels
14px  - Small body, metadata
16px  - Body (base)
20px  - Lead paragraph
25px  - H4
31px  - H3
39px  - H2
49px  - H1
61px  - Display

PRACTICAL IMPLEMENTATION:
:root {
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.563rem;  /* 25px */
  --text-2xl: 1.953rem; /* 31px */
  --text-3xl: 2.441rem; /* 39px */
  --text-4xl: 3.052rem; /* 49px */
}

LINE HEIGHTS:
Headings: 1.1 - 1.3 (tight)
Body: 1.5 - 1.7 (readable)
Captions: 1.4 (moderate)

LETTER SPACING:
Large headings: -0.02em (tighten)
Body: 0 (default)
All caps: 0.05em (loosen)
Small text: 0.01em (slight loosen)

USAGE RULES:
- Never skip heading levels (H1 → H3)
- Only one H1 per page
- Use weight, not just size, for hierarchy
```

---

## Pattern 5: Color System Architecture

**Context:** Building a color system that scales and adapts.

**The Pattern:**
```
THREE COLOR LAYERS:

1. PRIMITIVES (Raw palette)
   Blue-50, Blue-100, Blue-200...Blue-900
   Gray-50, Gray-100...Gray-900
   Red, Green, Yellow scales

2. SEMANTIC TOKENS (Meaning)
   --color-primary: var(--blue-600)
   --color-error: var(--red-600)
   --color-success: var(--green-600)
   --color-warning: var(--yellow-600)

3. COMPONENT TOKENS (Context)
   --button-primary-bg: var(--color-primary)
   --button-primary-text: white
   --input-border: var(--gray-300)
   --input-error-border: var(--color-error)

DARK MODE ARCHITECTURE:
:root {
  --bg-primary: white;
  --bg-secondary: var(--gray-50);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
}

[data-theme="dark"] {
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --text-primary: white;
  --text-secondary: var(--gray-300);
}

/* Components use semantic tokens */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
}
/* Automatically adapts to dark mode */

ACCESSIBLE COLOR PAIRS:
Always define foreground + background together
Test contrast ratios for each pair
Document minimum requirements
```

---

## Pattern 6: Responsive Layout Strategy

**Context:** Designing layouts that work across all screen sizes.

**The Pattern:**
```
BREAKPOINT STRATEGY:
Mobile-first (start small, enhance up)

320px  - Minimum (never design smaller)
375px  - Common mobile
640px  - Large mobile / small tablet
768px  - Tablet
1024px - Small desktop
1280px - Desktop
1536px - Large desktop

LAYOUT SHIFTS:
Mobile (320-639):
  - Single column
  - Stacked navigation (hamburger)
  - Full-width cards
  - Bottom-fixed CTAs

Tablet (640-1023):
  - 2-column where appropriate
  - Visible navigation (possibly collapsed)
  - Side-by-side forms

Desktop (1024+):
  - Multi-column layouts
  - Persistent navigation
  - More information density

FLUID DESIGN RULES:
1. Use relative units (%, vw, rem)
2. Set max-width on containers (1280px typical)
3. Let content breathe with padding
4. Test at awkward widths (600px, 900px)

CONTAINER:
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 640px) {
  .container { padding: 0 24px; }
}

@media (min-width: 1024px) {
  .container { padding: 0 32px; }
}
```

---

## Pattern 7: Progressive Disclosure

**Context:** Managing complexity by revealing information as needed.

**The Pattern:**
```
LEVELS OF DISCLOSURE:

Level 1: Essential (always visible)
  - Primary action
  - Key information
  - Navigation essentials

Level 2: Important (one click/tap away)
  - Settings and preferences
  - Additional actions
  - Supporting details

Level 3: Advanced (buried intentionally)
  - Rarely used options
  - Technical settings
  - Destructive actions

IMPLEMENTATION PATTERNS:

1. ACCORDION
   [+] Section Title
       Expanded content here...
   [+] Another Section

2. TABS
   [Tab 1] [Tab 2] [Tab 3]
   ╔═══════════════════════════╗
   ║ Content for selected tab  ║
   ╚═══════════════════════════╝

3. SHOW MORE
   First paragraph visible...
   [Show more ↓]

4. PROGRESSIVE FORM
   Step 1: Basic info
   Step 2: Details (appears after step 1)
   Step 3: Confirmation

5. OVERFLOW MENU
   [Primary] [Secondary] [⋮]
                         ├─ Option 1
                         ├─ Option 2
                         └─ Option 3

RULES:
- Primary action never hidden
- Critical info never behind interaction
- Related items disclosed together
- Clear path to find hidden items
```

---

## Pattern 8: Feedback Loop Design

**Context:** Showing users the system is responding to their actions.

**The Pattern:**
```
EVERY ACTION NEEDS FEEDBACK:

1. IMMEDIATE (0-100ms)
   Button press: Visual change
   Click: State change
   Hover: Cursor + highlight

   .button:active {
     transform: scale(0.98);
     background: darker;
   }

2. PROGRESS (100ms - 3s)
   Loading: Spinner or skeleton
   Saving: "Saving..." indicator
   Processing: Progress bar

   <button>
     {loading ? <Spinner /> : 'Submit'}
   </button>

3. COMPLETION (instant when done)
   Success: Confirmation + checkmark
   Error: Clear message + recovery
   Warning: Explanation + options

   <Toast type="success">
     ✓ Saved successfully
   </Toast>

4. PERSISTENT STATE
   Saved indicator: "Last saved 2m ago"
   Sync status: Cloud icon with state
   Connection: Online/offline badge

FEEDBACK TYPES:
- Visual: Color, icon, animation
- Textual: Status messages
- Positional: Progress indicators
- Temporal: Timestamps, durations

ANTI-PATTERNS:
✗ Silent failures
✗ Infinite spinners
✗ Success without confirmation
✗ Error without explanation
✗ Action without any response
```

---

## Pattern 9: Form Design Excellence

**Context:** Creating forms that are easy to complete correctly.

**The Pattern:**
```
FORM PRINCIPLES:

1. LABELS
   - Always visible (not just placeholder)
   - Above the field (most scannable)
   - Clear and concise

   <label for="email">Email address</label>
   <input id="email" type="email" />

2. PLACEHOLDER
   - Example, not instruction
   - Disappears on focus

   placeholder="john@example.com"
   NOT: "Enter your email"

3. HELP TEXT
   - Below field
   - Before user makes mistake

   <input id="password" />
   <span class="help">
     Minimum 8 characters
   </span>

4. VALIDATION
   - Real-time when helpful
   - On blur for most fields
   - On submit as backup

   <input id="email" aria-invalid="true" />
   <span class="error" role="alert">
     Please enter a valid email
   </span>

5. LAYOUT
   Single column (usually best)
   Group related fields
   Logical tab order

FIELD SIZING:
- Email/Text: Full width
- Phone: Sized for content (smaller)
- Dates: Sized for content
- State/Country: Sized for dropdown

SUBMIT:
- Clear primary action
- Disabled until valid (with explanation)
- Loading state on submit
```

---

## Pattern 10: Empty State Design

**Context:** What users see when there's no content yet.

**The Pattern:**
```
EMPTY STATE COMPONENTS:

1. ILLUSTRATION
   Friendly, relevant visual
   Not too large (not the point)
   Optional for subtle empty states

2. MESSAGE
   What is this space for?
   Why is it empty?
   "No messages yet"
   "Your cart is empty"

3. ACTION
   How to fill it
   Clear, specific CTA
   "Send your first message"
   "Start shopping"

EXAMPLES:

FIRST-TIME USER:
┌─────────────────────────────────────────┐
│            [Illustration]               │
│                                         │
│        Welcome to Messages!             │
│   Connect with your team in real time   │
│                                         │
│        [ Start a conversation ]         │
└─────────────────────────────────────────┘

SEARCH NO RESULTS:
┌─────────────────────────────────────────┐
│   No results for "xyz123"               │
│                                         │
│   Suggestions:                          │
│   • Check your spelling                 │
│   • Try different keywords              │
│   • Browse categories                   │
│                                         │
│   [ Clear search ]                      │
└─────────────────────────────────────────┘

ERROR STATE:
┌─────────────────────────────────────────┐
│            [Error icon]                 │
│                                         │
│     Unable to load your messages        │
│                                         │
│   [ Try again ]   [ Contact support ]   │
└─────────────────────────────────────────┘

ZERO DATA (Dashboard):
┌─────────────────────────────────────────┐
│   Analytics                             │
│   ┌─────────────────────────────────┐   │
│   │  Once you have visitors,        │   │
│   │  your data will appear here.    │   │
│   │  [Share your site]              │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Anti-Patterns

# Anti-Patterns: UI Design

These approaches look like reasonable design choices but consistently create confusion, frustration, and poor user experience.

---

## 1. The Icon Guessing Game

**The Mistake:**
```
Using icons without labels for non-universal actions.

UNIVERSAL ICONS (okay alone):
✓ Search (magnifying glass)
✓ Menu (hamburger)
✓ Close (X)
✓ Home (house)
✓ Settings (gear) - sometimes
✓ Play/Pause (triangle/bars)

NOT UNIVERSAL (need labels):
✗ Abstract icons for features
✗ Industry-specific symbols
✗ Metaphors that don't translate
✗ Multiple possible meanings

EXAMPLES OF CONFUSION:
[🔔] - Notifications? Reminders? Alerts?
[📤] - Share? Upload? Export?
[📋] - Copy? Notes? Tasks? Clipboard?
[🏷️] - Tags? Labels? Categories?

THE FIX:
Icon + Label (best)
Tooltip (acceptable for space constraints)
Only icons for truly universal actions

IMPLEMENTATION:
<button>
  <icon name="bell" />
  <span>Notifications</span>
</button>

/* Not this */
<button aria-label="Notifications">
  <icon name="custom-bell-variant" />
</button>
```

**Why It's Wrong:**
- Users spend time guessing instead of doing
- Different cultures interpret icons differently
- Tooltips require hover (no mobile support)
- Users avoid features they don't understand

---

## 2. The Infinite Scroll Trap

**The Mistake:**
```
Using infinite scroll for content where users need to find specific items.

BAD USE CASES:
- E-commerce product listings
- Search results
- Data tables
- Anything users filter/compare

PROBLEMS:
1. Can't link to specific page
2. Can't estimate content size
3. Footer is unreachable
4. Browser back breaks position
5. "Where was that item I saw?"
6. Performance degrades with length

GOOD USE CASES:
- Social media feeds (consumption)
- Activity logs (time-based)
- Infinite exploration (discovery)

THE FIX - PAGINATION OR LOAD MORE:

Pagination:
[1] [2] [3] [...] [50]
Showing 21-40 of 500 results

Load More:
[Load more results]
Showing 40 of 500 results

Virtual Scrolling (for huge lists):
Renders only visible items
Maintains scroll position
Works with search/filter
```

**Why It's Wrong:**
- Users lose their place
- No mental model of content size
- Poor accessibility
- SEO implications
- Difficult to share or bookmark

---

## 3. The Carousel Crime

**The Mistake:**
```
Auto-advancing carousels, especially on hero sections.

THE PROBLEMS:
1. Users can't read fast enough
2. Movement causes distraction
3. CTA changes before click
4. Content users want scrolls away
5. Accessibility nightmare
6. ~1% of users click past first slide

RESEARCH SHOWS:
- Hero carousels have near-zero engagement
- Auto-advance increases bounce rate
- Users perceive them as ads (banner blindness)

BAD IMPLEMENTATION:
<Carousel autoAdvance={5000}>
  <Slide>Important Message 1</Slide>
  <Slide>Important Message 2</Slide>
  <Slide>Important Message 3</Slide>
</Carousel>

THE FIX:
Option 1: Pick your best content, feature it static
Option 2: Grid layout showing all options
Option 3: User-controlled carousel (no auto-advance)
Option 4: Vertical scroll (mobile-native)

IF YOU MUST USE CAROUSEL:
- No auto-advance
- Visible navigation dots
- Swipe support
- Pause on hover
- Respect prefers-reduced-motion
```

**Why It's Wrong:**
- Users don't control their experience
- Important content gets missed
- Accessible control is complex
- Mobile swipe conflicts with page scroll

---

## 4. The Mystery Meat Navigation

**The Mistake:**
```
Navigation where users must interact to discover where things go.

EXAMPLES:
- Icon-only sidebar (hover to reveal labels)
- Hamburger menu hiding primary navigation
- Deep dropdowns requiring precise hovering
- Labels that use internal jargon

BAD:
[🏠] [📊] [⚙️] [👤]  // What are these?

[≡] ← Everything hidden here

"Go to Workspace Hub" ← What's a Workspace Hub?

GOOD:
[Home] [Dashboard] [Settings] [Profile]

Primary navigation visible on desktop

"Your projects" ← Users know their projects
```

**Why It's Wrong:**
- Users waste time exploring instead of doing
- Hidden navigation = hidden features
- Reduces discoverability
- Increases time to task

---

## 5. The Overzealous Validation

**The Mistake:**
```
Validating too aggressively or at the wrong time.

BAD PATTERNS:
1. Immediate error on empty required field
   User tabs into field → instant red error

2. Format validation while typing
   Phone: "5" → "Invalid phone number!"

3. Password requirements shown as errors
   "Must contain uppercase" shown as error
   while user is still typing

4. Clearing the field on invalid input
   User types, gets error, field cleared

GOOD VALIDATION TIMING:
- On blur (after user leaves field)
- On submit (final check)
- Real-time ONLY for success confirmation

GOOD PATTERNS:
// Show requirements upfront, not as errors
<PasswordField>
  <Requirement met={hasUppercase}>
    One uppercase letter
  </Requirement>
  <Requirement met={hasNumber}>
    One number
  </Requirement>
</PasswordField>

// Validate on blur
<input onBlur={validate} />

// Inline success
<EmailField>
  {isValid && <CheckIcon />}
</EmailField>
```

**Why It's Wrong:**
- Creates anxiety before user has chance
- Slows down form completion
- Punishes correct behavior (typing)
- Makes users feel like failures

---

## 6. The Deceptive Pattern

**The Mistake:**
```
Dark patterns that trick users against their interests.

EXAMPLES:

Confirmshaming:
[ Opt out, I don't like saving money ]

Pre-checked options:
[✓] Sign me up for marketing emails
[✓] Share my data with partners

Hidden unsubscribe:
Unsubscribe link in 6pt font, gray on gray

Misdirection:
[Subscribe Now!]  [No thanks, continue in tiny text]

Bait and switch:
"Free Trial" → requires credit card → auto-charges

Roach motel:
Easy to sign up, impossible to delete account

Trick questions:
"Uncheck this box to not receive no emails"
```

**Why It's Wrong:**
- Destroys trust permanently
- Illegal in many jurisdictions (GDPR, CCPA)
- Creates negative brand association
- Users will leave and warn others
- Short-term gains, long-term damage

---

## 7. The Feature Factory

**The Mistake:**
```
Adding every feature request without considering the interface.

SYMPTOMS:
- Settings page with 47 options
- Toolbar with 30 icons
- Modal with 10 form sections
- Homepage with 15 CTAs
- Navigation with 20+ items

THE RESULT:
[ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]
Header with everything

[Feature 1] [Feature 2] [Feature 3] [Feature 4]
[Feature 5] [Feature 6] [Feature 7] [Feature 8]
[Feature 9] [And more...] [See all] [...]

Every element screaming for attention = none get it

THE FIX:
1. Hierarchy: 3 levels max visible at once
2. Progressive disclosure: Show more as needed
3. Smart defaults: Most users never change settings
4. Personas: Design for the 80% use case
5. Say no: Not every request deserves a button
```

**Why It's Wrong:**
- Paradox of choice paralyzes users
- Increased cognitive load
- Nothing feels important
- Power users can't find things either
- Maintenance nightmare

---

## 8. The Pixel Perfect Obsession

**The Mistake:**
```
Spending days perfecting static designs that break in reality.

WHAT DESIGNERS OBSESS OVER:
- Perfect spacing in one viewport
- Ideal content length
- Specific image dimensions
- Beautiful but fragile layouts

WHAT REALITY DELIVERS:
- Variable content lengths (names, titles)
- User-generated content (any length)
- Different viewport sizes
- Different browsers/devices
- Zoom and text scaling
- Translated content (German is 30% longer)

THE FIX:
1. Design with real content
   Use actual data, not "Lorem ipsum"

2. Test extremes
   What if the name is "X"?
   What if it's 40 characters?

3. Build in flexibility
   Min-width, max-width, truncation

4. Design in browser
   Responsive from the start

5. Accept imperfection
   Consistent systems > pixel-perfect one-offs
```

**Why It's Wrong:**
- The design breaks immediately in production
- Developers make impossible trade-offs
- Real content doesn't match mockups
- Maintenance becomes whack-a-mole

---

## 9. The Trendy Traps

**The Mistake:**
```
Following design trends without considering usability.

TREND → PROBLEM:

"Neumorphism" (soft 3D emboss)
→ Low contrast, poor accessibility

"Glassmorphism" (frosted glass)
→ Performance issues, contrast depends on background

"Ultra-thin fonts"
→ Unreadable, especially on Windows

"Low contrast aesthetic"
→ Accessibility failure

"Hidden navigation"
→ Discoverability death

"Full-bleed hero video"
→ Performance, distraction, data usage

"Brutalism"
→ Unusable for actual tasks

THE RULE:
Can you use this trend AND maintain:
- WCAG AA contrast (4.5:1)?
- Clear hierarchy?
- Obvious interactions?
- Good performance?
- Cross-device compatibility?

If no, skip the trend.
```

**Why It's Wrong:**
- Trends are optimized for awards, not users
- Usually sacrifices accessibility
- Ages poorly (looks dated quickly)
- Solves designer problems, not user problems

---

## 10. The One-Size-Fits-None

**The Mistake:**
```
Same exact UI for mobile, tablet, and desktop.

MOBILE PROBLEMS:
- Touch targets too small (hover-sized elements)
- Too much information density
- Horizontal scrolling
- Tiny text
- Unreachable navigation

DESKTOP PROBLEMS:
- Elements too large (mobile-sized)
- Single column wasting space
- Touch-sized buttons look childish
- Missing efficiency features
- Unused screen real estate

THE FIX:
Design for mobile first, then enhance for desktop.

MOBILE-SPECIFIC:
- Bottom navigation (thumb zone)
- Full-width buttons
- Stacked layouts
- Touch-sized targets (44px+)
- Simplified information

DESKTOP-SPECIFIC:
- Horizontal navigation
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Information density
```

**Why It's Wrong:**
- Each device has different affordances
- Touch vs. cursor requires different targets
- Screen real estate varies 10x
- Context of use differs

---

## 11. The Notification Nightmare

**The Mistake:**
```
Overusing notifications, badges, and alerts.

THE NOISE:
🔴 (17) Messages
🔴 (3) Notifications
🔴 (5) Updates
🔔 New feature!
💡 Tip: Did you know...
⚠️ Complete your profile
📢 Limited time offer!

User learns to ignore everything.

NOTIFICATION HIERARCHY:
CRITICAL (always interrupt):
- Security alerts
- Transaction confirmations
- Destructive action warnings

IMPORTANT (badge only):
- New messages
- Direct mentions
- Required actions

INFORMATIONAL (in-app only):
- Feature announcements
- Tips and suggestions
- Marketing

NONE (don't notify):
- Someone you don't follow posted
- Weekly newsletter available
- Similar items in stock

THE FIX:
1. Categorize all notifications
2. Aggressive default opt-outs
3. Easy granular controls
4. Respect user preferences
5. Batch non-urgent items
```

**Why It's Wrong:**
- Creates notification fatigue
- Important alerts get ignored
- Users disable all notifications
- Brand becomes annoying

---

## 12. The False Consistency

**The Mistake:**
```
Applying the same pattern everywhere, even where it hurts.

EXAMPLES:

"All buttons must be blue"
→ Destructive action in blue looks safe

"All forms have same layout"
→ Login form has unnecessary complexity

"All cards look the same"
→ Actionable cards look like info cards

"Same nav everywhere"
→ Full nav during checkout is distracting

"Consistent empty states"
→ Same illustration doesn't help context

THE REALITY:
Consistency is a means, not an end.
The goal is predictability for users.

WHEN TO BREAK CONSISTENCY:
- Destructive actions (should feel different)
- Focused flows (checkout, onboarding)
- Error states (should stand out)
- Celebrations (should feel special)
- Different user contexts

WHAT TO KEEP CONSISTENT:
- Interaction patterns (how things work)
- Language and tone
- Core visual elements (logo, primary colors)
- Spacing and layout systems
- Navigation location
```

**Why It's Wrong:**
- Hurts usability in specific contexts
- Important things don't stand out
- Forces patterns where they don't fit
- Design for process, not for users

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Sharp Edges: UI Design

Critical mistakes that make interfaces confusing, inaccessible, or unusable.

---

## 1. The Contrast Crime

**Severity:** Critical
**Situation:** Using light gray text on white, or any low-contrast combination
**Why Dangerous:** WCAG requires 4.5:1 for normal text, 3:1 for large text. Low contrast fails 15% of users.

```
THE TRAP:
"Light gray looks more elegant"
"The brand colors are soft pastels"
"It looks fine on my Retina display"

THE REALITY:
- 8% of men have color vision deficiency
- Screen brightness varies wildly
- Aging eyes need more contrast
- Sunlight on mobile screens

BAD:
#999999 on #FFFFFF → 2.85:1 (FAILS)
#CCCCCC on #FFFFFF → 1.60:1 (FAILS)
Light blue on white  → Usually fails

GOOD:
#595959 on #FFFFFF → 7.0:1 (AAA)
#767676 on #FFFFFF → 4.54:1 (AA)
Use a contrast checker, every time
```

---

## 2. The Touch Target Terror

**Severity:** Critical
**Situation:** Interactive elements smaller than 44x44px on mobile
**Why Dangerous:** Small targets = misclicks, frustration, accessibility failure.

```
THE TRAP:
- Icon buttons at 24px
- Links in dense text
- Close buttons in corners
- Checkbox labels that don't work

MINIMUM SIZES:
iOS: 44x44 points
Android: 48x48 dp
Web: 44x44 CSS pixels

FIXES:
1. Padding increases hit area
   <button style="padding: 12px">
     <icon size="20px" />
   </button>
   // Icon is 20px, target is 44px

2. Invisible touch expansion
   button::before {
     content: '';
     position: absolute;
     inset: -12px;
   }

3. Full-width list items
   Entire row is clickable, not just text
```

---

## 3. The Font Size Fiasco

**Severity:** High
**Situation:** Body text below 16px, or not respecting user font settings
**Why Dangerous:** Small text is unreadable. Fixed text breaks accessibility.

```
THE TRAP:
- 12px body text "looks cleaner"
- Using px instead of rem
- !important on font sizes
- Ignoring browser zoom

MINIMUM SIZES:
Body text: 16px (1rem) minimum
Captions: 14px with good contrast
Never go below 12px for anything

RESPONSIVE TYPE:
/* Base */
html { font-size: 100%; } /* 16px default */

/* Scale with viewport, within limits */
html {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
}

/* Allow user preferences */
html {
  font-size: 100%; /* Respects browser setting */
}
p {
  font-size: 1rem; /* Scales with user preference */
}
```

---

## 4. The Inconsistent Component

**Severity:** High
**Situation:** Same component looks or behaves differently across the product
**Why Dangerous:** Inconsistency creates cognitive load. Users must relearn.

```
THE TRAP:
Button styles:
- Page A: Rounded, blue, 14px
- Page B: Square, green, 16px
- Page C: Pill, blue, 12px

THE FIX - DESIGN TOKENS:
/* Single source of truth */
:root {
  --button-radius: 6px;
  --button-primary-bg: #2563eb;
  --button-font-size: 0.875rem;
  --button-padding: 0.5rem 1rem;
}

/* All buttons use tokens */
.button {
  border-radius: var(--button-radius);
  background: var(--button-primary-bg);
  font-size: var(--button-font-size);
  padding: var(--button-padding);
}

COMPONENT LIBRARY:
1. Document all variants
2. Show usage guidelines
3. Explain when to use each
4. Lock down modifications
```

---

## 5. The Disabled State Disaster

**Severity:** High
**Situation:** Disabled elements that are invisible or confusing
**Why Dangerous:** Users don't understand what's wrong or what to do.

```
BAD PATTERNS:
- Light gray on light gray (invisible)
- No cursor change
- No explanation why it's disabled
- Removes the element entirely

GOOD DISABLED STATES:
1. Visible but clearly inactive
   opacity: 0.5;
   cursor: not-allowed;

2. Explain WHY it's disabled
   <button disabled aria-describedby="why">
     Submit
   </button>
   <span id="why">
     Please fill required fields
   </span>

3. Show what enables it
   "Add items to cart to checkout"

4. Consider hiding vs disabling
   If users can NEVER use it → hide
   If users need to DO something → disable + explain
```

---

## 6. The Color-Only Meaning

**Severity:** Critical (Accessibility)
**Situation:** Using color as the only way to convey information
**Why Dangerous:** Color blind users, monochrome displays, print.

```
BAD:
- Red = error, green = success (only)
- Required fields marked with red asterisk only
- Charts with colored lines only
- Status dots with no text

GOOD:
Error: Red color + icon + text
  ❌ Email is invalid

Success: Green color + icon + text
  ✓ Saved successfully

Required: Asterisk + label text
  Email* (required)

Charts: Color + pattern + labels
  [///] Revenue (green, striped)
  [===] Costs (red, dashed)

Status: Color + icon + text
  🟢 Online | 🔴 Offline
  ✓ Active | ✗ Inactive
```

---

## 7. The Modal Trap

**Severity:** High
**Situation:** Modals that trap users, stack infinitely, or lack escape
**Why Dangerous:** Users feel stuck. Keyboard users literally are stuck.

```
MODAL REQUIREMENTS:

1. Focus trap (accessibility)
   Focus must stay inside modal
   Tab cycles through modal elements

2. Escape routes
   - X button (obvious)
   - Escape key (keyboard)
   - Click outside (optional but expected)

3. Return focus
   When modal closes, focus returns to trigger

4. No modal inception
   Modal → Modal → Modal = UX nightmare
   If you need this, rethink the flow

5. Scroll lock
   Body doesn't scroll behind modal
   Modal content scrolls if needed

6. Mobile consideration
   Full screen or bottom sheet
   Not a tiny box in the middle

ARIA REQUIREMENTS:
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-desc">
```

---

## 8. The Invisible Focus

**Severity:** Critical (Accessibility)
**Situation:** Removing focus outlines with `outline: none`
**Why Dangerous:** Keyboard users cannot navigate. WCAG violation.

```
THE CRIME:
*:focus {
  outline: none; /* NEVER DO THIS */
}

button:focus {
  outline: 0; /* STILL BAD */
}

THE FIX - FOCUS-VISIBLE:
/* Only hide for mouse users */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Or use a custom focus style */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5);
}

REQUIREMENTS:
- Clearly visible
- High contrast
- Consistent across site
- Works on all interactive elements
```

---

## 9. The Animation Assault

**Severity:** High
**Situation:** Animations that are too fast, too slow, or too much
**Why Dangerous:** Motion sickness, vestibular disorders, distraction.

```
BAD ANIMATIONS:
- Duration > 500ms (feels slow)
- Duration < 100ms (feels jarring)
- Parallax scrolling
- Auto-playing video backgrounds
- Infinite loading spinners
- Bounce/elastic that's too bouncy

GOOD ANIMATION PRINCIPLES:
Duration: 150-300ms for most UI
Easing: ease-out for entrances
        ease-in for exits
        ease-in-out for position changes

RESPECT PREFERENCES:
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

PURPOSE OF MOTION:
✓ Showing connection (this came from there)
✓ Confirming action (button pressed)
✓ Guiding attention (notification appeared)
✗ Decoration (things floating around)
```

---

## 10. The Spacing Chaos

**Severity:** High
**Situation:** Inconsistent spacing throughout the interface
**Why Dangerous:** Creates visual disorder, breaks grouping, looks amateur.

```
THE CHAOS:
margin: 17px; /* why 17? */
padding: 13px 22px; /* random */
gap: 9px; /* no rhythm */

THE SYSTEM - 4px/8px BASE:
4px   - Minimal (icon to text)
8px   - Tight (related items)
16px  - Standard (form fields)
24px  - Relaxed (sections)
32px  - Spacious (major sections)
48px  - Dramatic (page breaks)
64px  - Maximum (hero sections)

IMPLEMENTATION:
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 1rem;     /* 16px */
  --space-4: 1.5rem;   /* 24px */
  --space-5: 2rem;     /* 32px */
  --space-6: 3rem;     /* 48px */
  --space-7: 4rem;     /* 64px */
}

LAW OF PROXIMITY:
Related items: Close together
Unrelated items: Far apart
The space BETWEEN tells users what BELONGS together
```

---

## 11. The Hover-Only Action

**Severity:** Critical
**Situation:** Important actions only visible on hover
**Why Dangerous:** Touch devices have no hover. Discovery impossible.

```
BAD PATTERNS:
- Delete button appears on row hover
- Edit controls hidden until hover
- Navigation submenus on hover only
- Tooltips with essential info

THE PROBLEM:
- Mobile: No hover state exists
- Keyboard: No cursor to trigger
- Discoverability: Users don't know to hover

ALTERNATIVES:
1. Always visible (best for critical actions)
   [Item Name]  [Edit] [Delete]

2. Progressive disclosure
   [Item Name]  [...] → [Edit] [Delete]
   Three-dot menu is discoverable

3. Swipe actions (mobile)
   ← Swipe reveals actions →
   With visual hint it's possible

4. Long press (touch)
   Context menu on long press
   But provide alternative

5. Selection mode
   [□] Select items → bulk action bar appears
```

---

## 12. The Z-Index War

**Severity:** Medium
**Situation:** Z-index values spiraling: 999, 9999, 99999...
**Why Dangerous:** Unmaintainable. Components fight. Bugs appear randomly.

```
THE WAR:
.dropdown { z-index: 100; }
.modal { z-index: 999; }
.toast { z-index: 9999; }
.tooltip { z-index: 99999; }
/* New dev adds emergency fix */
.important { z-index: 999999999; }

THE PEACE - STACKING CONTEXT SCALE:
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
}

RULES:
1. Use the scale, nothing outside it
2. Create stacking contexts intentionally
3. Document the hierarchy
4. Review z-index in code review

STACKING CONTEXT RESET:
.modal {
  isolation: isolate; /* New stacking context */
}
/* Children z-index only compete within modal */
```

## Decision Framework

# Decisions: UI Design

Critical decision points that determine interface success.

---

## Decision 1: Design Tool Selection

**Context:** Choosing the primary design tool for your team.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Figma** | Collaborative, web-based, industry standard | Subscription cost, Adobe ownership | Default choice for teams |
| **Sketch** | Mac-native, mature ecosystem | Mac only, collaboration requires plugins | Mac-only team, existing Sketch files |
| **Adobe XD** | Adobe integration, free tier | Smaller ecosystem, uncertain future | Heavy Adobe suite users |
| **Framer** | Code-like components, real interactions | Learning curve, expensive | Design-to-code, advanced prototypes |

**Framework:**
```
Design tool selection:

Team size?
├── Solo → Figma (free for individuals)
├── Team → Figma (collaboration built-in)
└── Enterprise → Figma or Sketch (depends on ecosystem)

Existing ecosystem?
├── Adobe suite → Consider XD
├── Heavy prototyping → Framer
└── Standard UI work → Figma

Developer handoff?
├── Need production code → Framer
├── Standard specs → Figma Dev Mode
└── Custom tooling → Any (export to tokens)

Cross-platform team?
├── Windows + Mac → Figma (web-based)
└── Mac only → Sketch is option

FIGMA ADVANTAGES:
1. Real-time collaboration (like Google Docs)
2. Web-based (no installs, any OS)
3. Free for individuals
4. Largest plugin ecosystem
5. Built-in prototyping
6. Dev mode for handoff
7. Industry standard (hiring, resources)
```

**Default Recommendation:** Figma. It's the industry standard, works everywhere, and handles collaboration best. Only consider alternatives with specific justification.

---

## Decision 2: Color Palette Approach

**Context:** Building a color system for your product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Brand-derived** | Strong identity, cohesive | May lack functional colors | Consumer products, brand-heavy |
| **Functional-first** | Clear meaning, accessible | May feel generic | Enterprise, utility apps |
| **Tailwind defaults** | Proven, comprehensive | Same as everyone else | Speed, no designer, MVP |
| **Custom palette** | Unique, precise | Time-consuming, error-prone | Strong design vision, resources |

**Framework:**
```
Color system decision:

Starting point?
├── Strong brand colors → Derive system from brand
├── No brand yet → Start functional, add personality
└── Speed priority → Tailwind or Radix colors

Application type?
├── Consumer/lifestyle → Brand expression important
├── Enterprise/utility → Functional clarity priority
├── Dashboard/data → Neutral base + accent

Required colors:

NEUTRAL SCALE (Gray):
- Background levels (3-4 shades)
- Text levels (3-4 shades)
- Border levels (2-3 shades)

PRIMARY (Brand):
- Main action color
- Hover/active states
- Light variant for backgrounds

SEMANTIC:
- Success (green)
- Warning (yellow/orange)
- Error (red)
- Info (blue)

EXTENDED (optional):
- Secondary brand color
- Accent colors
- Data visualization palette

ACCESSIBILITY CHECK:
Every color pairing must pass contrast
Use tools: Contrast plugin, accessibleweb.com
Minimum 4.5:1 for text, 3:1 for large text/icons
```

**Default Recommendation:** Start with Tailwind or Radix color palette, customize primary to brand. This gives you proven accessible colors with room for identity.

---

## Decision 3: Typography System

**Context:** Selecting and scaling typefaces for your interface.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **System fonts** | Zero load time, native feel | Less unique, varies by OS | Performance priority, utility apps |
| **Single webfont** | Consistent, brand expression | Load time, licensing cost | Brand consistency matters |
| **Font pair** | Hierarchy, visual interest | Complexity, more loading | Content-heavy, editorial |
| **Variable font** | Flexibility, single file | Browser support, complexity | Modern browsers, design flexibility |

**Framework:**
```
Typography selection:

Performance budget?
├── Strict → System fonts (Inter for cross-platform consistency)
├── Moderate → Single font, 2-3 weights
└── Flexible → Font pair, variable fonts

Content type?
├── Data/UI heavy → Sans-serif (Inter, Roboto)
├── Editorial/reading → Serif or humanist sans
├── Technical/code → Monospace available
└── Brand expression → Custom selection

FONT STACK PATTERNS:

System fonts (fastest):
font-family: system-ui, -apple-system, sans-serif;

Modern fallback:
font-family: 'Inter', system-ui, sans-serif;

Safe web fonts:
font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;

SCALE APPROACH:
1. Choose base size (16px standard)
2. Choose ratio (1.25 major third, 1.2 minor third)
3. Generate scale: base × ratio^n
4. Round to practical values
5. Limit to 6-8 sizes

WEIGHT USAGE:
400 (Regular) - Body text
500 (Medium) - Subtle emphasis
600 (Semibold) - Strong emphasis, subheadings
700 (Bold) - Headlines, CTAs
```

**Default Recommendation:** Inter (or system fonts) with a major third scale (1.25). Inter is free, designed for screens, and widely supported.

---

## Decision 4: Component Library Strategy

**Context:** Building or adopting a component library.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Build from scratch** | Fully custom, exact needs | Expensive, slow, maintenance | Large team, unique needs, long-term |
| **Headless (Radix, Headless UI)** | Accessible, unstyled, flexible | Need design skills | Custom design, accessibility priority |
| **Styled (Chakra, MUI)** | Fast start, full ecosystem | Customization friction, bundle size | MVP, standard design, speed |
| **Tailwind UI** | Beautiful, well-designed | Cost, Tailwind dependency | Tailwind already in stack |

**Framework:**
```
Component library decision:

Team design resources?
├── No designer → Styled library (Chakra, Shadcn)
├── Designer → Headless + custom styles
└── Design team → Consider custom system

Timeline?
├── MVP (weeks) → Styled library
├── Launch (months) → Headless + design
└── Long-term → Custom or hybrid

Unique design requirements?
├── Standard UI → Any library works
├── Custom brand → Headless required
└── Highly unique → Custom build

Tech stack alignment?
├── React → Most options
├── Vue → Vuetify, Headless Vue
├── Svelte → Skeleton, custom

RECOMMENDED APPROACH (React):
shadcn/ui + Radix primitives
- Radix: Accessible headless components
- shadcn: Copy-paste styled components
- Result: Customizable, accessible, owned

COMPONENT OWNERSHIP:
- Copy into your codebase (shadcn model)
- Full control over styling
- Update on your schedule
- No breaking changes from upstream
```

**Default Recommendation:** shadcn/ui for React projects. It gives you beautiful, accessible components that you own and can customize. For non-React, use Radix-style headless libraries.

---

## Decision 5: Responsive Breakpoint Strategy

**Context:** Defining breakpoints for responsive design.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Device-based** | Matches real devices | Fragile, devices change | Specific device targets |
| **Content-based** | Breaks where design needs it | Non-standard, harder to communicate | Custom layouts |
| **Framework default** | Standard, documented | May not fit all designs | Using CSS framework |

**Framework:**
```
Breakpoint strategy:

STANDARD BREAKPOINTS (Tailwind):
sm:  640px  - Large phones, portrait tablets
md:  768px  - Tablets
lg:  1024px - Small desktops, landscape tablets
xl:  1280px - Desktops
2xl: 1536px - Large desktops

COMMON DEVICE WIDTHS (2024):
320px  - Older iPhones (SE)
375px  - iPhone 12/13 mini
390px  - iPhone 14/15
428px  - iPhone 14/15 Plus/Pro Max
768px  - iPad Mini
820px  - iPad Air
1024px - iPad Pro 11"
1366px - Common laptop
1920px - Full HD desktop

MOBILE-FIRST APPROACH:
/* Base styles (mobile) */
.component { width: 100%; }

/* Tablet and up */
@media (min-width: 768px) {
  .component { width: 50%; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component { width: 33.33%; }
}

BREAKPOINT RULES:
1. Mobile-first (start small, enhance)
2. Major layout shifts only (2-3 breakpoints)
3. Container max-width (1280-1440px)
4. Test at awkward sizes (600px, 900px)
5. Don't forget landscape mobile
```

**Default Recommendation:** Use Tailwind's breakpoints (640, 768, 1024, 1280) with mobile-first approach. They're well-tested and standard enough for team communication.

---

## Decision 6: Icon System

**Context:** Selecting and implementing icons throughout the product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Icon font (FontAwesome)** | Easy, widely supported | All icons loaded, styling limits | Quick implementation |
| **SVG library (Heroicons, Lucide)** | Tree-shakable, full control | Setup required | Modern projects, performance |
| **Custom icons** | Unique, exact match | Expensive, maintenance | Strong brand, specific needs |
| **Icon component library** | React/Vue components | Framework lock-in | Component-based apps |

**Framework:**
```
Icon system decision:

Performance priority?
├── High → SVG library (tree-shakable)
├── Medium → Icon fonts okay
└── Low → Either works

Customization needs?
├── Color/size only → Any
├── Animations → SVG required
└── Custom designs → Custom icons

Framework?
├── React → Lucide React, Heroicons React
├── Vue → Heroicons Vue
├── Vanilla → SVG sprites or inline

RECOMMENDED: LUCIDE ICONS
- 1000+ icons
- MIT license (free)
- Tree-shakable
- Consistent style
- React/Vue/Svelte packages
- Active development

IMPLEMENTATION:
// React component approach
import { Home, Settings, User } from 'lucide-react';

<Home size={24} strokeWidth={2} />

// Size system
const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Wrapper component
function Icon({ name, size = 'md', ...props }) {
  const IconComponent = icons[name];
  return <IconComponent size={iconSizes[size]} {...props} />;
}
```

**Default Recommendation:** Lucide Icons (React/Vue package). Free, comprehensive, tree-shakable, and maintained. Heroicons is also excellent if you prefer that style.

---

## Decision 7: Motion/Animation Strategy

**Context:** Defining how and when to use animation.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Minimal (CSS only)** | Performance, simple | Less polished | Performance priority, utility |
| **Systematic (CSS + JS library)** | Consistent, reusable | Bundle size, learning curve | Refined experience |
| **Heavy animation** | Delightful, impressive | Performance, motion sickness | Marketing, first impressions |
| **None** | Simplest, accessible | Feels static | Accessibility priority |

**Framework:**
```
Animation strategy:

ANIMATION PURPOSES:
1. Feedback - Confirm user action
2. Orientation - Show where elements came from/go
3. Attention - Draw eye to changes
4. Delight - Make experience enjoyable

TIMING GUIDELINES:
Micro (buttons, inputs): 100-150ms
Small (dropdowns, tooltips): 150-200ms
Medium (modals, panels): 200-300ms
Large (page transitions): 300-500ms

Never exceed 500ms for UI animation

EASING:
ease-out: Entrances (element arriving)
ease-in: Exits (element leaving)
ease-in-out: Position changes (moving)
linear: Opacity, looping animations

CSS-FIRST APPROACH:
.button {
  transition:
    background-color 150ms ease-out,
    transform 100ms ease-out;
}

.button:hover {
  background-color: var(--primary-hover);
}

.button:active {
  transform: scale(0.98);
}

REDUCED MOTION:
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**Default Recommendation:** Minimal CSS-first with systematic tokens. Use Framer Motion or similar only for complex interactions. Always respect prefers-reduced-motion.

---

## Decision 8: Dark Mode Strategy

**Context:** Whether and how to implement dark mode.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Light only** | Simpler, less maintenance | Missing user preference | MVP, resource constraints |
| **Dark only** | Trendy, less eye strain | Limits audience | Developer tools, media apps |
| **System preference** | Respects user, automatic | Less control | Most products |
| **User toggle + system** | Maximum control | Most complex | Full product |

**Framework:**
```
Dark mode decision:

User expectations?
├── Developer/tech audience → Dark mode expected
├── General consumer → Nice to have
├── Professional/enterprise → Light typically preferred

Implementation complexity budget?
├── Low → Skip or light-only
├── Medium → System preference only
├── High → Full toggle + system

IMPLEMENTATION:

CSS Variables approach:
:root {
  --bg-primary: white;
  --text-primary: #1a1a1a;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #fafafa;
}

/* Or system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #fafafa;
  }
}

DARK MODE PITFALLS:
1. Don't just invert colors
2. Reduce contrast slightly (not pure white on black)
3. Use darker shadows, not lighter
4. Images may need adjustment
5. Test every screen

COLOR ADJUSTMENT:
Light mode: Gray-900 on White
Dark mode: Gray-100 on Gray-900 (not pure)

Light shadows: rgba(0,0,0,0.1)
Dark shadows: rgba(0,0,0,0.3)
```

**Default Recommendation:** System preference detection with CSS custom properties. Add user toggle if audience expects it. Don't skip the work of properly adapting colors.

---

## Decision 9: Form Field Style

**Context:** Choosing how form inputs look and behave.

**Options:**

| Style | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **Outlined** | Clear boundaries, accessible | Takes more space | Default, most forms |
| **Filled** | Compact, material design | Less distinct boundaries | Dense forms, Material |
| **Underlined** | Minimal, elegant | Less clear, accessibility | Simple forms, minimal aesthetic |
| **Floating label** | Saves space, animated | Complex, accessibility issues | Space constraints |

**Framework:**
```
Form field decision:

OUTLINED (Recommended default):
┌─────────────────────────────────┐
│ placeholder                     │
└─────────────────────────────────┘

Label above:
Email
┌─────────────────────────────────┐
│ john@example.com                │
└─────────────────────────────────┘

FILLED:
╔═════════════════════════════════╗
║ placeholder                     ║
╚═════════════════════════════════╝

UNDERLINED:
placeholder
─────────────────────────────────

FLOATING LABEL:
      Email
┌─────────────────────────────────┐
│ john@example.com                │
└─────────────────────────────────┘

ACCESSIBILITY CHECKLIST:
□ Label always visible (not placeholder-only)
□ Error state clear and described
□ Focus state visible
□ Touch target 44px minimum
□ Contrast meets WCAG

RECOMMENDED PATTERN:
<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" />
  <span class="error" role="alert" hidden>
    Please enter a valid email
  </span>
</div>
```

**Default Recommendation:** Outlined inputs with labels above. Most accessible, clearest, and works in all contexts. Avoid floating labels unless absolutely necessary for space.

---

## Decision 10: Design Token Organization

**Context:** Structuring design tokens for scalability.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Flat** | Simple, quick | Doesn't scale, no theming | Small project |
| **Semantic** | Meaningful names | More abstraction | Medium project |
| **Multi-tier** | Maximum flexibility | Complex | Large project, multi-brand |

**Framework:**
```
Token architecture:

TIER 1: PRIMITIVES (Raw values)
--blue-500: #3b82f6;
--gray-900: #111827;
--space-4: 1rem;

TIER 2: SEMANTIC (Meaning)
--color-primary: var(--blue-500);
--color-text: var(--gray-900);
--spacing-md: var(--space-4);

TIER 3: COMPONENT (Context)
--button-bg: var(--color-primary);
--button-padding: var(--spacing-md);

ORGANIZATION:
tokens/
├── primitives/
│   ├── colors.css
│   ├── spacing.css
│   └── typography.css
├── semantic/
│   ├── colors.css
│   └── spacing.css
├── components/
│   ├── button.css
│   ├── input.css
│   └── card.css
└── themes/
    ├── light.css
    └── dark.css

THEMING WITH TIERS:
/* Base theme */
:root {
  --color-bg: var(--white);
  --color-text: var(--gray-900);
}

/* Dark theme overrides semantic, not primitive */
[data-theme="dark"] {
  --color-bg: var(--gray-900);
  --color-text: var(--gray-100);
}

/* Component tokens use semantic */
.card {
  background: var(--color-bg);
  color: var(--color-text);
}
/* Automatically themed */
```

**Default Recommendation:** Two-tier (primitives + semantic) for most projects. Add component tier when you have a design system with multiple products or themes.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `flow|journey|research|usability` | ux-design | Design needs UX validation |
| `implement|code|build|develop` | frontend | Design needs implementation |
| `brand|identity|logo|colors` | branding | Design needs brand direction |
| `accessibility|a11y|wcag|contrast` | frontend | Design needs accessibility review |

### Receives Work From

- **ux-design**: UX validated, needs visual design
- **branding**: Brand needs product application
- **product-strategy**: Product needs interface design
- **frontend**: Implementation needs design specs
- **taste-and-craft**: Design needs quality calibration

### Works Well With

- ux-design
- frontend
- branding
- accessibility

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/design/ui-design/`

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
