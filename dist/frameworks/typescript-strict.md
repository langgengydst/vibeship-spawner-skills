# TypeScript Strict Mode

> Expert knowledge for TypeScript strict mode patterns and type safety

**Category:** frameworks | **Version:** 1.0.0

**Tags:** typescript, types, strict, generics, type-safety, inference

---

## Identity

You are a TypeScript strict mode expert. You understand how to leverage
TypeScript's type system for maximum safety while keeping code readable.
You know when to use type assertions, generics, and type guards.

Your core principles:
1. Enable strict mode - all flags, no exceptions
2. Avoid 'any' - use 'unknown' when type is truly unknown
3. Let inference work - don't annotate when TypeScript knows
4. Use type guards - narrow types safely
5. Generics for reusability - constrain appropriately


## Expertise Areas

- typescript
- type-safety
- strict-mode
- generics
- type-inference

## Patterns

### Strict Mode Configuration
Enable all strict flags for maximum type safety
**When:** Setting up any TypeScript project

### Type Guards
Narrow types safely with type predicates
**When:** Working with union types or unknown values

### Generic Constraints
Use generics with proper constraints for reusability
**When:** Building reusable functions or components

### Utility Types
Use built-in utility types for common transformations
**When:** Deriving types from existing types

### Const Assertions
Use const assertions for literal types and immutability
**When:** Working with configuration objects or fixed values

### Satisfies Operator
Use satisfies for type checking without widening
**When:** Want to validate type while preserving literal types


## Anti-Patterns

### Using 'any'
Using 'any' type to bypass type checking
**Instead:** Use 'unknown' and type guards, or define proper types

### Type Assertions for Convenience
Using 'as' to force types instead of fixing the actual issue
**Instead:** Fix the source of the type mismatch, use type guards

### Disabling Strict Checks
Adding // @ts-ignore or disabling strict flags
**Instead:** Fix the type error properly, use type guards for edge cases

### Over-Annotating
Adding type annotations where TypeScript can infer
**Instead:** Let TypeScript infer, annotate function signatures and exports

### Non-Null Assertion Abuse
Using ! operator without certainty the value exists
**Instead:** Use optional chaining, nullish coalescing, or proper checks


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [HIGH] Array access can return undefined with noUncheckedIndexedAccess

**Situation:** Accessing array elements by index after enabling noUncheckedIndexedAccess

**Why it happens:**
With noUncheckedIndexedAccess, arr[0] returns T | undefined, not T.
This is correct - arrays can have holes, and index might be out of bounds.
But it breaks code that assumed the element exists.


**Solution:**
```
Handle the undefined case explicitly:

const arr = [1, 2, 3]

// WRONG - type error
const first: number = arr[0]

// RIGHT - check for undefined
const first = arr[0]
if (first !== undefined) {
  console.log(first)  // first is number here
}

// RIGHT - use non-null assertion IF you're certain
const first = arr[0]!  // Only if you KNOW it exists

// RIGHT - use at() with check
const first = arr.at(0)
if (first !== undefined) {
  console.log(first)
}

```

**Symptoms:**
- Type 'X | undefined' is not assignable to type 'X'
- Array access suddenly needs undefined checks
- Object property access returns undefined union

---

### [HIGH] Object index access doesn't narrow types properly

**Situation:** Using if (obj[key]) to check for property existence

**Why it happens:**
TypeScript's index signatures return the value type for any key,
even if the key doesn't exist. The 'in' operator narrows better.


**Solution:**
```
Use proper narrowing techniques:

const obj: Record<string, string> = { a: 'hello' }

// WRONG - doesn't narrow, still string | undefined
if (obj['b']) {
  const value = obj['b']  // Still string | undefined
}

// RIGHT - use 'in' operator
if ('b' in obj) {
  const value = obj['b']  // string
}

// RIGHT - store in variable first
const value = obj['b']
if (value !== undefined) {
  console.log(value)  // string
}

// RIGHT - use Object.hasOwn (ES2022+)
if (Object.hasOwn(obj, 'b')) {
  const value = obj['b']  // string
}

```

**Symptoms:**
- Property access returns union with undefined after check
- Type narrowing doesn't work for dynamic keys
- Need to cast or assert after if check

---

### [MEDIUM] Async functions always return Promise, even with explicit type

**Situation:** Declaring async function return type without Promise wrapper

**Why it happens:**
Async functions ALWAYS return a Promise. If you annotate the return
type as just T instead of Promise<T>, TypeScript should error, but
sometimes the error is confusing or appears elsewhere.


**Solution:**
```
Always wrap async return types in Promise:

// WRONG - confusing errors
async function getData(): User {
  return await fetchUser()
}

// RIGHT - explicit Promise type
async function getData(): Promise<User> {
  return await fetchUser()
}

// ALSO RIGHT - let inference work
async function getData() {
  return await fetchUser()  // Infers Promise<User>
}

// For arrow functions
const getData = async (): Promise<User> => {
  return await fetchUser()
}

```

**Symptoms:**
- Type 'Promise<X>' is not assignable to type 'X'
- Async function return type mismatch
- Confusing type errors with async/await

---

### [HIGH] Type assertions don't provide runtime safety

**Situation:** Using 'as' to tell TypeScript a value is a certain type

