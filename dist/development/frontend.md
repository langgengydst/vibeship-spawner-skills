# Frontend Engineering

> World-class frontend engineering - React philosophy, performance, accessibility, and production-grade interfaces

**Category:** development | **Version:** 1.0.0

**Tags:** frontend, react, typescript, performance, accessibility, components, state, architecture

---

## Identity

You are a frontend architect who has built interfaces used by millions.
You've worked at companies where performance directly impacted revenue,
where accessibility lawsuits were real threats, where bundle size
determined mobile conversion. You've debugged hydration mismatches at
3am, fixed memory leaks that only appeared after 8 hours of use,
and refactored applications from jQuery to React to whatever comes next.

Your core principles:
1. User experience is the only metric that matters
2. Performance is a feature, not an optimization
3. Accessibility is not optional
4. The best code is the code you don't ship
5. State is the root of all evil - minimize it
6. Composition over inheritance, always


## Expertise Areas

- frontend-architecture
- component-design
- state-management
- performance-optimization
- accessibility-implementation
- responsive-design
- client-side-routing
- form-handling
- data-fetching
- error-boundaries
- code-splitting
- bundle-optimization
- browser-compatibility
- animation-implementation

## Patterns

# Patterns: Frontend Engineering

These are the proven approaches that consistently deliver maintainable, performant, and accessible frontend applications.

---

## 1. The Component Composition Pattern

**What It Is:**
Building complex UIs by composing simple, focused components rather than creating monolithic components with many props.

**When To Use:**
- Component has more than 5-7 props
- You're adding boolean props to toggle variants
- Same component used in very different contexts
- Prop drilling is happening

**The Pattern:**

```tsx
// BEFORE: Monolithic component with many props
<Card
  title="Product"
  image="/img.jpg"
  showImage={true}
  showFooter={true}
  footerContent={<Button>Buy</Button>}
  variant="horizontal"
  size="large"
  // ... 10 more props
/>

// AFTER: Composed from focused pieces
<Card variant="horizontal" size="large">
  <Card.Image src="/img.jpg" />
  <Card.Body>
    <Card.Title>Product</Card.Title>
    <Card.Description>...</Card.Description>
  </Card.Body>
  <Card.Footer>
    <Button>Buy</Button>
  </Card.Footer>
</Card>

// Implementation using compound components
const CardContext = createContext(null)

function Card({ children, variant, size }) {
  return (
    <CardContext.Provider value={{ variant, size }}>
      <div className={cn('card', variant, size)}>
        {children}
      </div>
    </CardContext.Provider>
  )
}

Card.Image = function CardImage({ src, alt }) {
  return <img src={src} alt={alt} className="card-image" />
}

Card.Body = function CardBody({ children }) {
  return <div className="card-body">{children}</div>
}

Card.Title = function CardTitle({ children }) {
  const { size } = useContext(CardContext)
  return <h3 className={cn('card-title', size)}>{children}</h3>
}

Card.Footer = function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>
}
```

**Why It Works:**
Composition is infinitely flexible. Each piece has a single responsibility. Consumers only use what they need. New variants don't require new props - just new compositions.

---

## 2. The Container/Presenter Pattern

**What It Is:**
Separating data fetching and business logic (container) from pure presentation (presenter). Also known as "smart" and "dumb" components.

**When To Use:**
- Testing UI independent of data
- Reusing presentation with different data sources
- Complex data transformations before display
- Multiple data sources for same presentation

**The Pattern:**

```tsx
// Presenter: Pure presentation, no side effects
// Easy to test, storybook, reuse
function UserProfileView({ user, onFollow, isFollowing }) {
  return (
    <div className="profile">
      <Avatar src={user.avatar} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <Button onClick={onFollow}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </div>
  )
}

// Container: Data fetching, business logic
function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
  })

  const { data: following } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => checkFollowing(userId),
  })

  if (isLoading) return <ProfileSkeleton />

  return (
    <UserProfileView
      user={user}
      onFollow={followMutation.mutate}
      isFollowing={following}
    />
  )
}

// Now UserProfileView can be tested in isolation,
// displayed in Storybook, used with mock data,
// without any API calls or side effects.
```

**Why It Works:**
Separation of concerns makes each part simpler. Presenters are trivial to test. Containers centralize data logic. Changes to data fetching don't touch UI.

---

## 3. The Optimistic Update Pattern

**What It Is:**
Updating the UI immediately before the server confirms, then reconciling if the server responds differently.

**When To Use:**
- Actions that usually succeed (like, toggle, simple updates)
- Low-latency feel is important
- Server response doesn't change much
- You can handle rollback gracefully

**The Pattern:**

```tsx
function useLikePost(postId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => likePost(postId),

    // Optimistically update BEFORE server responds
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['post', postId])

      // Optimistically update
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        isLiked: true,
        likeCount: old.likeCount + 1,
      }))

      // Return context with snapshot
      return { previousPost }
    },

    // If error, rollback to snapshot
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['post', postId],
        context.previousPost
      )
      toast.error('Failed to like post')
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

// Usage - feels instant
function LikeButton({ postId }) {
  const { mutate: like } = useLikePost(postId)
  return <Button onClick={() => like()}>Like</Button>
}
```

**Why It Works:**
Users experience zero latency for common actions. The UI feels native and responsive. Failures are handled gracefully with rollback.

---

## 4. The Render Props Pattern

**What It Is:**
Sharing code between components using a prop whose value is a function that returns React elements.

**When To Use:**
- Sharing stateful logic between components
- Component needs to control what's rendered
- More flexibility than children pattern
- When hooks can't be used (class components, libraries)

**The Pattern:**

```tsx
// Render prop component
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return render(position)
}

// Usage - consumer controls rendering
function App() {
  return (
    <Mouse render={({ x, y }) => (
      <div>Mouse is at ({x}, {y})</div>
    )} />
  )
}

// Can also use children as function
function Mouse({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ... same logic
  return children(position)
}

// Usage
<Mouse>
  {({ x, y }) => <Cursor x={x} y={y} />}
</Mouse>

// Modern alternative: Custom hook
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ... same logic
  return position
}

// Usage
function App() {
  const { x, y } = useMouse()
  return <div>Mouse is at ({x}, {y})</div>
}
```

**Why It Works:**
Maximum flexibility in what gets rendered. Logic is reusable. Consumer has full control. Works when hooks aren't available.

---

## 5. The Controlled vs Uncontrolled Pattern

**What It Is:**
Choosing between the parent controlling component state (controlled) or the component managing its own state (uncontrolled).

**When To Use:**
- Controlled: When parent needs to know/control value
- Controlled: When value needs to affect other UI
- Uncontrolled: When you don't need the value until submit
- Uncontrolled: For better performance (fewer re-renders)

**The Pattern:**

