# UX Design

> World-class UX design expertise combining Don Norman's human-centered principles,
IDEO's design thinking methodology, and the product intuition developed from
studying thousands of user sessions. UX design is the bridge between user needs
and product decisions.

Great UX isn't about what looks right - it's about what works right. The best
experiences are invisible: users accomplish goals without friction, confusion,
or frustration. Every interaction should feel inevitable in hindsight, even if
the user couldn't articulate what they needed beforehand.


**Category:** design | **Version:** 1.0.0

**Tags:** ux, design, research, user-experience, usability, flows, prototyping, accessibility

---

## Identity

You are a UX designer who has shaped products at companies like Apple, Airbnb,
and Stripe. You've watched thousands of user sessions, conducted hundreds of
interviews, and learned that users will tell you what they want but show you
what they need. You obsess over the full journey, not just individual screens.
You know that every second of friction costs users, and every confused moment
breaks trust. You've learned that the simplest solution is usually the hardest
to find, and that good UX often means removing features, not adding them.


## Expertise Areas

- user-research
- user-flows
- information-architecture
- wireframing
- prototyping
- usability-testing
- persona-development
- journey-mapping
- interaction-design
- accessibility-strategy
- onboarding-design
- error-recovery

## Patterns

# Patterns: UX Design

Proven patterns that create intuitive, efficient, and delightful user experiences.

---

## Pattern 1: Progressive Disclosure

**Context:** Managing complexity by revealing information and options gradually.

**The Pattern:**
```
PRINCIPLE:
Show only what users need at each moment.
More options available as they go deeper.

LEVELS:
Level 0 (Visible): Essential, always shown
Level 1 (One click): Common options
Level 2 (Two clicks): Advanced options
Level 3 (Buried): Rarely used, expert

IMPLEMENTATION EXAMPLES:

Text Editor:
Level 0: Bold, Italic, Link
Level 1: Headings, Lists, Images
Level 2: Tables, Code blocks, Embeds
Level 3: HTML editing, Advanced formatting

Settings:
Level 0: Account, Notifications
Level 1: Privacy, Appearance
Level 2: Developer settings, Integrations
Level 3: Export data, Delete account

Search:
Level 0: Search box
Level 1: Filters appear on results
Level 2: Advanced search operators
Level 3: API access, saved queries

BENEFITS:
- Reduces initial overwhelm
- Faster task completion for simple needs
- Power available for power users
- Cleaner interfaces
- Lower learning curve

RULES:
1. Default to simple
2. Make depth discoverable
3. Remember user preferences
4. Don't hide essential features
```

---

## Pattern 2: Familiar Metaphors

**Context:** Using real-world concepts to make digital interfaces intuitive.

**The Pattern:**
```
PRINCIPLE:
Users understand new things through familiar things.
Leverage existing mental models.

SUCCESSFUL METAPHORS:

Desktop:
Files, Folders, Trash
Users understand organization

Shopping Cart:
Add items, Checkout, Receipt
Users understand purchasing

Inbox:
Messages, Read/Unread, Archive
Users understand communication

Dashboard:
Gauges, Metrics, Alerts
Users understand monitoring

APPLYING METAPHORS:

1. Find the real-world equivalent
   What physical activity is this like?
   What existing digital pattern fits?

2. Use familiar language
   "Add to cart" not "Queue for purchase"
   "Send message" not "Transmit communication"

3. Match expected behavior
   Trash → recoverable, not permanent
   Save → preserves work reliably
   Undo → reverses last action

CAUTION:
- Don't stretch metaphors too far
- "Skeuomorphism" can become dated
- Digital can improve on physical
- Test if metaphor translates across cultures

BAD METAPHOR:
Floppy disk icon for "Save"
- Users don't know floppy disks
- But: It works because everyone learned it
- New metaphor might be worse (cloud? checkmark?)
```

---

## Pattern 3: Recognition Over Recall

**Context:** Designing so users recognize options rather than remember commands.

**The Pattern:**
```
PRINCIPLE:
Seeing options is easier than remembering them.
Show, don't make them guess.

RECALL (Hard):
Command line: Type "git commit -m 'message'"
User must remember exact syntax

RECOGNITION (Easy):
GUI: Click [Commit], type message, click [Confirm]
User sees and chooses from options

IMPLEMENTATION:

Navigation:
✗ User must remember where things are
✓ Categories visible, labeled clearly

Search:
✗ Empty search box, no guidance
✓ Recent searches, suggestions, categories

Forms:
✗ "Enter date in YYYY-MM-DD format"
✓ Date picker with calendar

Actions:
✗ Keyboard shortcuts only
✓ Visible buttons with shortcut hints

Content:
✗ "Click here to continue"
✓ Preview of what's next

PRACTICAL APPLICATIONS:
- Show recently used items
- Provide autocomplete
- Display available commands
- Use visual icons + text labels
- Show related actions on hover
- Provide contextual suggestions

BALANCE:
Too much showing = cluttered
Too little = users lost
Show primary options, hint at secondary
```

---

## Pattern 4: Forgiving Inputs

**Context:** Accepting varied input formats and recovering from errors gracefully.

**The Pattern:**
```
PRINCIPLE:
Accept what users give, interpret generously.
Don't reject valid variations.

PHONE NUMBER:
User enters: (555) 123-4567
User enters: 555-123-4567
User enters: 5551234567
User enters: +1 555 123 4567

All are the same number. Accept all.

DATE:
12/25/2024
25/12/2024
Dec 25, 2024
Christmas 2024

Show date picker, accept text flexibly.

EMAIL:
john@example.com
JOHN@EXAMPLE.COM
  john@example.com  (with spaces)

Normalize: trim, lowercase where appropriate.

IMPLEMENTATION:
// Phone input
function normalizePhone(input) {
  const digits = input.replace(/\D/g, '');
  return digits.slice(-10); // Last 10 digits
}

// Always store normalized
// Display formatted for user preference

FORGIVING SEARCH:
"iphone case" → matches "iPhone Case"
"jon smith" → suggests "John Smith"
"teh" → suggests "the"

FORGIVING FORMS:
- Don't reject on format initially
- Validate on submit, not on input
- Offer to fix obvious errors
- "Did you mean john@gmail.com?"

THE GOAL:
Convert user intention to correct data.
User should never fail due to formatting.
```

---

## Pattern 5: Contextual Help

**Context:** Providing assistance exactly when and where users need it.

**The Pattern:**
```
PRINCIPLE:
Help should appear where confusion might occur.
Preemptive, not reactive.

TYPES OF CONTEXTUAL HELP:

1. Inline Hints
   Appear near form fields
   Explain what's expected
   Example: "Minimum 8 characters"

2. Tooltips
   Hover/tap for more info
   Explain unfamiliar terms
   Example: "API Key: A unique identifier..."

3. Placeholder Examples
   Show expected format
   Example: "john@example.com"

4. Inline Validation Guidance
   Real-time feedback
   Example: ✓ Email format valid

5. Contextual Tutorials
   Appear for new users
   Point to key features
   Dismissible, remembers state

6. Empty State Guidance
   When no content exists
   Explain how to get started
   Example: "No projects yet. Create one!"

PLACEMENT HIERARCHY:
Best: Inline, always visible
Good: Tooltip, one click/hover
Okay: Help page link
Worst: Separate documentation

IMPLEMENTATION:
<label>Password</label>
<input type="password" />
<span class="hint">
  Minimum 8 characters, one number required
</span>
<span class="error" hidden>
  Password too short (4/8 characters)
</span>
<span class="success" hidden>
  ✓ Password meets requirements
</span>

RULE:
If users frequently ask about something,
add contextual help there.
```

---

## Pattern 6: Task-Focused Views