**Why it happens:**
Type assertions (as X) tell TypeScript to trust you - they don't
perform any runtime checks. If you're wrong, you get runtime errors
with no TypeScript warnings.


**Solution:**
```
Use type guards instead of assertions:

// DANGEROUS - no runtime check
const user = data as User
console.log(user.email)  // Runtime error if data isn't User

// SAFE - runtime type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as any).id === 'string' &&
    'email' in value &&
    typeof (value as any).email === 'string'
  )
}

if (isUser(data)) {
  console.log(data.email)  // Safe - checked at runtime
}

// Or use Zod for runtime validation
import { z } from 'zod'
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
})

const user = UserSchema.parse(data)  // Throws if invalid

```

**Symptoms:**
- Cannot read property 'x' of undefined at runtime
- Type assertions hiding actual type mismatches
- API responses not matching expected types

---

### [MEDIUM] Numeric enums have reverse mappings that can cause issues

**Situation:** Iterating over enum values or checking enum membership

**Why it happens:**
Numeric enums create reverse mappings (number → name).
Object.values(MyEnum) returns both names and numbers.
This breaks iteration and membership checks.


**Solution:**
```
Use const assertions or string enums instead:

// PROBLEMATIC - numeric enum
enum Status { Pending, Active, Done }
Object.values(Status)  // ['Pending', 'Active', 'Done', 0, 1, 2]

// BETTER - string enum
enum Status {
  Pending = 'pending',
  Active = 'active',
  Done = 'done',
}
Object.values(Status)  // ['pending', 'active', 'done']

// BEST - const object (no runtime overhead)
const Status = {
  Pending: 'pending',
  Active: 'active',
  Done: 'done',
} as const

type Status = typeof Status[keyof typeof Status]
// 'pending' | 'active' | 'done'

```

**Symptoms:**
- Enum iteration returns unexpected values
- Enum length is double expected
- Type checking enum membership fails

---

### [MEDIUM] Optional property vs property that can be undefined are different

**Situation:** Using exactOptionalPropertyTypes with optional properties

**Why it happens:**
With exactOptionalPropertyTypes, { x?: string } is different from
{ x: string | undefined }. The first allows omitting x entirely,
the second requires x to be present (even if undefined).


**Solution:**
```
Understand the distinction and use correctly:

interface WithOptional {
  x?: string  // Can omit x entirely
}

interface WithUndefined {
  x: string | undefined  // Must include x, can be undefined
}

// With exactOptionalPropertyTypes: true
const a: WithOptional = {}  // OK
const b: WithOptional = { x: undefined }  // ERROR!

const c: WithUndefined = {}  // ERROR - x is required
const d: WithUndefined = { x: undefined }  // OK

// If you want both behaviors:
interface WithBoth {
  x?: string | undefined
}

```

**Symptoms:**
- Type undefined is not assignable for optional properties
- Can't pass undefined to optional property
- Different behavior after enabling exactOptionalPropertyTypes

---

### [MEDIUM] Function overload order matters - first match wins

**Situation:** Writing function overloads and getting wrong type inference

**Why it happens:**
TypeScript checks overloads top-to-bottom and uses the first match.
If a more general overload comes before a specific one, the specific
one will never be used.


**Solution:**
```
Order overloads from most specific to most general:

// WRONG ORDER - string version never matches
function parse(input: unknown): unknown
function parse(input: string): object  // Never used!

// RIGHT ORDER - specific first
function parse(input: string): object
function parse(input: unknown): unknown
function parse(input: unknown): unknown {
  if (typeof input === 'string') {
    return JSON.parse(input)
  }
  return input
}

// Usage
const result = parse('{"a":1}')  // type is object
const other = parse(123)  // type is unknown

```

**Symptoms:**
- Wrong return type from overloaded function
- Specific overload never used
- Type inference picks wrong overload

---

### [MEDIUM] TypeScript uses structural typing, not nominal

**Situation:** Expecting two different interfaces/types to be incompatible

**Why it happens:**
TypeScript checks type compatibility by structure, not by name.
Two types with the same shape are compatible, even if they have
different names. This can lead to accidental compatibility.


**Solution:**
```
Use branded types for nominal typing when needed:

// These are compatible (same shape)
interface UserId { id: string }
interface PostId { id: string }

function getUser(id: UserId) { }
getUser({ id: 'post-123' })  // No error!

// Branded types make them incompatible
type UserId = string & { __brand: 'UserId' }
type PostId = string & { __brand: 'PostId' }

function createUserId(id: string): UserId {
  return id as UserId
}

function getUser(id: UserId) { }
getUser(createUserId('user-123'))  // OK
getUser('post-123' as PostId)  // Error!

```

**Symptoms:**
- Can pass wrong type because structure matches
- No error when mixing similar types
- Need to distinguish semantically different types

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `component|react|hook` | react-patterns | Types need React context |
| `api|backend|server` | backend | Types need API context |
| `validation|zod|schema` | backend | Types need runtime validation |
| `database|supabase|query` | supabase-backend | Types need database context |

### Receives Work From

- **frontend**: Frontend needs type safety
- **backend**: Backend needs type safety
- **react-patterns**: React needs types
- **supabase-backend**: Database needs types

### Works Well With

- nextjs-app-router
- react-patterns
- supabase-backend

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/frameworks/typescript-strict/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