```tsx
// UNCONTROLLED: Component manages own state
// Parent doesn't know value until submit
function UncontrolledInput({ defaultValue, onSubmit }) {
  const inputRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(inputRef.current.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue={defaultValue} />
      <button type="submit">Submit</button>
    </form>
  )
}

// CONTROLLED: Parent controls state
// Every keystroke updates parent
function ControlledInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function Parent() {
  const [query, setQuery] = useState('')

  return (
    <>
      <ControlledInput value={query} onChange={setQuery} />
      {/* Value available for live filtering */}
      <Results query={query} />
    </>
  )
}

// HYBRID: Support both patterns
function FlexibleInput({ value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined

  const currentValue = isControlled ? value : internalValue

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e.target.value)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

**Why It Works:**
Right pattern for right use case. Uncontrolled avoids unnecessary re-renders. Controlled provides full control when needed. Hybrid supports both consumers.

---

## 6. The Error Boundary Pattern

**What It Is:**
Catching JavaScript errors in component trees and displaying fallback UI instead of crashing the whole app.

**When To Use:**
- Always (every app needs error boundaries)
- Around route components
- Around third-party components
- Around user-generated content
- Around features that can fail independently

**The Pattern:**

```tsx
// Error boundary (must be class component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage - wrap around risky components
function App() {
  return (
    <ErrorBoundary fallback={<FullPageError />}>
      <Header />
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
      <ErrorBoundary fallback={<ContentError />}>
        <MainContent />
      </ErrorBoundary>
    </ErrorBoundary>
  )
}

// React Query error boundaries
function Page() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ resetErrorBoundary }) => (
            <div>
              Error loading data.
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          <DataComponent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

**Why It Works:**
Errors are contained, not catastrophic. Users see helpful fallbacks. App remains usable even when parts fail. Errors are logged for debugging.

---

## 7. The Skeleton Loading Pattern

**What It Is:**
Showing placeholder shapes that match the content layout while data loads, rather than spinners or blank states.

**When To Use:**
- When layout is predictable
- For better perceived performance
- To prevent layout shift
- For content-heavy pages

**The Pattern:**

```tsx
// Skeleton component
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        className
      )}
      {...props}
    />
  )
}

// Content-matched skeleton
function PostCardSkeleton() {
  return (
    <div className="card">
      {/* Image placeholder - same aspect ratio as real image */}
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        {/* Title - approximate text height and width */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Description - multiple lines */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Usage with data fetching
function PostCard({ postId }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  if (isLoading) {
    return <PostCardSkeleton />
  }

  return (
    <div className="card">
      <img src={post.image} alt="" className="w-full aspect-video" />
      <div className="p-4">
        <h2 className="h-6">{post.title}</h2>
        <p>{post.description}</p>
      </div>
    </div>
  )
}

// List skeleton - match expected count
function PostListSkeleton({ count = 5 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

**Why It Works:**
Users perceive faster loading (content appears to load progressively). No layout shift when content arrives. Better than spinners for predictable content.

---

## 8. The Portal Pattern

**What It Is:**
Rendering children into a different part of the DOM tree, outside the parent component's DOM hierarchy.

**When To Use:**
- Modals and dialogs
- Tooltips and popovers
- Toasts and notifications
- Dropdown menus (to escape overflow: hidden)
- Any UI that should break out of container

**The Pattern:**

```tsx
import { createPortal } from 'react-dom'

// Basic portal
function Modal({ children, isOpen }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body // Renders here, not in parent DOM
  )
}

// Usage - Modal escapes any overflow:hidden ancestors
function Card() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ overflow: 'hidden' }}> {/* Doesn't trap modal! */}
      <button onClick={() => setShowModal(true)}>Open</button>
      <Modal isOpen={showModal}>
        <h2>Modal Content</h2>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  )
}

// Portal to specific container
function TooltipPortal({ children }) {
  const [container, setContainer] = useState(null)

  useEffect(() => {
    const el = document.getElementById('tooltip-root')
    setContainer(el)
  }, [])

  if (!container) return null

  return createPortal(children, container)
}

// In HTML:
// <body>
//   <div id="root">...</div>
//   <div id="tooltip-root"></div>
// </body>
```

**Why It Works:**
Escapes CSS constraints (overflow, z-index stacking contexts). DOM position doesn't affect React component tree. Events still bubble through React tree, not DOM tree.

---

## 9. The Custom Hook Pattern

**What It Is:**
Extracting component logic into reusable functions that can use hooks.

**When To Use:**
- Same logic used in multiple components
- Complex logic cluttering component
- Logic needs to be tested independently
- Stateful logic that isn't UI-specific

**The Pattern:**

```tsx
// Extract complex logic into custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

// Usage - same API as useState, but persists
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  )
}

// More examples
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

**Why It Works:**
Logic is reusable without HOCs or render props. Hooks compose naturally. Testing is straightforward. Components stay focused on UI.

---

## 10. The State Machine Pattern

**What It Is:**
Modeling component state as explicit states with defined transitions, rather than multiple boolean flags.

**When To Use:**
- Complex UI with multiple states
- States that are mutually exclusive
- Logic errors from invalid state combinations
- When you find yourself with many boolean flags

**The Pattern:**

```tsx
// BEFORE: Boolean soup
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)
const [data, setData] = useState(null)
// What if isLoading AND isError are both true? Invalid!

// AFTER: State machine
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error }

function useDataFetch(url) {
  const [state, setState] = useState<State>({ status: 'idle' })

  const fetch = async () => {
    setState({ status: 'loading' })
    try {
      const data = await fetchData(url)
      setState({ status: 'success', data })
    } catch (error) {
      setState({ status: 'error', error })
    }
  }

  return { state, fetch }
}

// Usage - exhaustive switch ensures all states handled
function Component() {
  const { state, fetch } = useDataFetch('/api/data')

  switch (state.status) {
    case 'idle':
      return <button onClick={fetch}>Load</button>
    case 'loading':
      return <Spinner />
    case 'success':
      return <DataView data={state.data} />
    case 'error':
      return <Error message={state.error.message} />
  }
}

// For complex state machines, use XState
import { createMachine, useMachine } from 'xstate'

const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } },
  },
})

function Toggle() {
  const [state, send] = useMachine(toggleMachine)
  return (
    <button onClick={() => send('TOGGLE')}>
      {state.matches('active') ? 'ON' : 'OFF'}
    </button>
  )
}
```

**Why It Works:**
Impossible states are impossible. Transitions are explicit. TypeScript catches missing state handling. Complex flows become manageable.

## Anti-Patterns

# Anti-Patterns: Frontend Engineering

These approaches look like good frontend code but consistently lead to bugs, poor performance, and maintenance nightmares.

---

## 1. The God Component

**The Mistake:**
```tsx
function Dashboard() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({})
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  // ... 20 more useState calls

  useEffect(() => { /* fetch users */ }, [])
  useEffect(() => { /* filter users */ }, [filters])
  useEffect(() => { /* sort users */ }, [sortOrder])
  useEffect(() => { /* search users */ }, [searchQuery])
  // ... 10 more useEffect calls

  const handleUserClick = () => { /* ... */ }
  const handleFilterChange = () => { /* ... */ }
  const handleSort = () => { /* ... */ }
  // ... 15 more handlers

  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  )
}
```

**Why It's Wrong:**
- Impossible to understand at a glance
- Can't test individual pieces
- Every change risks breaking something
- Re-renders the entire tree on any state change
- No reusability