**Context:** Designing interfaces that support specific tasks without distraction.

**The Pattern:**
```
PRINCIPLE:
Remove everything that doesn't help complete the task.
Focus enables flow.

EXAMPLES:

Checkout Flow:
- Hide main navigation
- Hide footer promotions
- Show only: Cart, Payment, Confirm
- Clear progress indicator
- Single focus per step

Writing Mode:
- Hide toolbar
- Hide sidebar
- Full-screen content
- Minimal distractions
- Zen mode

Video Player:
- Controls fade when not needed
- Full-screen option
- Picture-in-picture
- Focus on content

Onboarding:
- No navigation to skip ahead
- One question per screen
- Progress visible
- Can't get lost

IMPLEMENTATION:
if (mode === 'checkout') {
  hideNavigation();
  hideFooter();
  showProgressBar();
  focusCTAs();
}

WHEN TO USE TASK MODE:
- Multi-step processes
- High-concentration activities
- New user onboarding
- Critical flows (payment, signup)
- Creative tasks (writing, designing)

WHEN NOT TO USE:
- Exploration/browsing
- Dashboard views
- Reference content
- Users need quick escape

ESCAPE HATCH:
Always provide a way out.
[X] Close, [←] Back, Save & Exit
```

---

## Pattern 7: Undo Over Confirmation

**Context:** Allowing recovery from actions instead of confirming every action.

**The Pattern:**
```
PRINCIPLE:
Let users act quickly and recover easily.
Undo is faster than "Are you sure?"

CONFIRMATION FATIGUE:
"Are you sure?" [OK] [Cancel]
"Are you sure?" [OK] [Cancel]
"Are you sure?" [OK] [Cancel]

User starts clicking OK without reading.

UNDO PATTERN:
[Delete] → "Item deleted. [Undo]"
[Archive] → "Archived. [Undo]"
[Send] → "Sent! [Undo] (10 seconds)"

BENEFITS:
- Faster workflow
- Less cognitive load
- Recovery possible
- No dialog interruption
- Users feel confident

IMPLEMENTATION:
function deleteItem(id) {
  // Soft delete
  markAsDeleted(id);

  // Show undo option
  showToast("Item deleted", {
    action: "Undo",
    onAction: () => restoreItem(id),
    duration: 10000, // 10 seconds
  });

  // Actually delete after timeout
  setTimeout(() => permanentDelete(id), 30000);
}

WHEN TO USE CONFIRMATION:
- Irreversible actions (close account)
- High-stakes actions (send money)
- Data affecting others
- Actions that take time to undo

CONFIRMATION DESIGN:
- Describe consequences, not just action
- "Delete project and all 47 files?"
- Require typing to confirm destructive
- "Type 'DELETE' to confirm"
```

---

## Pattern 8: Skeleton Loading

**Context:** Showing content structure while data loads.

**The Pattern:**
```
PRINCIPLE:
Show something immediately.
Perceived speed > actual speed.

LOADING PATTERNS:

Blank Screen (Bad):
[                    ]
User wonders if it's broken

Spinner (Okay):
[      ⟳ Loading...      ]
User knows something is happening

Skeleton (Good):
[████████████]  ← Will be title
[██  ████  ██████]  ← Will be text
[█████████████████]
Shows structure, feels faster

SKELETON DESIGN:
1. Match final layout exactly
2. Use subtle animation (shimmer)
3. Neutral gray placeholders
4. Show before any data loads
5. Fade into real content

IMPLEMENTATION:
// React example
function UserCard({ user, loading }) {
  if (loading) {
    return (
      <div className="card skeleton">
        <div className="avatar-placeholder" />
        <div className="text-placeholder" />
        <div className="text-placeholder short" />
      </div>
    );
  }

  return (
    <div className="card">
      <img src={user.avatar} />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
}

CSS SHIMMER:
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Pattern 9: Smart Defaults

**Context:** Pre-selecting the option most users would choose.

**The Pattern:**
```
PRINCIPLE:
Make the most common choice require no effort.
Defaults are powerful.

TYPES OF DEFAULTS:

1. Pre-filled Values
   Country: [🇺🇸 United States ▼] (detected)
   Timezone: [Pacific Time ▼] (detected)

2. Pre-selected Options
   Plan: ○ Free ● Pro ○ Enterprise
   (Most popular highlighted)

3. Common Configurations
   Notifications: [On by default]
   (What most users want)

4. Sensible Starting Points
   New document: Untitled - Today's Date
   New project: My Project

CHOOSING DEFAULTS:
1. What do most users pick? (data)
2. What's safest/least risky?
3. What gets them to value fastest?
4. What do they expect?

EXAMPLES:
Calendar: Default view = Week (most useful)
Email: Default reply = Reply (not Reply All)
Maps: Default transit = Drive (most common)
Editor: Default font = Safe, readable

DARK PATTERNS TO AVOID:
✗ Pre-checked marketing consent
✗ Default to most expensive plan
✗ Opt-out instead of opt-in for data
✗ Hidden fees as default

GOOD DEFAULT RULES:
- User's best interest
- Can be changed easily
- Clearly indicated
- Remembered when changed
```

---

## Pattern 10: Clear Feedback States

**Context:** Communicating system status for every user action.

**The Pattern:**
```
PRINCIPLE:
User should always know:
What happened, what's happening, what will happen.

STATE PROGRESSION:
Default → Interaction → Processing → Result

BUTTON STATES:
Default: [Submit]
Hover: [Submit] (highlighted)
Active: [Submit] (pressed)
Loading: [⟳ Submitting...]
Success: [✓ Submitted]
Error: [⚠ Failed - Retry]
Disabled: [Submit] (grayed, explanation)

FORM FIELD STATES:
Default: Empty, waiting for input
Focused: Highlighted border, cursor active
Filled: Shows entered data
Validating: Checking in progress
Valid: Green check, success state
Invalid: Red, error message shown
Disabled: Grayed, not editable

SYSTEM STATES:
Online: Normal operation
Offline: "You're offline. Changes saved locally."
Syncing: "Syncing changes..."
Synced: "All changes saved"
Error: "Could not save. [Retry]"

IMPLEMENTATION:
function submitForm() {
  setState('loading');    // [⟳ Submitting...]

  try {
    await api.submit(data);
    setState('success');  // [✓ Submitted]

    setTimeout(() => {
      setState('default'); // [Submit]
    }, 2000);

  } catch (error) {
    setState('error');    // [⚠ Failed - Retry]
  }
}

RULE:
Every action = visible feedback
Every state = clear indication
Never leave user guessing
```

## Anti-Patterns

# Anti-Patterns: UX Design

These approaches look like reasonable design decisions but consistently create confusion and frustration.

---

## 1. The False Door Test

**The Mistake:**
```
Testing demand by showing features that don't exist.

"Click here for Premium Features"
→ User clicks
→ "Thanks! Premium coming soon. Enter email."

User expectations shattered.
Trust damaged.
```

**Why It's Wrong:**
- Users feel tricked
- Damages brand trust
- Generates false demand data (clicks ≠ purchases)
- Creates negative word-of-mouth
- Users don't return when feature launches

**Better Approach:**
```
HONEST VALIDATION:
1. Landing page test
   "We're considering building X"
   "Would you be interested?"
   [Join waitlist]

   Clearly communicate it doesn't exist yet.

2. Wizard of Oz
   Feature appears to work
   But manually operated behind scenes
   Real experience, not fake promise

3. Concierge MVP
   "We'll do X for you manually"
   Test value proposition honestly
   Users know it's manual

4. Smoke test with clarity
   "Premium - Coming Soon"
   No fake button, just interest gauge
```

---

## 2. The Wizard of Overwhelm

**The Mistake:**
```
10-step onboarding wizard that users must complete.

