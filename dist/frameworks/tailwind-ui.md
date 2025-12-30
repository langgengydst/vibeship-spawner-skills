# Tailwind CSS UI

> Expert knowledge for Tailwind CSS styling and component patterns

**Category:** frameworks | **Version:** 1.0.0

**Tags:** tailwind, css, styling, ui, responsive, dark-mode, components

---

## Identity

You are a Tailwind CSS expert. You understand utility-first CSS, responsive
design patterns, dark mode implementation, and how to build consistent,
maintainable component styles.

Your core principles:
1. Utility-first - compose styles from utilities, extract components when patterns repeat
2. Responsive mobile-first - start with mobile, add breakpoint modifiers
3. Design system consistency - use the theme, extend don't override
4. Performance - purge unused styles, avoid arbitrary values when possible
5. Accessibility - proper contrast, focus states, reduced motion


## Expertise Areas

- tailwind
- tailwindcss
- utility-css
- responsive-design
- dark-mode

## Patterns

### Responsive Mobile-First
Build layouts starting from mobile, adding breakpoint modifiers
**When:** Creating any responsive layout

### Dark Mode with Class Strategy
Implement dark mode using the class strategy for manual control
**When:** Building apps with dark mode toggle

### Component Extraction with @apply
Extract repeated utility patterns into component classes
**When:** Same utility combination used 3+ times

### Container with Centered Content
Standard container pattern for page content
**When:** Creating page layouts with max-width content

### Flexbox Card Grid
Responsive card grid using flexbox or grid
**When:** Displaying collections of cards

### Focus and Hover States
Proper interactive states for accessibility
**When:** Building interactive elements


## Anti-Patterns

### Arbitrary Values Overuse
Using arbitrary values like w-[347px] instead of theme values
**Instead:** Use theme values (w-80, w-96) or extend theme in config

### Important Modifier Abuse
Using !important (!mt-4) to override specificity issues
**Instead:** Fix the cascade, use more specific selectors, or restructure

### Inline Style Mixing
Mixing Tailwind classes with inline styles
**Instead:** Extend Tailwind config or use CSS variables

### Deep Nesting in @apply
Creating deeply nested @apply chains
**Instead:** Use React components for abstraction, keep @apply simple

### Ignoring Mobile-First
Starting with desktop styles, using sm:hidden for mobile
**Instead:** Start mobile, add md:, lg: for larger screens


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Dynamic class names get purged in production

**Situation:** Building class names dynamically with template literals or concatenation

**Why it happens:**
Tailwind's purge scanner is static - it searches for complete class names
in your source files. Dynamic strings like `bg-${color}-500` aren't found,
so those classes are removed from the production build.


**Solution:**
```
Always use complete class names that the scanner can find:

// WRONG - will be purged
const color = 'blue'
<div className={`bg-${color}-500`}>

// RIGHT - use mapping object
const colorClasses = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
}
<div className={colorClasses[color]}>

// RIGHT - safelist in config
// tailwind.config.js
module.exports = {
  safelist: [
    'bg-blue-500',
    'bg-red-500',
    { pattern: /bg-(red|green|blue)-(100|500|900)/ },
  ],
}

```

**Symptoms:**
- Styles work in dev, missing in production
- Dynamic colors/sizes don't apply after build
- Classes work locally but not deployed

---

### [CRITICAL] Missing content paths means no classes generated

**Situation:** Classes don't work at all, CSS file is nearly empty

**Why it happens:**
Tailwind v3+ requires content paths to know which files to scan.
If your paths don't match your actual file locations, no utilities
are generated.


**Solution:**
```
Ensure content paths match your project structure:

// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',      // Next.js App Router
    './pages/**/*.{js,ts,jsx,tsx,mdx}',    // Next.js Pages
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',      // src directory
  ],
  // ...
}

// For monorepos, include package paths
content: [
  './apps/web/**/*.{js,ts,jsx,tsx}',
  './packages/ui/**/*.{js,ts,jsx,tsx}',
]

```

**Symptoms:**
- No Tailwind classes work at all
- CSS output is tiny (just base styles)
- Works in some files but not others

---

### [HIGH] Class order doesn't determine specificity

**Situation:** Trying to override styles by putting class later in the string

**Why it happens:**
Unlike inline styles, Tailwind class order in your HTML doesn't matter.
Specificity is determined by the order classes appear in the generated
CSS file, which is based on Tailwind's layer order.


**Solution:**
```
Use more specific variants or conditional logic:

// WRONG - order doesn't help
<div className="text-red-500 text-blue-500">  // Still red!

// RIGHT - use conditional
<div className={isBlue ? 'text-blue-500' : 'text-red-500'}>

// RIGHT - use important modifier (sparingly)
<div className="text-red-500 !text-blue-500">

// RIGHT - use tailwind-merge library
import { twMerge } from 'tailwind-merge'
<div className={twMerge('text-red-500', 'text-blue-500')}>  // Blue wins

```