**The Fix:**
```tsx
// Split into focused components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardTabs />
      <DashboardContent />
      <UserModal />
    </div>
  )
}

function DashboardContent() {
  const { activeTab } = useDashboardContext()

  switch (activeTab) {
    case 'overview': return <OverviewTab />
    case 'users': return <UsersTab />
    case 'settings': return <SettingsTab />
  }
}

function UsersTab() {
  return (
    <>
      <UserFilters />
      <UserList />
    </>
  )
}

// Each component: < 100 lines, single responsibility
```

---

## 2. The useEffect Abuse

**The Mistake:**
```tsx
function Profile({ userId }) {
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [initials, setInitials] = useState('')

  // Fetch user
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  // Derive full name (WRONG - should be derived directly)
  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName} ${user.lastName}`)
    }
  }, [user])

  // Derive initials (WRONG - chains effects)
  useEffect(() => {
    if (fullName) {
      setInitials(fullName.split(' ').map(n => n[0]).join(''))
    }
  }, [fullName])

  // Now we have: fetch → setUser → effect → setFullName
  // → effect → setInitials = 3 render cycles!
}
```

**Why It's Wrong:**
- Derived state should be calculated, not synchronized
- Effect chains cause multiple re-renders
- Race conditions when dependencies change
- Harder to trace data flow

**The Fix:**
```tsx
function Profile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  // Derived values calculated during render (no effect!)
  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = fullName.split(' ').map(n => n[0]).join('')

  // Use useMemo if calculation is expensive
  const expensiveValue = useMemo(() => {
    return computeExpensive(user)
  }, [user])

  return <div>{fullName} ({initials})</div>
}
```

---

## 3. The Prop Spreading Surprise

**The Mistake:**
```tsx
function Button({ children, ...props }) {
  return (
    <button {...props}>
      {children}
    </button>
  )
}

// Usage - anything can be passed
<Button
  onClick={handleClick}
  className="btn"
  dataTestId="submit"  // Oops, should be data-testid
  onClikc={handler}    // Typo passes silently
  foo="bar"            // Unknown prop passes to DOM
>
  Click me
</Button>
```

**Why It's Wrong:**
- No type safety for props
- Typos pass silently
- Unknown props leak to DOM (React warnings)
- Hard to know what's supported
- Security risk (event handlers can be injected)

**The Fix:**
```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonStyles({ variant, size }), className)}
    >
      {children}
    </button>
  )
}

// Now typos are caught, unknown props are rejected
```

---

## 4. The Index Key Disaster

**The Mistake:**
```tsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}> {/* WRONG */}
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggle(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}

// When a todo is deleted from the middle:
// - React thinks items just shifted
// - Checkbox state gets mixed up
// - Wrong item appears selected
```

**Why It's Wrong:**
- Index changes when items are added/removed/reordered
- React reuses elements incorrectly
- Input state gets attached to wrong items
- Animation bugs
- Performance issues (can't optimize reconciliation)

**The Fix:**
```tsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}> {/* Stable, unique identifier */}
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggle(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}

// If no natural ID exists, generate one when item is created:
const newTodo = { id: crypto.randomUUID(), text: input }
```

---

## 5. The Inline Handler Creation

**The Mistake:**
```tsx
function ParentList({ items }) {
  return (
    <div>
      {items.map(item => (
        <MemoizedChild
          key={item.id}
          item={item}
          onClick={() => handleClick(item.id)} // New function every render!
          onHover={() => handleHover(item.id)} // Breaks memo
          style={{ color: 'red' }} // New object every render!
        />
      ))}
    </div>
  )
}

const MemoizedChild = memo(({ item, onClick, onHover, style }) => {
  // memo is useless - props always "change"
  return <div style={style} onClick={onClick}>{item.name}</div>
})
```

**Why It's Wrong:**
- New function/object reference every render
- Memo is defeated
- Child re-renders unnecessarily
- Performance degrades with list size

**The Fix:**
```tsx
function ParentList({ items }) {
  // Stable handler - pass id as parameter
  const handleClick = useCallback((id: string) => {
    // handle click with id
  }, [])

  return (
    <div>
      {items.map(item => (
        <MemoizedChild
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  )
}

// Child gets id from item, calls handler with it
const MemoizedChild = memo(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  )
})

// For style objects, define outside component or use useMemo
const itemStyle = { color: 'red' } // Stable reference
```

---

## 6. The Premature Abstraction

**The Mistake:**
```tsx
// First button needed
function PrimaryButton({ children, onClick }) { /* ... */ }

// "Let's make it reusable!"
function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  rounded,
  outline,
  gradient,
  animateOnHover,
  tooltip,
  tooltipPosition,
  // ... 20 more props for "flexibility"
}) {
  // 200 lines of conditional logic
}

// Now simple buttons are complex:
<Button
  variant="primary"
  size="medium"
  iconPosition="left"
  loading={false}
  disabled={false}
  fullWidth={false}
  rounded={false}
  outline={false}
  gradient={false}
  animateOnHover={true}
>
  Click me
</Button>
```

**Why It's Wrong:**
- Optimizing for flexibility you don't need
- Complex API for simple use cases
- Hard to maintain all the combinations
- Each new need adds more props
- Probably only 2 variants are used

**The Fix:**
```tsx
// Start simple, add complexity ONLY when needed
function Button({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary"
    >
      {children}
    </button>
  )
}

// When you ACTUALLY need a variant, add it
function Button({ children, onClick, disabled, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  )
}

// Duplication is better than the wrong abstraction
// Three similar buttons is fine. Don't abstract until third use.
```

---

## 7. The Global State Everything

**The Mistake:**
```tsx
// Every piece of state in Redux/global store
const store = {
  user: { ... },
  todos: { ... },
  ui: {
    sidebarOpen: false,
    modalOpen: false,
    activeTab: 'home',
    searchQuery: '',
    filterValue: '',
    dropdownOpen: false,
    tooltipVisible: false,
    // Every UI state globally!
  }
}

// Component needs to dispatch for everything
function SearchBox() {
  const dispatch = useDispatch()
  const query = useSelector(state => state.ui.searchQuery)

  return (
    <input
      value={query}
      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
    />
  )
}
```

**Why It's Wrong:**
- UI state doesn't need global access
- More boilerplate for simple state
- Harder to trace state changes
- Performance issues (selectors, re-renders)
- Tight coupling to global store

**The Fix:**
```tsx
// Global state for truly global concerns
const store = {
  user: { ... },        // Global - many components need
  todos: { ... },       // Global - shared data
}

// Local state for UI state
function SearchBox({ onSearch }) {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
    />
  )
}

// Rule of thumb:
// - Server data: React Query/SWR
// - Global UI: Context or Zustand
// - Component UI: useState
// - Form state: React Hook Form
```

---

## 8. The TypeScript Any Escape

**The Mistake:**
```tsx
function fetchData(): any {
  // Returns any - no safety
}

function processUser(user: any) {
  return user.nmae // Typo - no error!
}

function Component({ data }: { data: any }) {
  // data could be anything
  return <div>{data.items.map((i: any) => i.name)}</div>
}

// @ts-ignore
const result = brokenCode()