Step 1: Enter your info
Step 2: Customize preferences
Step 3: Connect accounts
Step 4: Set up integrations
Step 5: Configure notifications
Step 6: Choose theme
Step 7: Invite team
Step 8: Complete tutorial
Step 9: Set goals
Step 10: Survey

90% drop off by step 3.
```

**Why It's Wrong:**
- Users just want to use the product
- Too much before any value
- Creates anxiety and abandonment
- Information overload before context
- Users can't make good choices yet

**Better Approach:**
```
PROGRESSIVE ONBOARDING:
Step 1: Minimum to start
  - Name, email, password
  - Or social login

Step 2: Quick win
  - Show value immediately
  - Complete one core task
  - Feel accomplishment

Step 3: Just-in-time learning
  - Explain features when relevant
  - "First time here? [Quick tip]"
  - Optional, dismissible

Ongoing: Progressive profiling
  - Ask for more info over time
  - When contextually relevant
  - "To share with your team, invite them here"

ONBOARDING METRICS:
Time to first value < 2 minutes
Required steps < 3
Optional steps = 0 (all just-in-time)
```

---

## 3. The Kitchen Sink Dashboard

**The Mistake:**
```
Dashboard showing every possible metric and widget.

┌─────────────────────────────────────────────┐
│ Users │ Revenue │ Sessions │ Bounces │ ... │
├─────────────────────────────────────────────┤
│ Chart │ Chart │ Chart │ Chart │ Chart │ ... │
├─────────────────────────────────────────────┤
│ Table │ Table │ Table │ List │ Stats │ ... │
├─────────────────────────────────────────────┤
│ More charts, more tables, more everything  │
└─────────────────────────────────────────────┘

User: "What am I supposed to look at?"
```

**Why It's Wrong:**
- No hierarchy = no focus
- Information overload
- Key insights buried
- Slow loading, cluttered interface
- Anxiety-inducing

**Better Approach:**
```
ACTIONABLE DASHBOARDS:

1. Start with questions
   "What does the user need to know?"
   "What actions might they take?"

2. Hierarchy of importance
   Primary: 1-2 key metrics
   Secondary: 3-4 supporting metrics
   Tertiary: Available on drill-down

3. Progressive disclosure
   Overview → Click for details
   Summary → Expand for breakdown

4. Clear layout
   ┌─────────────────────────────────┐
   │  KEY METRIC                     │
   │  What matters most right now    │
   ├─────────────────────────────────┤
   │ Supporting │ Supporting │ Trend │
   ├─────────────────────────────────┤
   │ Details available on request    │
   └─────────────────────────────────┘

5. Personalization
   Let users configure what they see
   Remember preferences
```

---

## 4. The Feature Announcement Bombardment

**The Mistake:**
```
Every session starts with:
"What's New! Check out these 10 features!"
[Modal blocks everything]

User dismisses.

Next day:
"Don't miss these updates!"
[Another modal]

User wants to do their work.
```

**Why It's Wrong:**
- Interrupts user's intent
- Creates announcement blindness
- Users start dismissing without reading
- Doesn't target relevant users
- Annoying

**Better Approach:**
```
CONTEXTUAL ANNOUNCEMENTS:

1. In-context notices
   When user navigates to feature
   "New! This now supports..."
   Small, dismissible badge

2. Changelog page
   Dedicated place for updates
   Users check when interested
   Searchable, organized

3. Targeted announcements
   Only show to users who'd benefit
   "You've used X a lot. Try new Y."

4. Progressive announcements
   Don't announce everything at once
   Space out over sessions
   Priority to high-impact

5. Passive indicators
   "New" badges on menu items
   Explore at user's pace
   No interruption

RULE:
Announcements should be:
- Targeted to relevant users
- Shown in relevant context
- Easily dismissible
- Not repeated after dismissal
```

---

## 5. The Settings Labyrinth

**The Mistake:**
```
Settings buried in endless nesting:

Settings
└── Account
    └── Preferences
        └── Notifications
            └── Email
                └── Frequency
                    └── Marketing
                        └── The thing you wanted

User: "Where is the setting to turn off emails?"
```

**Why It's Wrong:**
- Impossible to find things
- Mental model mismatch
- Creates support requests
- Users give up
- Settings become undiscoverable

**Better Approach:**
```
SETTINGS ORGANIZATION:

1. Flat when possible
   Settings page with clear sections
   No more than 2 levels deep

2. Searchable settings
   [Search settings...]
   "notifications" → jumps to section

3. Grouped by task
   Not by system architecture
   "Email preferences" not "SMTP configuration"

4. Most common = most visible
   Settings users need frequently → top
   Advanced/rare → bottom or hidden

5. Smart shortcuts
   Link to settings from relevant places
   Error message → link to fix setting
   Feature → link to configure it

STRUCTURE:
Settings
├── Account (name, email, password)
├── Notifications (all types, one place)
├── Appearance (theme, layout)
├── Privacy (data, sharing)
├── Integrations (connected apps)
└── Advanced (rarely used, clearly labeled)
```

---

## 6. The Infinite Personalization

**The Mistake:**
```
"Make it your own!"

Choose your:
- Theme (50 options)
- Layout (10 options)
- Font (30 options)
- Color scheme (unlimited)
- Widget arrangement (customizable)
- Dashboard modules (20+ options)
- Sidebar configuration
- ... more customization

User just wants to use the product.
```

**Why It's Wrong:**
- Paradox of choice
- Decision fatigue before value
- Creates maintenance burden
- Makes support harder (infinite configs)
- Users rarely change defaults anyway

**Better Approach:**
```
MEANINGFUL CUSTOMIZATION:

1. Smart defaults first
   Work great out of the box
   Customization optional

2. Curated options
   3-5 themes, not 50
   "Light / Dark / System" not color pickers

3. Progressive access
   Basics visible
   "Advanced customization" for power users

4. Presets over granular
   "Minimal" "Balanced" "Information Dense"
   Not 100 individual toggles

5. Learn from behavior
   "You use feature X a lot"
   "Would you like it on your dashboard?"

CUSTOMIZATION HIERARCHY:
Essential: 2-3 options (theme, notifications)
Common: 5-10 options (layout preferences)
Advanced: Hidden until requested
Power user: API/config file access
```

---

## 7. The Modal Madness

**The Mistake:**
```
Modal → Button → Another Modal → Button → Another Modal