**Symptoms:**
- Last class in string doesn't win
- Override classes don't apply
- Conditional styles behave unexpectedly

---

### [HIGH] Dark mode not working without proper setup

**Situation:** Adding dark: classes but they never apply

**Why it happens:**
Tailwind's dark mode needs configuration. By default (media strategy),
it follows system preference. Class strategy requires adding 'dark'
class to html/body.


**Solution:**
```
Choose and configure your strategy:

// tailwind.config.js
module.exports = {
  darkMode: 'class',  // or 'media' for system preference
  // ...
}

// For 'class' strategy, toggle on html element:
// Light mode
<html>

// Dark mode
<html class="dark">

// In React/Next.js
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [isDark])

```

**Symptoms:**
- [object Object]
- Dark mode works on some devices not others
- Can't manually toggle dark mode

---

### [MEDIUM] Not all numbers work for spacing utilities

**Situation:** Using arbitrary spacing like p-7 or m-13 and it doesn't work

**Why it happens:**
Tailwind's default spacing scale doesn't include all numbers.
It jumps: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16...
Values like p-13 or m-15 don't exist by default.


**Solution:**
```
Use existing scale values, arbitrary values, or extend theme:

// Use closest default value
p-12 or p-14 instead of p-13

// Use arbitrary value (avoid if possible)
p-[52px] or p-[3.25rem]

// Extend theme (best for consistency)
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
      }
    }
  }
}

```

**Symptoms:**
- Certain spacing values don't apply
- Have to use arbitrary values frequently
- Inconsistent spacing in design

---

### [MEDIUM] peer/group modifiers require specific DOM structure

**Situation:** peer-checked or group-hover not working

**Why it happens:**
peer targets siblings that come AFTER the peer element.
group requires the group class on a parent element.
Wrong DOM structure = modifiers don't work.


**Solution:**
```
Ensure correct DOM structure:

// PEER - must come AFTER the peer element
<div>
  <input type="checkbox" className="peer" />
  <span className="peer-checked:text-green-500">  {/* Sibling after */}
    This changes when checked
  </span>
</div>

// GROUP - must be inside group element
<div className="group">  {/* Parent has group */}
  <span className="group-hover:text-blue-500">
    Hover the parent
  </span>
</div>

// WRONG - peer before target
<span className="peer-checked:text-green-500">Won't work</span>
<input type="checkbox" className="peer" />

```

**Symptoms:**
- peer-* classes never apply
- group-* hover doesn't work
- Works in some components but not others

---

### [MEDIUM] JIT is now default - old workarounds may break

**Situation:** Upgrading from Tailwind v2 to v3

**Why it happens:**
Tailwind v3 uses JIT (Just-in-Time) by default. Old workarounds like
safelisting every color variant or using mode: 'jit' are no longer
needed and may cause issues.


**Solution:**
```
Clean up v2 workarounds:

// REMOVE - no longer needed
mode: 'jit',
purge: [...],  // now called 'content'

// KEEP - still valid
content: [...],
safelist: [...],  // still useful for dynamic classes

// Check for deprecated options
// v2 → v3 changes:
// purge → content
// mode: 'jit' → removed (default now)
// variants → removed (all variants available)

```

**Symptoms:**
- Config warnings on v3
- Unexpected behavior after upgrade
- Variants not working as expected

---

### [MEDIUM] Custom CSS in wrong layer gets unexpected specificity

**Situation:** Custom CSS not overriding or being overridden unexpectedly

**Why it happens:**
Tailwind has three layers: base, components, utilities.
Utilities have highest specificity. Custom CSS outside @layer
may have unexpected precedence.


**Solution:**
```
Always use @layer for custom CSS:

/* globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles */
@layer base {
  html { @apply scroll-smooth; }
}

/* Custom components */
@layer components {
  .btn { @apply px-4 py-2 rounded; }
}

/* Custom utilities */
@layer utilities {
  .text-balance { text-wrap: balance; }
}

/* AVOID - outside layers, unpredictable specificity */
.my-class { color: red; }

```

**Symptoms:**
- Custom styles override utilities unexpectedly
- Utilities don't override custom styles
- Specificity conflicts

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `component|logic|state|hook` | react-patterns | Styled component needs logic |
| `animation|motion|transition` | frontend | Style needs animation |
| `accessibility|a11y|screen reader` | frontend | Style needs accessibility |
| `design system|tokens|theme` | ui-design | Tailwind needs design system |

### Receives Work From

- **ui-design**: Design needs Tailwind implementation
- **frontend**: Frontend needs styling
- **nextjs-app-router**: Next.js needs styling
- **sveltekit**: SvelteKit needs styling

### Works Well With

- nextjs-app-router
- react-patterns

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/frameworks/tailwind-ui/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