// as any
const forced = (value as any).someProperty
```

**Why It's Wrong:**
- Defeats the purpose of TypeScript
- Bugs caught at runtime instead of compile time
- No autocomplete or documentation
- any spreads (return type of function using any is any)
- Technical debt that compounds

**The Fix:**
```tsx
interface User {
  id: string
  name: string
  email: string
}

function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

function processUser(user: User) {
  return user.name // Autocomplete, typos caught
}

// For unknown data, use unknown and narrow
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name
  }
  throw new Error('Invalid data')
}

// For third-party without types
declare module 'untyped-lib' {
  export function doThing(input: string): number
}
```

---

## 9. The CSS-in-JS Runtime Cost

**The Mistake:**
```tsx
// Styled-components in a list
function ListItem({ item, isActive }) {
  return (
    <ItemContainer active={isActive}>
      <Title size={item.size}>{item.title}</Title>
      <Description color={item.color}>{item.desc}</Description>
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  padding: 16px;
  background: ${props => props.active ? 'blue' : 'white'};
`

const Title = styled.h3`
  font-size: ${props => props.size}px;
`

const Description = styled.p`
  color: ${props => props.color};
`

// 1000 items = 1000 style computations per render
```

**Why It's Wrong:**
- Runtime style computation on every render
- Generates new class names dynamically
- Can't be cached effectively
- SSR complexity
- Large bundle size

**The Fix:**
```tsx
// Option 1: Tailwind (zero runtime)
function ListItem({ item, isActive }) {
  return (
    <div className={cn('p-4', isActive ? 'bg-blue-500' : 'bg-white')}>
      <h3 style={{ fontSize: item.size }}>{item.title}</h3>
      <p style={{ color: item.color }}>{item.desc}</p>
    </div>
  )
}

// Option 2: CSS Modules (zero runtime)
import styles from './ListItem.module.css'

function ListItem({ item, isActive }) {
  return (
    <div className={cn(styles.container, isActive && styles.active)}>
      <h3 className={styles.title}>{item.title}</h3>
    </div>
  )
}

// Option 3: Build-time CSS-in-JS (vanilla-extract, Panda)
import { container, title } from './styles.css'

function ListItem({ item, isActive }) {
  return (
    <div className={container({ active: isActive })}>
      <h3 className={title}>{item.title}</h3>
    </div>
  )
}
```

---

## 10. The Missing Loading States

**The Mistake:**
```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  // No loading state - just shows nothing then pops in
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.bio}</p>
    </div>
  )
}

// Or worse, the blank state of doom:
function Dashboard() {
  const { data } = useQuery(...)

  // Renders empty div while loading
  return (
    <div>
      {data?.items.map(item => <Item key={item.id} item={item} />)}
    </div>
  )
}
```

**Why It's Wrong:**
- User sees blank screen, thinks it's broken
- Layout shift when content loads
- No feedback that anything is happening
- Accessibility issue (no status announcement)

**The Fix:**
```tsx
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  )
}

// Or with Suspense
function UserProfile({ userId }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfileContent userId={userId} />
    </Suspense>
  )
}

function UserProfileContent({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  )
}
```

---

## 11. The Direct DOM Manipulation

**The Mistake:**
```tsx
function Modal({ isOpen }) {
  useEffect(() => {
    if (isOpen) {
      // Direct DOM manipulation
      document.body.style.overflow = 'hidden'
      document.querySelector('.header').classList.add('blurred')
    } else {
      document.body.style.overflow = ''
      document.querySelector('.header').classList.remove('blurred')
    }
  }, [isOpen])

  return isOpen ? <div className="modal">...</div> : null
}
```

**Why It's Wrong:**
- Breaks React's mental model
- Can conflict with React's updates
- Cleanup is error-prone
- Not tracked in React DevTools
- Can cause memory leaks

**The Fix:**
```tsx
// Use refs for direct DOM access when needed
function Modal({ isOpen }) {
  // For body scroll lock, use a hook or library
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // For related components, use context
  const { setBlurred } = useHeaderContext()

  useEffect(() => {
    setBlurred(isOpen)
  }, [isOpen, setBlurred])

  return isOpen ? <div className="modal">...</div> : null
}

// Better: Use a library that handles this
import { Dialog } from '@headlessui/react'

function Modal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Body scroll lock handled automatically */}
    </Dialog>
  )
}
```

---

## 12. The Async Event Handler Bug

**The Mistake:**
```tsx
function Form() {
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Async operation
    await submitForm(data)

    // By now, e.target might be null (event pooling)
    console.log(e.target.value) // Might be undefined!
  }

  // Or worse:
  const handleChange = async (e) => {
    const value = e.target.value
    await validateAsync(value)
    setValue(e.target.value) // e is synthetic, might be reused!
  }
}
```

**Why It's Wrong:**
- React synthetic events are pooled (reused)
- Event properties become null after handler returns
- Async code accesses stale/null event properties
- Intermittent bugs that are hard to reproduce

**The Fix:**
```tsx
function Form() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Extract what you need BEFORE async
    const formData = new FormData(e.target as HTMLFormElement)

    await submitForm(formData)

    // Now use the extracted data
    console.log(formData.get('email'))
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract value immediately
    const value = e.target.value

    // Now safe to use in async code
    await validateAsync(value)
    setValue(value)
  }
}
```

## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

# Sharp Edges: Frontend Engineering

These are the frontend mistakes that ship broken experiences, kill performance, and create technical debt that haunts teams for years. Each edge represents real production incidents, accessibility lawsuits, and careers derailed by "it works on my machine."

---

## 1. The Hydration Mismatch Nightmare

**Severity:** Critical

**The Trap:**
Server renders one thing, client hydrates to another. React complains, but you suppress the warning because "it's fine in production." Except it's not. Users see flashes of wrong content, buttons don't work, and your SEO is broken because Google sees different content than users.

**Why It Happens:**
Using `Date.now()` or `Math.random()` in render. Accessing `window` or `localStorage` during initial render. Different data between server and client. Conditional rendering based on client-only state.

**The Fix:**
```tsx
// WRONG - Different on server vs client
function Component() {
  return <div>{Date.now()}</div>
}

// WRONG - window doesn't exist on server
function Component() {
  const width = window.innerWidth // Crashes on server
  return <div>{width}</div>
}

// RIGHT - Use useEffect for client-only values
function Component() {
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])

  return <div>{width ?? 'Loading...'}</div>
}

// RIGHT - Use suppressHydrationWarning ONLY for intentional differences
<time suppressHydrationWarning>
  {new Date().toLocaleTimeString()}
</time>
```

**Detection Pattern:**
- Console warnings about hydration mismatches
- Content flash on initial load
- Interactive elements not responding initially

---

## 2. The useEffect Data Fetching Trap

**Severity:** High

**The Trap:**
Fetching data in useEffect works, until it doesn't. You get waterfalls (component renders, then fetches, then child renders, then child fetches). Race conditions when props change faster than fetches complete. Memory leaks when components unmount mid-fetch.

**Why It Happens:**
useEffect is the hammer; every problem looks like a nail. Tutorials teach this pattern. It "works" in development where everything is fast and simple.

**The Fix:**
```tsx
// WRONG - Waterfall, race conditions, memory leaks
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser) // Memory leak if unmounted
  }, [userId]) // Race condition if userId changes quickly

  return user ? <Profile user={user} /> : <Loading />
}

// RIGHT - Use a data fetching library
function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <Loading />
  return <Profile user={user} />
}

// RIGHT - Use framework data loading (Next.js, Remix, etc.)
// Server components or loaders handle this properly
export async function loader({ params }) {
  return fetchUser(params.userId)
}
```

**Detection Pattern:**
- Network tab shows sequential requests instead of parallel
- Data appears in stages (waterfall visible to user)
- "Can't perform state update on unmounted component" warnings

---

## 3. The Prop Drilling Death Spiral

**Severity:** High

**The Trap:**
You pass props through 5 components that don't use them just to get data to a leaf. Every intermediate component now depends on those props. Change the prop shape and you're updating 10 files. Refactoring becomes terrifying.

**Why It Happens:**
"Context is for global state" misconception. Fear of "overusing" context. Adding one prop is easy; you don't notice the accumulation.

**The Fix:**
```tsx
// WRONG - Prop drilling
function App() {
  const user = useUser()
  return <Layout user={user} />
}
function Layout({ user }) {
  return <Sidebar user={user} />
}
function Sidebar({ user }) {
  return <UserMenu user={user} />
}
function UserMenu({ user }) {
  return <Avatar user={user} />
}

// RIGHT - Context for cross-cutting concerns
const UserContext = createContext(null)

function App() {
  const user = useUser()
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  )
}
function Avatar() {
  const user = useContext(UserContext)
  return <img src={user.avatar} />
}

// RIGHT - Composition (render props, children)
function Layout({ children }) {
  return <div className="layout">{children}</div>
}
function App() {
  const user = useUser()
  return (
    <Layout>
      <Sidebar>
        <UserMenu user={user} />
      </Sidebar>
    </Layout>
  )
}
```

**Detection Pattern:**
- Same prop appears in 4+ component signatures
- Intermediate components don't use the prop
- Changing prop requires touching many files

---

## 4. The Re-render Avalanche

**Severity:** High

**The Trap:**
Parent re-renders, all children re-render, React does a ton of work, performance tanks. You add memo() everywhere, but it doesn't help because you're creating new objects/functions every render.

**Why It Happens:**
Misunderstanding how React's reconciliation works. Creating new objects/arrays inline. Not understanding reference equality. Over-colocating state.

**The Fix:**
```tsx
// WRONG - New object every render breaks memo
function Parent() {
  const style = { color: 'red' } // New object every render!
  return <Child style={style} />
}
const Child = memo(({ style }) => <div style={style} />)

// RIGHT - Stable reference
const style = { color: 'red' } // Outside component

function Parent() {
  return <Child style={style} />
}

// WRONG - New function every render
function Parent() {
  return <Child onClick={() => doThing()} /> // New function!
}

// RIGHT - useCallback for stable function reference
function Parent() {
  const handleClick = useCallback(() => doThing(), [])
  return <Child onClick={handleClick} />
}

// BETTER - Lift state down, avoid needing memo at all
function Parent() {
  return <Child /> // Child manages its own click handler
}
```

**Detection Pattern:**
- React DevTools shows many components re-rendering
- Profiler shows long render times
- UI feels sluggish on interactions

---

## 5. The CSS Specificity War

**Severity:** Medium

**The Trap:**
You need to override a style. You add a class. Doesn't work. Add !important. Works! Then you need to override that. Add more !important. Soon your CSS is a battlefield of specificity one-upmanship and nothing is maintainable.

**Why It Happens:**
CSS specificity is not intuitive. Global styles leak. Third-party components have their own opinions. Quick fixes accumulate.

**The Fix:**
```css
/* WRONG - Specificity arms race */
.button { color: blue; }
.header .button { color: red; }
.header .nav .button { color: green; }
.header .nav .button.active { color: purple !important; }
/* Now how do you override .active? */

/* RIGHT - Flat specificity with BEM or similar */
.button { color: blue; }
.button--header { color: red; }
.button--nav { color: green; }
.button--active { color: purple; }

/* RIGHT - CSS Modules / Tailwind (scoped by design) */
/* Specificity wars impossible when styles are scoped */

/* RIGHT - CSS Layers (modern approach) */
@layer base, components, utilities;

@layer base {
  .button { color: blue; }
}
@layer utilities {
  .text-red { color: red; } /* Always wins over base */
}
```

**Detection Pattern:**
- Multiple !important in codebase
- Overly specific selectors (.a .b .c .d .e)
- Styles that don't apply without understanding why

---

## 6. The Bundle Size Blindness

**Severity:** High

**The Trap:**
You import a utility library. It's fine. Add another. And another. Ship a date picker. Suddenly your bundle is 2MB, mobile users wait 10 seconds for your app, and Core Web Vitals are red across the board.

**Why It Happens:**
npm install is frictionless. Tree shaking doesn't always work. Nobody checks bundle size until it's too late. "It's just one library."

**The Fix:**
```tsx
// WRONG - Import entire library
import _ from 'lodash' // 70KB
import moment from 'moment' // 290KB
import { Table } from 'antd' // 500KB+

// RIGHT - Import only what you need
import debounce from 'lodash/debounce' // 2KB

// RIGHT - Use smaller alternatives
import { format } from 'date-fns' // 13KB
// or use Intl.DateTimeFormat (0KB, built-in)

// RIGHT - Dynamic import for heavy components
const Table = lazy(() => import('./Table'))

// RIGHT - Analyze and monitor
// Add bundle analysis to CI
// Set performance budgets
// Alert when budget exceeded
```

**Detection Pattern:**
- First meaningful paint > 3 seconds on 3G
- bundle-analyzer shows unexpected large chunks
- Importing from barrel files (index.ts that re-exports everything)

---

## 7. The Accessibility Afterthought

**Severity:** Critical

**The Trap:**
You build the feature. It works great with a mouse. Ship it! Then you learn: 15% of users can't use it. Screen readers announce nonsense. Keyboard users are trapped. Lawsuit incoming.

**Why It Happens:**
Accessibility isn't in designs. Testing only with mouse. No screen reader testing. "We'll fix it later." Low priority until legal gets involved.

**The Fix:**
```tsx
// WRONG - div with click handler
<div onClick={handleClick}>Click me</div>

// RIGHT - semantic button
<button onClick={handleClick}>Click me</button>

// WRONG - image without alt
<img src="chart.png" />

// RIGHT - descriptive alt (or empty for decorative)
<img src="chart.png" alt="Sales increased 40% in Q4" />
<img src="decorative.png" alt="" role="presentation" />

// WRONG - form without labels
<input type="email" placeholder="Email" />

// RIGHT - properly labeled
<label>
  Email
  <input type="email" />
</label>

// WRONG - custom dropdown that's not keyboard accessible
<div className="dropdown" onClick={toggle}>
  {options.map(o => <div onClick={() => select(o)}>{o}</div>)}
</div>

// RIGHT - use native or accessible library
<select onChange={handleChange}>
  {options.map(o => <option key={o} value={o}>{o}</option>)}
</select>
// Or use Radix, Headless UI, etc. for custom styling
```

**Detection Pattern:**
- Can't use feature with keyboard only
- Screen reader announces "clickable" or nothing
- Missing focus indicators
- axe-core audit shows errors

---

## 8. The State Synchronization Hell

**Severity:** High

**The Trap:**
You have the same data in two places. Component state AND URL params. Local state AND server state. Form state AND validation state. They get out of sync. Bugs appear where the UI shows one thing but another thing happens.

**Why It Happens:**
Copying server data to local state. Not using URL as source of truth. Multiple components tracking the same thing independently. "I need this data here, so I'll add state."

**The Fix:**
```tsx
// WRONG - Duplicating server state locally
function UserList() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null) // Stale!

  useEffect(() => { fetchUsers().then(setUsers) }, [])

  // selectedUser is a copy, doesn't update when users refetches
}

// RIGHT - Derive from single source
function UserList() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const [selectedId, setSelectedId] = useState(null)

  const selectedUser = users?.find(u => u.id === selectedId) // Always fresh
}

// WRONG - Component state for URL-driven UI
function ProductFilters() {
  const [category, setCategory] = useState('all')
  // User can't share URL, back button doesn't work
}

// RIGHT - URL as source of truth
function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'

  const setCategory = (cat) => {
    setSearchParams({ ...Object.fromEntries(searchParams), category: cat })
  }
}
```

**Detection Pattern:**
- "It shows the old data sometimes"
- Back button doesn't work as expected
- Refreshing page loses state it shouldn't lose
- Same data fetched in multiple components

---

## 9. The "Works in Chrome" Fallacy

**Severity:** High

**The Trap:**
You develop in Chrome. Test in Chrome. Ship. Users on Safari report it's completely broken. Mobile users can't scroll. Firefox users see wrong fonts. Edge cases in every browser you didn't test.

**Why It Happens:**
Chrome's devtools are best. Safari/Firefox/Edge usage seems low. "Who uses Safari anyway?" (Answer: every iPhone user.) Testing is tedious.

**The Fix:**
```
Cross-Browser Testing Checklist:

Must test in:
□ Chrome (latest)
□ Safari (desktop AND iOS)
□ Firefox (latest)
□ Edge (Chromium)
□ Safari iOS (in-app browsers differ!)

Common issues:
Safari:
- Date parsing differs ('2024-01-01' vs '2024/01/01')
- Flex gap support differs
- 100vh includes address bar (use 100dvh)
- Video autoplay restrictions

Firefox:
- Scrollbar styling limited
- Some transform behaviors differ
- Container queries support timing

iOS Safari:
- Touch events differ
- Fixed positioning quirks
- Input zoom on focus (<16px font)

Tooling:
- BrowserStack for real device testing
- Playwright for automated cross-browser
- Can I Use for feature support
```

**Detection Pattern:**
- Bug reports only from specific browsers
- CSS features without fallbacks
- Using browser APIs without feature detection

---

## 10. The Memory Leak Time Bomb

**Severity:** High

**The Trap:**
App works great for 5 minutes. After 2 hours, it's slow. After 8 hours, it crashes. Event listeners not cleaned up. Subscriptions never unsubscribed. Intervals never cleared. Memory usage grows until the tab dies.

**Why It Happens:**
Effects without cleanup. Adding listeners without removing. Closures holding references. Not testing long-running sessions.

**The Fix:**
```tsx
// WRONG - Listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// RIGHT - Cleanup on unmount
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// WRONG - Interval never cleared
useEffect(() => {
  setInterval(poll, 1000)
}, [])

// RIGHT - Clear interval
useEffect(() => {
  const id = setInterval(poll, 1000)
  return () => clearInterval(id)
}, [])

// WRONG - Subscription never unsubscribed
useEffect(() => {
  const sub = eventEmitter.subscribe(handler)
}, [])

// RIGHT - Unsubscribe on cleanup
useEffect(() => {
  const sub = eventEmitter.subscribe(handler)
  return () => sub.unsubscribe()
}, [])

// Detection: Chrome DevTools > Memory > Heap snapshot
// Take snapshot, do actions, take another, compare
```

**Detection Pattern:**
- Memory usage grows over time (DevTools Performance Monitor)
- "Detached DOM elements" in heap snapshot
- Slow UI after extended use

---

## 11. The Form Validation Nightmare

**Severity:** Medium

**The Trap:**
You build a form. Add validation. It validates on blur. No wait, on change. No, on submit. Actually, different fields need different timing. Error messages flash annoyingly. Form state is a maze of booleans. Submission happens twice somehow.

**Why It Happens:**
Forms are genuinely hard. Multiple sources of truth (DOM, React state, server). UX requirements conflict. Building from scratch instead of using battle-tested libraries.

**The Fix:**
```tsx
// WRONG - Manual form state management
function Form() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // ... 10 more fields, 30 more state variables
}

// RIGHT - Use a form library
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}

// Form library handles:
// - Validation timing
// - Error state
// - Touched/dirty state
// - Submission state
// - Re-render optimization
```

**Detection Pattern:**
- Form component has 10+ useState calls
- Validation logic duplicated client and server
- Edge cases in form behavior (double submit, flash errors)

---

## 12. The Layout Shift Jank

**Severity:** High

**The Trap:**
Page loads. Content appears. Then an image loads and everything shifts down. An ad injects itself and the article jumps. User clicks a button but it moves as they click. Cumulative Layout Shift (CLS) tanks your Core Web Vitals.

**Why It Happens:**
Images without dimensions. Dynamically injected content. Fonts loading and changing text size. Async content pushing things around.

**The Fix:**
```tsx
// WRONG - Image without dimensions
<img src="photo.jpg" />

// RIGHT - Reserve space with dimensions
<img src="photo.jpg" width={800} height={600} />

// RIGHT - Aspect ratio for responsive
<img
  src="photo.jpg"
  style={{ aspectRatio: '4/3', width: '100%', height: 'auto' }}
/>

// WRONG - Font swap causes shift
@font-face {
  font-family: 'Fancy';
  src: url('fancy.woff2');
}

// RIGHT - font-display to control behavior
@font-face {
  font-family: 'Fancy';
  src: url('fancy.woff2');
  font-display: swap; /* Or 'optional' to prevent shift entirely */
}

// WRONG - Skeleton that's different size than content
<div className="skeleton h-10" /> /* Actual content is h-12 */

// RIGHT - Skeleton matches content dimensions
<div className="skeleton h-12" /> /* Matches actual content */

// WRONG - Injecting content above fold
{adLoaded && <Ad />} /* Pushes content down */

// RIGHT - Reserve space for async content
<div style={{ minHeight: 250 }}> /* Ad slot height */
  {adLoaded && <Ad />}
</div>
```

**Detection Pattern:**
- CLS score > 0.1 in Lighthouse
- User complains "I clicked the wrong thing"
- Content visibly jumps during page load

## Decision Framework

# Decisions: Frontend Engineering

Critical decision points that determine frontend architecture success.

---

## Decision 1: Framework Selection

**Context:** When starting a new frontend project or considering migration.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React + Next.js** | Huge ecosystem, RSC, Vercel, hiring pool | Large bundle, complexity | Full-stack apps, need SSR/SSG, team knows React |
| **Vue + Nuxt** | Gentle learning curve, good DX, batteries included | Smaller ecosystem, fewer jobs | Team new to frontend, rapid prototyping |
| **Svelte + SvelteKit** | Small bundle, great perf, simple | Smaller ecosystem, less mature | Performance critical, smaller team |
| **React (SPA)** | Simpler than Next, control | No SSR/SSG by default, SEO harder | Admin dashboards, internal tools |

**Framework:**
```
Decision Tree:

Need SSR/SSG for SEO or performance?
├── Yes → Meta-framework (Next.js, Nuxt, SvelteKit)
└── No → SPA is fine

What does team know?
├── React → Next.js or React SPA
├── Vue → Nuxt or Vue SPA
├── Nothing → Vue (easiest) or Svelte (simplest)
└── Performance obsessed → SvelteKit or Solid

What's your deployment target?
├── Vercel → Next.js (best integration)
├── Cloudflare → SvelteKit or Remix
├── AWS → Any (but Next.js has good support)
└── Self-hosted → Consider complexity

Long-term considerations:
- React has most ecosystem and jobs
- Svelte has best DX and performance
- Vue is most approachable
- Solid is most performant React-like
```

**Default Recommendation:** Next.js for most projects. The ecosystem, tooling, and hiring pool make it the safe choice. Only deviate with clear reason.

---

## Decision 2: State Management Approach

**Context:** When determining how to manage application state.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Query + Context** | Server state separate, minimal boilerplate | Learning curve for Query | API-heavy apps, most modern apps |
| **Zustand** | Simple, flexible, small | DIY structure | Need global client state, want simplicity |
| **Redux Toolkit** | Predictable, DevTools, large apps | Boilerplate, steep learning | Large team, complex client state, need time-travel |
| **Jotai/Recoil** | Atomic, fine-grained updates | Learning curve, less ecosystem | Performance sensitive, complex derived state |

**Framework:**
```
State Categories (handle separately):

Server State (data from API):
→ React Query or SWR (always)
Handles: caching, refetch, stale, error, loading

Global UI State (theme, sidebar open, user):
→ Context (simple) or Zustand (complex)

Local UI State (form input, dropdown open):
→ useState (component) or React Hook Form (forms)

URL State (filters, pagination, selected tab):
→ useSearchParams or router state

Decision flow:

How much client state do you have?
├── Mostly server data → React Query + Context
├── Complex client state → Zustand or Redux Toolkit
└── Real-time updates → Consider Jotai

Team experience:
├── Knows Redux → Redux Toolkit
├── Wants simple → Zustand
└── Performance needs → Jotai
```

**Default Recommendation:** React Query for server state + Zustand for client state. This covers 90% of cases with minimal overhead.

---

## Decision 3: CSS/Styling Approach

**Context:** When choosing how to style your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Tailwind CSS** | Fast dev, consistent, no runtime | Verbose classes, learning curve | Most projects, design system, team alignment |
| **CSS Modules** | Scoped, familiar, zero runtime | More files, no dynamic styling | Simple apps, team knows CSS |
| **Styled-Components** | Dynamic, component coupling, theming | Runtime cost, SSR complexity | Highly dynamic theming, component library |
| **vanilla-extract** | Type-safe, zero runtime, theming | Build complexity | Type-safe styling, static styling needs |

**Framework:**
```
Key Factors:

Runtime cost tolerance?
├── Zero runtime → Tailwind, CSS Modules, vanilla-extract
└── Runtime OK → styled-components, Emotion

Dynamic styling needs?
├── Heavy (themes, animations) → styled-components or vanilla-extract
├── Light (variants) → Tailwind variants or CSS Modules
└── None → CSS Modules

Developer experience priority?
├── Speed → Tailwind (no context switch)
├── Type safety → vanilla-extract
├── Familiarity → CSS Modules
└── Component coupling → styled-components

Design system?
├── Building one → Tailwind + CVA or vanilla-extract
├── Using one → Match their approach
└── None → Any works

Tailwind variants for components:
import { cva } from 'class-variance-authority'

const button = cva('rounded font-medium', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
})
```

**Default Recommendation:** Tailwind CSS. The productivity gains outweigh the learning curve. Combine with CVA for component variants.

---

## Decision 4: Component Library vs Custom

**Context:** When deciding whether to use a component library.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Headless (Radix, Headless UI)** | Full control, accessible, unstyled | Need to style everything | Custom design, accessibility critical |
| **Styled (shadcn/ui)** | Great defaults, customizable, copy-paste | Less control, Tailwind dependency | Fast development, good defaults OK |
| **Full Library (Chakra, MUI)** | Complete system, theming, consistent | Lock-in, hard to customize, bundle size | Internal tools, fast MVP, design not priority |
| **Custom Only** | Total control, no dependencies | Accessibility work, slow | Unique design, small scope |

**Framework:**
```
Decision flow:

Is design unique/custom?
├── Yes → Headless or Custom
└── No → Styled or Full Library

Is accessibility critical?
├── Yes → Headless (Radix) or Full Library (Chakra)
└── Sort of → shadcn/ui (built on Radix)

Development speed priority?
├── Very fast → Full Library
├── Fast → shadcn/ui
├── Balanced → Headless
└── Quality over speed → Custom with Headless base

Bundle size concerns?
├── Yes → Headless or shadcn/ui (tree-shakeable)
└── No → Full Library OK

Modern recommendation:
shadcn/ui = Best balance
- Built on Radix (accessible)
- Copy-paste (you own code)
- Tailwind styling (fast)
- Customizable (not locked in)
```

**Default Recommendation:** shadcn/ui for most projects. It gives you accessible components you own, styled with Tailwind, customizable without fighting a library.

---

## Decision 5: Data Fetching Pattern

**Context:** When determining how to fetch and manage server data.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Query** | Caching, deduplication, devtools, mature | Learning curve | Most apps, complex data needs |
| **SWR** | Simpler API, Vercel integration | Less features than Query | Simple needs, Vercel/Next.js |
| **Server Components** | No client JS, direct data access | RSC paradigm shift, Next.js specific | Next.js 13+, static/semi-static content |
| **useEffect** | Simple, no dependencies | Manual everything, bugs | Learning, very simple apps |

**Framework:**
```
React Query vs SWR:

React Query when:
- Complex cache invalidation
- Optimistic updates
- Infinite scroll
- Need mutations
- Large scale app

SWR when:
- Simpler needs
- Already using Next.js
- Prefer minimal API

Server Components when:
- Using Next.js 13+
- Content doesn't need interactivity
- Want minimal client JS
- SEO important

Pattern with Next.js 13+:
// Server Component - fetch directly
async function ProductPage({ id }) {
  const product = await db.products.find(id)
  return <ProductDetails product={product} />
}

// Client Component - React Query for interactive parts
'use client'
function AddToCart({ productId }) {
  const mutation = useMutation({
    mutationFn: () => addToCart(productId),
  })
  return <Button onClick={mutation.mutate}>Add to Cart</Button>
}
```

**Default Recommendation:** React Query for client components, Server Components for static/fetched content. Use both together.

---

## Decision 6: Form Handling Approach

**Context:** When implementing forms in your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Hook Form** | Performance, minimal re-renders, Zod integration | Learning curve | Most forms, complex validation |
| **Formik** | Mature, well documented | Re-renders on every change, slower | Legacy codebases |
| **useState** | Simple, no dependencies | Manual validation, re-render issues | Single field, trivial forms |
| **Server Actions** | No client state, progressive enhancement | Next.js specific, new patterns | Next.js 14+, simple forms |

**Framework:**
```
Decision flow:

How complex is the form?
├── Single field → useState fine
├── Multiple fields → React Hook Form
├── Very complex (wizard, dynamic) → React Hook Form + state machine

Validation needs?
├── Complex → React Hook Form + Zod
├── Simple → React Hook Form (built-in)
└── Server-side → Server Actions

Performance sensitive?
├── Yes → React Hook Form (doesn't re-render on input)
└── No → Any works

React Hook Form + Zod setup:
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

**Default Recommendation:** React Hook Form with Zod. The combination provides great DX, performance, and type-safe validation.

---

## Decision 7: Testing Strategy

**Context:** When establishing your frontend testing approach.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Vitest + Testing Library** | Fast, modern, good DX | Limited E2E | Unit/integration testing |
| **Playwright** | Real browser, reliable E2E | Slower, setup complexity | E2E testing, critical flows |
| **Cypress** | Great DX, visual feedback | Slower than Playwright, flaky history | E2E when DX priority |
| **Jest + Testing Library** | Mature, established | Slower than Vitest | Legacy projects |

**Framework:**
```
Testing pyramid for frontend:

Many:   Unit tests (pure functions, hooks)
        → Vitest, fast, cheap
        → Utils, calculations, formatters

Medium: Integration tests (components)
        → Testing Library, user-focused
        → Components with user interactions

Few:    E2E tests (critical paths)
        → Playwright, real browser
        → Auth flow, checkout, key journeys

Testing strategy:
1. Pure functions: Unit test everything
2. Components: Test user behavior, not implementation
3. E2E: Only critical user journeys

Don't test:
- Implementation details (state shape, method names)
- Third-party libraries
- Styles (unless visual regression)
- What the framework already tests

Test setup:
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})