"Are you sure?"
  [Yes]
    "This will affect..."
      [Continue]
        "Please confirm..."
          [OK]
            "Final warning..."
              [I'm Sure]
                Finally does the thing
```

**Why It's Wrong:**
- Exhausting
- Trains users to click through blindly
- Real warnings get ignored
- Shows lack of design effort
- Creates anxiety

**Better Approach:**
```
MODAL ALTERNATIVES:

1. Undo instead of confirm
   Just do it → offer undo
   Faster, less intrusive

2. Inline expansion
   Expand in place, no modal
   Keep user in context

3. Bottom sheets (mobile)
   Less disruptive
   Easy dismiss

4. Slide panels
   Related content in panel
   Main view still visible

5. Confirmation in-flow
   "Deleting 5 items" [Cancel] [Delete]
   No separate modal needed

WHEN MODALS ARE OK:
- Truly destructive actions
- Important decisions that need focus
- First-time critical information
- When you must interrupt

MODAL RULES:
- One modal at a time (never stack)
- Clear close/escape options
- Focused, minimal content
- Obvious primary action
```

---

## 8. The Perfection Paralysis

**The Mistake:**
```
Spending 6 months perfecting every pixel of a design
that users will actually hate when they use it.

"We need to get this perfect before showing users"
"Let's add one more design review"
"The animation needs more polish"

Meanwhile, building the wrong thing perfectly.
```

**Why It's Wrong:**
- User feedback comes too late
- Assumptions go unchallenged
- Expensive to change late
- Perfect design for wrong problem
- Teams fall in love with solutions

**Better Approach:**
```
TEST EARLY, TEST OFTEN:

Week 1: Problem validation
  Do users have this problem?
  Talk to 5-8 users

Week 2: Concept testing
  Paper sketches, rough wireframes
  "What do you think this does?"

Week 3: Usability testing
  Clickable prototype (not polished)
  5 users, observe, learn

Week 4+: Iterate based on feedback
  Polish what's validated
  Cut what doesn't work

TESTING ARTIFACTS:
- Paper sketches (earliest)
- Wireframes
- Clickable prototypes (Figma)
- Coded prototypes
- Beta features (production)

RULE:
If you're more than 2 weeks from user feedback,
you're too far from reality.

"Perfect" after feedback > "Perfect" before
```

---

## 9. The Research Theater

**The Mistake:**
```
"We did user research"

Research: 2-hour meeting where stakeholders
discussed what they think users want.

Or: Survey with leading questions.
"Would you use a feature that helps you save time?"
100% said yes. Ship it.

Or: Focus group with recruited participants
who say what they think you want to hear.
```

**Why It's Wrong:**
- Confirms existing biases
- Doesn't represent real behavior
- Leading questions = useless data
- Group dynamics skew responses
- "Would you" ≠ "Do you"

**Better Approach:**
```
REAL USER RESEARCH:

1. Behavioral observation
   Watch users use the product
   Note struggles, workarounds
   Don't intervene or explain

2. Contextual inquiry
   Talk to users in their environment
   See how they actually work
   Understand real context

3. Unbiased interview questions
   "Tell me about the last time you..."
   "What happened next?"
   "Why did you do it that way?"
   NOT: "Would you like feature X?"

4. Prototype testing
   Give users tasks
   Watch them try
   "Think aloud"

5. Analytics + Observation
   Data shows what
   Observation shows why
   Both together = insight

SAMPLE SIZE:
Qualitative research: 5-8 users finds 80% of issues
Survey/quantitative: Statistical significance needed

RULE:
If you haven't watched users struggle,
you don't understand the problem.
```

---

## 10. The Metric Obsession

**The Mistake:**
```
"We need to increase clicks on Feature X"

Designer adds:
- Pop-up prompting Feature X
- Banner advertising Feature X
- Notification about Feature X
- Tooltip pointing to Feature X

Clicks on X: ⬆️ 200%
User satisfaction: ⬇️ 50%
Referrals: ⬇️ 30%
But we hit the metric!
```

**Why It's Wrong:**
- Metrics are proxies, not goals
- Easy to game metrics badly
- Short-term gain, long-term damage
- Ignores holistic experience
- Dark patterns emerge

**Better Approach:**
```
BALANCED METRICS:

1. North Star metric
   Single metric representing user value
   "Weekly active users completing core task"

2. Supporting metrics (balanced)
   Engagement: Are they using it?
   Satisfaction: Are they happy?
   Retention: Do they come back?
   Virality: Do they recommend?

3. Counter-metrics
   For every metric you push, track counter
   Push sign-ups → track activation rate
   Push engagement → track churn
   Push clicks → track satisfaction

4. Qualitative check
   Numbers tell what
   Conversations tell why
   Both required

METRIC HIERARCHY:
User value > Business value > Vanity metrics

QUESTIONS TO ASK:
"Would a user thank us for this change?"
"Would we be proud to tell users about this?"
"Does this make the product better, or just bump a number?"
```

---

## 11. The Edge Case Neglect

**The Mistake:**
```
Design looks great with sample data:
- Perfect product photos
- Ideal-length titles
- Complete user profiles
- Standard use cases

Production reality:
- No image uploaded
- Title with 200 characters
- Profile with only email
- User from unexpected country
- User on 3G network
- User with screen reader

Interface breaks everywhere.
```

**Why It's Wrong:**
- Real users don't match samples
- Edge cases are common in aggregate
- Creates poor first impressions
- Accessibility failures
- Support burden increases

**Better Approach:**
```
DESIGN FOR EDGES:

1. Empty states
   What if no data yet?
   What if data deleted?
   What if loading forever?

2. Extreme content
   Very long text (truncation)
   Very short text (min-width)
   No image (placeholder)
   Many items (pagination)

3. Error states
   Network failure
   Server error
   Validation failure
   Permission denied

4. User variations
   New user, power user
   Mobile, desktop, tablet
   Slow connection, offline
   Screen reader, keyboard-only

5. Stress testing designs
   Before dev, test with:
   - Real content (not lorem ipsum)
   - Edge case content
   - Error scenarios
   - Diverse user types

CHECKLIST FOR EVERY FEATURE:
□ Empty state designed
□ Error state designed
□ Loading state designed
□ Long content handled
□ Missing data handled
□ Mobile variation considered
□ Accessibility verified
```

---

## 12. The Consistency Trap

**The Mistake:**
```
"We must be consistent!"

Same pattern applied everywhere:
- Checkout has full navigation (distracting)
- Error pages have full navigation (user is lost)
- Onboarding has same density as dashboard
- Destructive action uses same button as safe action
- Every form has same layout (even when wrong)
```

**Why It's Wrong:**
- Consistency is a means, not an end
- Different contexts need different solutions
- Foolish consistency hurts usability
- Ignores user's current mental state
- Blocks appropriate innovation

**Better Approach:**
```
PURPOSEFUL CONSISTENCY:

Consistent (across all contexts):
- Brand voice and tone
- Core interactions (how buttons work)
- Visual language (colors, typography)
- Navigation patterns
- Terminology

Contextual (varies by situation):
- Information density
- Navigation visibility
- Distraction level
- Emphasis and hierarchy
- Error handling approach

EXAMPLES:
Checkout: Hide navigation, focus on task
Dashboard: Show all navigation options
Onboarding: Progressive, limited options
Error recovery: Clear path forward, not full nav

RULE:
"Does consistency serve the user here?"
If no, break it intentionally.
Document why.

PREDICTABLE > CONSISTENT
Users should predict behavior
Not see identical interfaces everywhere
```

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Sharp Edges: UX Design

Critical mistakes that make products confusing, frustrating, or unusable.

---

## 1. The Assumption Trap

**Severity:** Critical
**Situation:** Building features based on assumptions instead of research
**Why Dangerous:** You'll build the wrong thing confidently.

```
THE TRAP:
"I know what users want"
"Our competitor does it this way"
"The stakeholder said users need this"
"It's obvious what they need"

THE REALITY:
- Users don't know what they want until they use it
- Competitors may also be wrong
- Stakeholders have biases
- "Obvious" is relative to your knowledge

VALIDATION METHODS:
1. User interviews (5-8 minimum)
   Ask about behavior, not preferences
   "Tell me about the last time you..."
   NOT: "Would you use feature X?"

2. Observation
   Watch actual usage
   Look for workarounds
   Note moments of confusion

3. Prototype testing
   Clickable mockup before code
   5 users finds 80% of issues
   Fail fast, fail cheap

4. Analytics review
   Where do users actually go?
   Where do they drop off?
   What paths do they take?

RESEARCH BEFORE EVERY MAJOR FEATURE
"We don't have time" = We have time to build the wrong thing
```

---

## 2. The Happy Path Only

**Severity:** Critical
**Situation:** Only designing for ideal scenarios, ignoring edge cases
**Why Dangerous:** Real users live in the edge cases.

```
THE HAPPY PATH:
User signs up → Completes profile → Uses product → Success!

REALITY:
- User has special characters in name
- User enters email wrong
- Session expires mid-form
- Network goes down
- User closes tab accidentally
- User doesn't have required info
- User changes mind midway
- User has accessibility needs
- User is on slow connection
- User speaks different language

EDGE CASES TO DESIGN FOR:
Empty states: No data yet
Error states: Something went wrong
Loading states: Data in transit
Partial states: Incomplete data
Offline states: No connection
Timeout states: Too slow
Permission states: Access denied
First-time states: New user
Returning states: Repeat visitor
Expert states: Power user
Stressed states: User under pressure

FOR EACH FLOW, ASK:
- What if they can't continue?
- What if they want to go back?
- What if they need help?
- What if something breaks?
- What if they have nothing yet?
```

---

## 3. The Feature Overload

**Severity:** High
**Situation:** Adding features without considering cognitive load
**Why Dangerous:** More features = more confusion = fewer completions.

```
THE TRAP:
V1: Simple, focused, works great
V2: Added "requested" features
V3: Added more "power user" features
V4: Nobody can find anything

SYMPTOMS:
- Long onboarding needed
- Users ask "where is X?"
- Support tickets increase
- Core metrics decline
- New users don't convert

THE FIX - PRIORITIZATION:
For each feature, ask:
1. How many users need this?
2. How often do they need it?
3. How critical is it when needed?

Feature Priority Matrix:
              │ Many Users │ Few Users
─────────────┼────────────┼───────────
Frequent Use │ CORE       │ CONSIDER
─────────────┼────────────┼───────────
Rare Use     │ ACCESSIBLE │ HIDE/CUT

CORE: Primary navigation, always visible
CONSIDER: Could be core, needs validation
ACCESSIBLE: Settings, menus, secondary nav
HIDE/CUT: Probably don't build

HICK'S LAW:
Time to decide increases with number of options
Fewer choices = faster decisions = better UX
```

---

## 4. The Jargon Jungle

**Severity:** High
**Situation:** Using internal terminology in user-facing interfaces
**Why Dangerous:** Users don't speak your language.

```
INTERNAL LANGUAGE THAT CONFUSES:
"Workspace" → What is it?
"Instance" → Technical term
"Sync" → Vague action
"Dashboard" → Too generic
"Module" → Developer speak
"Entity" → Abstract
"Tenant" → Architecture term

USER LANGUAGE:
"Your projects"
"Your copy"
"Save changes"
"Your stats"
"Your apps"
"Your items"
"Your account"

TESTING JARGON:
1. 5-second test
   Show screen for 5 seconds
   Ask: "What is this page for?"
   If confusion → jargon problem

2. First-click test
   "Where would you click to [task]?"
   Wrong clicks → unclear language

3. Card sorting
   What do users call things?
   Group features by user mental model

RULES:
- Use verbs for actions: "Save" not "Persist"
- Use nouns users know: "Messages" not "Communications"
- Describe outcomes: "Share with team" not "Set permissions"
- Test with 5 non-expert users
```

---

## 5. The Invisible Action

**Severity:** High
**Situation:** Important actions that users can't find
**Why Dangerous:** Users can't use features they can't find.

```
HIDING PATTERNS:
- Actions in hover-only menus
- Important settings buried deep
- CTAs that look like text
- Actions behind icons without labels
- Mobile features requiring gestures

DISCOVERY PROBLEMS:
User: "I didn't know I could do that"
User: "Where is the button for X?"
User: "I looked everywhere"
User: "I had to ask someone"

MAKING ACTIONS DISCOVERABLE:
1. Primary actions = always visible
   Save, Submit, Next, Add

2. Secondary actions = one click away
   Edit, Delete, Share, Settings

3. Tertiary actions = in menus
   Export, Advanced options, Rarely used

VISIBILITY HIERARCHY:
Most important → Prominent button
Important → Visible link/button
Useful → Discoverable in menu
Rare → Settings or help

TESTING DISCOVERABILITY:
First-click test:
"How would you [action]?"
Track where users click
>70% correct = discoverable
<50% correct = hidden
```

---

## 6. The Infinite Options

**Severity:** High
**Situation:** Presenting too many choices at once
**Why Dangerous:** Choice paralysis prevents action.

```
THE PROBLEM:
Pick your plan:
□ Starter ($9)
□ Basic ($19)
□ Standard ($29)
□ Professional ($49)
□ Business ($79)
□ Enterprise ($149)
□ Custom (Contact us)

User: *closes tab*

THE FIX:
Pick your plan:
□ Free (Try it out)
□ Pro - Most Popular ($29)
□ Team (Contact us)

RESEARCH SHOWS:
2-4 options: Users can evaluate
5-7 options: Decisions slow down
8+ options: Paralysis sets in

REDUCING OPTIONS:
1. Smart defaults
   Pre-select the best option for most
   "Recommended for you"

2. Progressive disclosure
   Show basics first
   "Show more options" for power users

3. Categorization
   Group similar options
   "Popular" vs "Advanced"

4. Recommendations
   "Most popular"
   "Best for teams"
   "Recommended based on your usage"

5. Elimination
   If <5% use an option, remove it
   Or hide it in "Advanced"
```

---

## 7. The Broken Flow

**Severity:** Critical
**Situation:** User flows that don't match user mental models
**Why Dangerous:** Users get lost, frustrated, and leave.

```
BROKEN FLOW EXAMPLE:
User wants to: Send money to friend
App requires:
1. Add friend as contact
2. Verify contact's identity
3. Set up payment method
4. Configure transfer settings
5. Initiate transfer
6. Confirm with SMS
7. Wait for approval
8. Get confirmation

User expectation:
1. Enter friend's email
2. Enter amount
3. Send

MENTAL MODEL MISMATCH:
You think: Security is paramount
User thinks: I just want to send $20

FLOW DESIGN PRINCIPLES:
1. Start with the goal, work backward
   What does user want to achieve?
   What's the minimum path?

2. Progressive complexity
   Easy path for simple cases
   Advanced options for edge cases

3. Forgiving format
   Accept input flexibly
   Don't reject valid variations

4. Clear progress
   Where am I in this process?
   How much is left?

5. Easy recovery
   Go back without losing progress
   Edit previous steps
   Save and continue later
```

---

## 8. The Feedback Void

**Severity:** High
**Situation:** No feedback when users take actions
**Why Dangerous:** Users don't know if actions worked.

```
THE VOID:
User clicks button
...nothing visible happens...
User clicks again
...still nothing...
User refreshes page
Data is duplicated

FEEDBACK REQUIREMENTS:
Every action needs visible feedback within:
0-100ms: Visual acknowledgment (button press)
100ms-1s: Progress indicator
1-10s: Clear loading state with progress
10s+: Background processing with notification

FEEDBACK TYPES:
Immediate:
- Button state change
- Cursor change
- Ripple/click effect

Progress:
- Spinner
- Progress bar
- Skeleton screens
- Optimistic UI

Completion:
- Success message
- Confirmation screen
- Toast notification
- State change visible

Error:
- Clear error message
- What went wrong
- How to fix it
- Option to retry

IMPLEMENTATION PATTERN:
onClick = async () => {
  setLoading(true)      // Immediate feedback
  try {
    await action()
    showSuccess()       // Completion feedback
  } catch (e) {
    showError(e)        // Error feedback
  } finally {
    setLoading(false)
  }
}
```

---

## 9. The Forced Registration

**Severity:** High
**Situation:** Requiring account creation before value is shown
**Why Dangerous:** Users leave before seeing why they should sign up.

```
THE WALL:
User lands on page
"Create an account to continue"
[Sign up with email]
[Sign up with Google]

User has no idea what they're signing up for.

BETTER PATTERN:
1. Show value first
   Let users explore, try, experience

2. Prompt at value moment
   "Save your progress" → Sign up
   "Share with team" → Sign up
   "Unlock feature" → Sign up

3. Progressive registration
   Start as guest
   Convert when necessary
   Preserve their work

EXAMPLES:
Duolingo: Complete first lesson → then sign up
Canva: Create design → sign up to save
Spotify: Listen to music → sign up for features
Notion: Use templates → sign up to save

VALUE FIRST FLOW:
Landing → Try product → Experience value →
Natural prompt → Easy signup → Continue

VS WALL FLOW:
Landing → Signup wall → 80% bounce

DATA:
Removing forced registration can increase
conversion 20-50% because users who sign up
actually want to, having seen the value
```

---

## 10. The Form From Hell

**Severity:** High
**Situation:** Long, complex forms that overwhelm users
**Why Dangerous:** Every field is a chance to drop off.

```
THE HELL FORM:
Name:           [_______________]
Email:          [_______________]
Phone:          [_______________]
Address Line 1: [_______________]
Address Line 2: [_______________]
City:           [_______________]
State:          [dropdown with 50 options]
ZIP:            [_______________]
Country:        [dropdown with 195 options]
Password:       [_______________]
Confirm:        [_______________]
Birthday:       [_______________]
Gender:         [_______________]
Occupation:     [_______________]
Company:        [_______________]
How heard:      [_______________]
[Terms checkbox wall of text]
[Submit]

DROP-OFF RATE: 70%+

THE FIX:
1. Minimum viable fields
   Only ask what's essential
   Ask the rest later, or never

2. Progressive profiling
   Get email first
   Ask more over time
   "Complete your profile" later

3. Smart defaults
   Auto-detect country
   Auto-complete address
   Social sign-in

4. Multi-step with progress
   Step 1 of 3: Basic info
   Step 2 of 3: Preferences
   Step 3 of 3: Confirm

5. Inline validation
   Validate as they go
   Green checkmark on valid
   Error before submit

EVERY FIELD REMOVED:
+5-10% completion rate
```

---

## 11. The Dead End

**Severity:** High
**Situation:** Flows that end without clear next steps
**Why Dangerous:** Users don't know what to do next.

```
DEAD ENDS:
Error page: "Something went wrong" [blank]
Empty state: [blank page with no guidance]
Success: "Done!" [nothing else]
404: "Page not found" [go home only]
Confirmation: "Thank you" [end]

EVERY END NEEDS:
1. What happened (status)
2. What to do next (action)
3. Alternative paths (options)

FIXING DEAD ENDS:

Error page:
"Something went wrong"
→ "We couldn't load your data."
→ [Try again] [Go to dashboard] [Contact support]

Empty state:
[blank]
→ "No projects yet"
→ "Create your first project to get started"
→ [Create project] [Import existing]

Success:
"Done!"
→ "Your order is confirmed!"
→ "Confirmation email sent to you@email.com"
→ [View order] [Continue shopping] [Track delivery]

404:
"Page not found"
→ "We couldn't find that page"
→ "Try searching or browse popular pages:"
→ [Search] [Home] [Products] [Help]

RULE:
No screen should be a dead end.
Always provide at least one forward path.
```

---

## 12. The Permission Ambush

**Severity:** High
**Situation:** Asking for permissions without context
**Why Dangerous:** Users deny permissions they'd otherwise grant.

```
THE AMBUSH:
App loads
"Allow notifications?" [Allow] [Don't Allow]
"Allow location?" [Allow] [Don't Allow]
"Allow camera?" [Allow] [Don't Allow]

User: Denies all (defensive)

THE FIX - CONTEXTUAL PERMISSION:
1. Wait until the feature is used
   User taps "Take Photo" → camera permission
   User taps "Find nearby" → location permission

2. Explain the benefit first
   "Enable notifications to get updates on your order"
   Not: "Enable notifications"

3. Pre-permission education
   "To scan documents, we need camera access"
   [Enable Camera] [Not now]

4. Graceful degradation
   If denied, work without it
   Offer alternative methods
   "You can also enter the code manually"

PERMISSION FLOW:
User initiates action →
Explain why permission needed →
System permission prompt →
If denied → offer alternative →
If granted → continue with feature

STAT:
Contextual permission requests
have 2-3x higher grant rates
```

## Decision Framework

# Decisions: UX Design

Critical decision points that determine user experience success.

---

## Decision 1: Research Method Selection

**Context:** Choosing how to learn about users for a specific question.

**Options:**

| Method | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **User Interviews** | Deep insights, context, "why" | Time-intensive, small sample | Understanding motivations, new problems |
| **Usability Testing** | Observes real behavior | Lab vs. reality gap | Validating designs, finding issues |
| **Surveys** | Large sample, quantifiable | Surface-level, bias-prone | Measuring attitudes, demographics |
| **Analytics** | Real behavior, scale | No "why," what happened only | Understanding patterns, funnel analysis |
| **A/B Testing** | Causal, production real | Needs traffic, narrow scope | Optimizing specific elements |

**Framework:**
```
Research method selection:

What do you need to learn?
├── Why users do something → Interviews
├── If users can do something → Usability testing
├── How many users do something → Analytics
├── What users prefer → Survey or A/B test
└── What performs better → A/B test

Stage of product:
├── Concept (does problem exist?) → Interviews
├── Design (does solution work?) → Usability testing
├── Live (is it working?) → Analytics + A/B
└── Ongoing (what's changing?) → All methods

Available resources:
├── Time: Days → Analytics, surveys
├── Time: Weeks → Interviews, usability
├── Budget: Low → Guerrilla testing, surveys
├── Budget: High → Formal studies, recruiting

SAMPLE SIZES:
Usability testing: 5 users (finds 80% issues)
Interviews: 5-8 users (patterns emerge)
Surveys: 100+ for statistical significance
A/B tests: Depends on effect size, calculate power

RESEARCH COMBINATION:
Best insights = quant + qual together
Analytics: Shows what's happening
Interviews: Explains why it's happening
```

**Default Recommendation:** Start with 5 user interviews for new problems, usability testing for existing designs. Add analytics for ongoing measurement. Surveys only for large-scale questions.

---

## Decision 2: Information Architecture Approach

**Context:** Structuring content and navigation for a product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Task-based** | Maps to user goals | May split related content | Productivity apps, tools |
| **Topic-based** | Logical groupings | May not match user goals | Content-heavy sites |
| **Audience-based** | Personalized experience | Duplicate content possible | Multiple distinct personas |
| **Hybrid** | Flexible, covers bases | More complex | Large products, multiple contexts |

**Framework:**
```
Information architecture decision:

Primary user goal?
├── Complete tasks → Task-based
├── Learn/explore → Topic-based
├── Different user types → Audience-based
└── Mixed goals → Hybrid

Content type?
├── Actions/tools → Task-based
├── Information/articles → Topic-based
├── Products/services → Varies by audience
└── Mixed → Hybrid

TASK-BASED STRUCTURE:
Navigation reflects what users do:
├── Create project
├── Invite team
├── Track progress
└── Generate reports

TOPIC-BASED STRUCTURE:
Navigation reflects content categories:
├── Projects
├── Team
├── Analytics
└── Settings

AUDIENCE-BASED STRUCTURE:
Navigation by user type:
├── For Developers
├── For Designers
├── For Managers
└── Enterprise

VALIDATION METHODS:
1. Card sorting (open)
   Give users content cards
   Ask them to group
   Learn their mental model

2. Card sorting (closed)
   Give users cards + categories
   Ask them to place
   Validate your model

3. Tree testing
   Text-only navigation
   "Where would you find X?"
   Validates hierarchy without design bias
```

**Default Recommendation:** Start task-based for products, topic-based for content sites. Validate with card sorting before committing. Hybrid when product matures.

---

## Decision 3: Navigation Pattern

**Context:** Choosing the primary navigation structure.

**Options:**

| Pattern | Pros | Cons | Choose When |
|---------|------|------|-------------|
| **Top nav** | Standard, visible, scan-friendly | Limited items, takes vertical space | Marketing sites, simple apps |
| **Side nav** | Many items, persistent | Uses horizontal space, mobile challenge | Complex apps, dashboards |
| **Bottom nav (mobile)** | Thumb-friendly, visible | Limited to 5 items | Mobile-first apps |
| **Hamburger menu** | Saves space | Hidden, poor discovery | Secondary nav, space-constrained |
| **Tab bar** | Clear sections, easy switching | Limited items | Single-purpose apps |

**Framework:**
```
Navigation pattern decision:

Platform priority?
├── Desktop-first → Top nav or side nav
├── Mobile-first → Bottom nav or tabs
└── Both equally → Adaptive (different per device)

Number of primary destinations?
├── 2-5 items → Top nav, tabs, bottom nav
├── 5-10 items → Side nav, mega menu
├── 10+ items → Side nav with grouping

User behavior?
├── Frequent section switching → Visible nav always
├── Deep work in one section → Collapsible nav
├── Browsing/exploring → Sticky visible nav

MOBILE CONSIDERATIONS:
Top of screen: Hard to reach (one-handed)
Bottom of screen: Easy thumb access
Hamburger: 3-click tax, poor discovery
Gesture navigation: Hidden, conflicts with OS

RESPONSIVE PATTERNS:
Desktop: Side nav (expanded)
Tablet: Side nav (collapsed) or top nav
Mobile: Bottom nav or hamburger

NAVIGATION TESTING:
- First-click test: Do users click right?
- Time to find: How long to reach sections?
- Navigation confidence: Do users feel oriented?
```

**Default Recommendation:** Top nav for marketing/simple sites, side nav for complex web apps, bottom nav for mobile apps. Always test with real users.

---

## Decision 4: Onboarding Strategy

**Context:** Designing the new user experience.

**Options:**

| Strategy | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **No onboarding** | Immediate value, no barrier | Users may be lost | Simple, self-explanatory products |
| **Guided tour** | Teaches features, low effort | Can be skippable/ignored | Complex products, many features |
| **Progressive disclosure** | Learn by doing, contextual | May miss features | Moderate complexity |
| **Checklist** | Clear goals, flexible pace | Can feel like homework | Products needing setup |
| **Interactive tutorial** | Hands-on learning | Longer time to value | Complex workflows |

**Framework:**
```
Onboarding strategy selection:

Product complexity?
├── Simple → No onboarding or minimal tooltips
├── Moderate → Progressive disclosure
├── Complex → Guided tour or tutorial
└── Very complex → Combination approach

Setup requirements?
├── None needed → Skip straight to value
├── Some setup → Minimum viable, then just-in-time
└── Significant setup → Checklist with progress

User motivation?
├── High (paid, committed) → Can handle longer onboarding
├── Low (free, exploring) → Minimal friction, show value fast
└── Mixed → Optional depth

ONBOARDING PRINCIPLES:
1. Value before work
   Show outcome → teach input
   "Here's what you can do"

2. Minimum viable onboarding
   Only absolute requirements upfront
   Everything else later

3. Contextual learning
   Teach when relevant
   Not everything at once

4. Progress indication
   "Step 2 of 3"
   Completion motivation

5. Easy skip/revisit
   Don't trap users
   Help always available

METRICS:
Time to first value
Onboarding completion rate
Feature discovery rate
7-day retention by onboarding path
```

**Default Recommendation:** Progressive disclosure with minimum upfront requirements. Add checklist for setup-heavy products. Always measure time to first value.

---

## Decision 5: Error Handling Approach

**Context:** Designing how the system communicates and recovers from errors.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Prevent errors** | Best UX, no recovery needed | Not always possible | High-stakes, predictable inputs |
| **Inline validation** | Immediate feedback | Can be noisy | Form inputs, known formats |
| **Error messages** | Clear communication | Reactive, not proactive | After-the-fact errors |
| **Error recovery** | Keeps users moving | May mask underlying issues | Common, recoverable errors |
| **Fallback/degradation** | Something works | May confuse expectations | System-level failures |

**Framework:**
```
Error handling decision:

Can error be prevented?
├── Yes (constraints, validation) → Prevent it
├── Partially → Prevent + handle remainder
└── No (system failure, network) → Handle gracefully

Error type?
├── User input error → Inline validation + help
├── System error → Clear message + recovery
├── Network error → Retry + offline support
├── Authentication → Clear path to fix

Error severity?
├── Critical (data loss) → Block + confirm + help
├── Recoverable → Message + action
├── Informational → Toast/subtle alert
└── Silent → Log, don't show user

ERROR MESSAGE ANATOMY:
1. What happened (clear, non-technical)
2. Why it happened (if helpful)
3. How to fix it (specific action)
4. Alternative paths (if fix not possible)

EXAMPLES:
Bad: "Error 500"
Good: "We couldn't save your changes. Check your
      connection and try again. [Retry] [Save locally]"

Bad: "Invalid input"
Good: "Please enter a valid email address.
      Example: name@company.com"

PREVENTION METHODS:
- Constraints (dropdowns vs. free text)
- Smart defaults (pre-fill known values)
- Real-time validation (before submit)
- Confirmation for destructive actions
- Undo instead of confirm
```

**Default Recommendation:** Prevent errors first (constraints, defaults). Inline validation for user input. Clear error messages with specific recovery actions. Always test error states.

---

## Decision 6: Mobile Design Strategy

**Context:** Deciding how to approach mobile design relative to desktop.

**Options:**

| Strategy | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Mobile-first** | Forces prioritization, clean | Desktop may feel sparse | Mobile is primary platform |
| **Desktop-first** | Familiar workflow | Mobile often afterthought | Desktop is primary platform |
| **Responsive** | One codebase, adapts | Compromise in both contexts | Similar experiences needed |
| **Separate apps** | Optimized per platform | Expensive, maintenance burden | Very different needs per platform |

**Framework:**
```
Mobile strategy decision:

Where do users access?
├── Primarily mobile → Mobile-first
├── Primarily desktop → Desktop-first
├── Mixed → Responsive with breakpoints
└── Very different contexts → Consider separate

Nature of tasks?
├── Quick actions → Mobile-optimized essential
├── Complex workflows → Desktop may be required
├── Content consumption → Responsive works well
└── Creation/editing → Desktop-first often better

MOBILE-FIRST PRINCIPLES:
1. Start with mobile constraints
2. Add complexity for larger screens
3. Touch-first interactions
4. Performance priority

RESPONSIVE BREAKPOINTS:
320px: Minimum mobile
375px: Common phones
768px: Tablets
1024px: Small desktop
1280px: Desktop
1536px: Large desktop

MOBILE CONSIDERATIONS:
- Touch targets: 44x44px minimum
- Thumb zone: Bottom of screen preferred
- Connection: Handle slow/offline
- Context: Users may be distracted
- Screen time: Quick interactions

RESPONSIVE PATTERNS:
Navigation: Top → hamburger on mobile
Layout: Multi-column → single column
Tables: → Cards or horizontal scroll
Forms: → Full width, larger inputs
Touch: → Larger tap targets
```

**Default Recommendation:** Mobile-first for consumer products, desktop-first for complex B2B tools. Always design both, not just scale one down.

---

## Decision 7: Accessibility Level

**Context:** Choosing how thoroughly to implement accessibility.

**Options:**

| Level | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **WCAG A** | Basic access, legal minimum | Excludes many users | Minimum legal requirement |
| **WCAG AA** | Most users included | Some investment needed | Standard for most products |
| **WCAG AAA** | Maximum inclusion | Significant effort | Government, education, healthcare |
| **Beyond WCAG** | Exceptional experience | Custom work required | When a11y is competitive advantage |

**Framework:**
```
Accessibility level decision:

Legal requirements?
├── Government/education → AA minimum, often AAA
├── Healthcare → AA minimum
├── Finance → AA minimum
├── Consumer → AA strongly recommended
└── B2B → AA recommended

User base?
├── General public → AA minimum
├── Known demographics → Tailor to needs
├── Older users → Consider AAA
└── High-stakes decisions → Higher standards

WCAG LEVELS:
Level A (minimum):
- Alt text for images
- Keyboard navigation
- Form labels
- Page titles

Level AA (standard):
- Color contrast (4.5:1 text)
- Resize to 200% without loss
- Skip navigation links
- Error identification

Level AAA (enhanced):
- Higher contrast (7:1)
- Sign language for video
- Extended audio description
- Reading level guidance

QUICK WINS (do immediately):
□ Semantic HTML (headings, lists, landmarks)
□ Alt text on images
□ Form labels (not just placeholders)
□ Focus indicators visible
□ Color contrast checked
□ Keyboard navigation works

TESTING:
- Automated: axe, Lighthouse, WAVE
- Manual: Keyboard navigation test
- Screen reader: VoiceOver, NVDA
- User testing: Include disabled users
```

**Default Recommendation:** WCAG AA as baseline for all products. Test with automated tools + keyboard navigation. Include users with disabilities in research when possible.

---

## Decision 8: Feedback and Notification Strategy

**Context:** Deciding how to communicate with users proactively.

**Options:**

| Channel | Pros | Cons | Choose When |
|---------|------|------|-------------|
| **In-app toast** | Contextual, non-intrusive | Missed if not in app | UI feedback, confirmations |
| **In-app badge** | Persistent, draws attention | Can be noisy | Actionable items awaiting |
| **Push notification** | Reaches outside app | Can be annoying, opt-out | Time-sensitive, important |
| **Email** | Permanent record, reaches all | Slow, inbox competition | Not time-sensitive, formal |
| **SMS** | High open rate, urgent | Very intrusive, costly | Critical, time-sensitive |

**Framework:**
```
Notification strategy:

Urgency?
├── Immediate action needed → Push/SMS
├── Soon but not urgent → Push or badge
├── Eventually → Email or badge
└── Nice to know → In-app only

User expectation?
├── Requested (alerts they set up) → Push/email
├── System-generated → In-app first
├── Marketing → Email only, opt-in

NOTIFICATION HIERARCHY:
1. Critical: Security, money, status change
   → All channels, immediate

2. Important: Messages, deadlines
   → Push + badge + email

3. Useful: Updates, activity
   → Badge + optional push

4. Nice: Tips, suggestions
   → In-app only

NOTIFICATION PRINCIPLES:
- Default conservative (opt-in for most)
- Granular controls (by type)
- Easy unsubscribe
- Respect quiet hours
- Batch non-urgent

ANTI-PATTERNS TO AVOID:
✗ Push for marketing without consent
✗ Irreversible notification settings
✗ No way to mute temporarily
✗ Same priority for all notifications
✗ Notifications that don't deep-link

NOTIFICATION CONTENT:
- Clear, specific subject
- Actionable when possible
- Links to right place
- Easy to dismiss/act
```

**Default Recommendation:** In-app for UI feedback, push for time-sensitive and user-configured, email for records and non-urgent. Always provide granular controls.

---

## Decision 9: Empty State Design

**Context:** Deciding what to show when there's no content.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Educational** | Teaches users what to do | May feel like homework | New users, complex features |
| **Motivational** | Encourages action | Can feel pushy | Creating content, goals |
| **Template/starter** | Quick start, shows value | May not match needs | Creative tools, documents |
| **Minimal** | Clean, not overwhelming | No guidance | Power users, simple actions |

**Framework:**
```
Empty state decision:

User context?
├── First time ever → Educational + motivational
├── Returning, empty section → Lighter guidance
├── Cleared/deleted content → Minimal + undo
└── No results (search) → Helpful alternatives

Feature complexity?
├── Simple (add button obvious) → Minimal
├── Moderate → Light guidance
├── Complex → Tutorial or templates
└── Creative → Templates + examples

EMPTY STATE COMPONENTS:
1. Visual (optional)
   - Illustration or icon
   - Relevant to context
   - Not too large

2. Message
   - What this space is for
   - Why it's empty
   - Encouraging tone

3. Action
   - Primary CTA to fill it
   - Alternative paths if relevant

4. Help (optional)
   - Link to documentation
   - Example content

EXAMPLES:

New user, projects:
[Illustration]
"No projects yet"
"Projects help you organize your work"
[Create your first project] [Import from other tool]

Search, no results:
"No results for 'xyz'"
"Try different keywords or browse categories"
[Clear search] [Browse all]

Cleared content:
"All done!"
[Task completed illustration]
"Nice work clearing your inbox"
[Archive] [View completed]
```

**Default Recommendation:** Educational for first-time empty states, minimal for returning users. Always include a clear primary action. Test that users understand what to do.

---

## Decision 10: User Testing Frequency

**Context:** Deciding how often to test designs with users.

**Options:**

| Frequency | Pros | Cons | Choose When |
|-----------|------|------|-------------|
| **Per feature** | Validates each before dev | Time/resource intensive | High-risk features |
| **Per sprint** | Regular cadence | May not align with design work | Agile teams |
| **Weekly standing** | Continuous learning | Overhead of recruiting | Mature product, dedicated researcher |
| **As needed** | Flexible, resource-efficient | May skip important tests | Resource-constrained teams |

**Framework:**
```
Testing frequency decision:

Resources available?
├── Dedicated researcher → Weekly standing
├── Designer does testing → Per sprint or feature
├── Limited time → As needed, prioritized
└── No resources → Guerrilla testing

Risk level?
├── High stakes (money, health) → Every change
├── Core flows → Per feature minimum
├── Edge features → Per sprint or less
└── Minor changes → As needed

TESTING APPROACHES BY RESOURCE:

Full resources (researcher):
- Weekly usability sessions
- Continuous recruitment
- Mix of moderated/unmoderated
- Regular synthesis and share-out

Limited resources (designer tests):
- Test major features before dev
- Guerrilla testing for quick checks
- Unmoderated tools (Maze, UserTesting)
- Share recordings with team

Minimal resources:
- Test core flows quarterly
- Hallway testing (grab anyone)
- Internal testing with fresh eyes
- Customer support feedback review

WHAT TO ALWAYS TEST:
□ New user onboarding
□ Core conversion flows
□ Major feature redesigns
□ Confusing existing flows (from analytics)
□ High-risk features

WHAT CAN SKIP TESTING:
- Minor copy changes
- Bug fixes
- Internal tools
- Exact replicas of proven patterns
```

**Default Recommendation:** Test every major feature before development, with lightweight testing (5 users) being sufficient for most usability questions. Establish regular rhythm over sporadic testing.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `visual|colors|typography|polish` | ui-design | UX needs visual execution |
| `implement|code|build|develop` | frontend | UX needs implementation |
| `metrics|data|analytics|measure` | analytics-architecture | UX needs measurement |
| `product|roadmap|prioritize|features` | product-strategy | UX needs product alignment |

### Receives Work From

- **product-strategy**: Product needs user experience design
- **ui-design**: Visual design needs UX validation
- **analytics-architecture**: Data reveals UX issues
- **founder-operating-system**: Product needs user-centered design

### Works Well With

- ui-design
- product-management
- analytics
- frontend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/design/ux-design/`

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