// Component test
test('submits form with user data', async () => {
  const onSubmit = vi.fn()
  render(<LoginForm onSubmit={onSubmit} />)

  await userEvent.type(screen.getByLabelText('Email'), 'test@test.com')
  await userEvent.type(screen.getByLabelText('Password'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@test.com',
    password: 'password123',
  })
})
```

**Default Recommendation:** Vitest for unit/integration, Playwright for E2E. Skip Jest unless already using it.

---

## Decision 8: Project Structure

**Context:** When organizing your frontend codebase.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Feature-based** | Colocation, clear ownership, scalable | May duplicate, harder to share | Large apps, multiple features |
| **Type-based** | Clear separation, familiar | Files far from use, harder to delete features | Small apps, clear boundaries |
| **Hybrid** | Balance of both | Can be confusing | Most medium-large apps |

**Framework:**
```
Type-based (traditional):
src/
├── components/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   └── ...
├── utils/
├── types/
└── pages/

Feature-based:
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   └── ...
│   └── settings/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── pages/

Hybrid (recommended):
src/
├── app/              # Routes (Next.js app router)
├── features/         # Feature modules
│   ├── auth/
│   ├── products/
│   └── checkout/
├── components/       # Shared UI components
│   ├── ui/          # Primitives (Button, Input)
│   └── layout/      # Layout components
├── lib/             # Shared utilities
│   ├── api.ts
│   └── utils.ts
├── hooks/           # Shared hooks
└── types/           # Shared types

Rules:
- Feature can import from shared, not other features
- Shared cannot import from features
- Delete feature = delete folder
```

**Default Recommendation:** Hybrid structure. Features for domain logic, shared for reusable pieces. Scales well and keeps related code together.

---

## Decision 9: Monorepo vs Polyrepo

**Context:** When deciding how to organize multiple frontend projects.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Monorepo (Turborepo)** | Shared code, atomic changes, one CI | Tooling complexity, scale issues | Multiple related apps, shared design system |
| **Monorepo (Nx)** | Powerful, computation caching | Steep learning curve | Large org, many teams |
| **Polyrepo** | Simple, independent, clear boundaries | Code duplication, coordination overhead | Independent apps, separate teams |

**Framework:**
```
Decision flow:

How many apps/packages?
├── 1 → Single repo (not monorepo)
├── 2-5 → Turborepo (simpler)
└── 5+ → Nx (more features)

Shared code between apps?
├── Lots → Monorepo (share packages)
├── Some → Monorepo or npm packages
└── None → Polyrepo fine

Team structure:
├── One team, multiple apps → Monorepo
├── Multiple teams, some overlap → Monorepo with ownership
└── Independent teams → Polyrepo

Turborepo setup (simpler):
apps/
├── web/          # Main website
├── admin/        # Admin dashboard
└── docs/         # Documentation

packages/
├── ui/           # Shared component library
├── config/       # Shared configs (ESLint, TS)
└── utils/        # Shared utilities

turbo.json:
{
  "pipeline": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false },
    "lint": {}
  }
}
```

**Default Recommendation:** Turborepo if you need a monorepo. It's simpler than Nx and sufficient for most use cases. Start with single repo and migrate if needed.

---

## Decision 10: Animation Library

**Context:** When implementing animations in your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **CSS/Tailwind** | Zero runtime, simple, performant | Limited capabilities | Simple transitions, micro-interactions |
| **Framer Motion** | Declarative, feature-rich, gestures | Large bundle (50KB+) | Complex animations, gestures, layout |
| **React Spring** | Physics-based, performant | Learning curve | Natural feeling animations |
| **GSAP** | Industry standard, powerful | Imperative, learning curve | Complex timelines, scroll effects |

**Framework:**
```
Animation needs assessment:

Micro-interactions (hover, focus, transitions)?
→ CSS/Tailwind (no library needed)

.button {
  transition: transform 150ms ease;
}
.button:hover {
  transform: scale(1.05);
}

Component mount/unmount animations?
→ Framer Motion (AnimatePresence)

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>

Layout animations (shared layout)?
→ Framer Motion (LayoutGroup)

Physics-based (springs, drag)?
→ React Spring or Framer Motion

Complex timelines, scroll-triggered?
→ GSAP

Bundle size sensitivity?
├── High → CSS only, or React Spring
└── Normal → Framer Motion fine

Default approach:
1. Start with CSS transitions
2. Add Framer Motion when needed
3. Use GSAP only for complex scroll/timelines
```

**Default Recommendation:** CSS for simple animations, Framer Motion when you need more. Don't add animation libraries preemptively.

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `api|backend|database|server` | backend | Frontend needs backend support |
| `design|mockup|figma|visual` | ui-design | Need design specifications |
| `deploy|ci|infrastructure` | devops | Frontend needs deployment |
| `test|e2e|coverage` | qa-engineering | Frontend needs testing strategy |

### Receives Work From

- **ui-design**: Design ready for implementation
- **ux-design**: UX patterns need implementation
- **backend**: API ready for frontend consumption
- **product-management**: Feature requires frontend work

### Works Well With

- ui-design
- ux-design
- backend
- devops
- qa-engineering

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/frontend/`

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
