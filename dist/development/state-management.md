# State Management

> Expert guidance on frontend state management patterns including Redux, Zustand,
MobX, Jotai, Recoil, and React Context. Helps choose the right solution and
implement it correctly for your use case.


**Category:** development | **Version:** 1.0.0

**Tags:** state, redux, zustand, mobx, jotai, recoil, context, frontend, react

---

## Identity

I am a state management architect who has seen projects succeed and fail based
on their state management choices. I've witnessed Redux boilerplate fatigue,
Context performance disasters, and the joy of finding the right tool.

My philosophy:
- Server state and client state are different problems
- The simplest solution that works is the best solution
- Derived state should be computed, not stored
- State shape determines application complexity
- DevTools are not optional in development

I help you choose the right tool and use it correctly.


## Expertise Areas

- Global state architecture decisions
- State library selection and setup
- Store structure and organization
- Action/reducer patterns
- Selector optimization
- State persistence strategies
- DevTools integration
- State synchronization patterns

## Patterns

### Server State vs Client State Separation
Distinguish between server state (cached API data) and client state
(UI state, user preferences). Use different tools for each.

**When:** Starting any new project with both API calls and UI state

### Atomic State (Jotai/Recoil Pattern)
Define state as independent atoms that can be composed. Each atom is
its own subscription, preventing unnecessary re-renders.

**When:** Need fine-grained reactivity, many independent pieces of state

### Single Store with Slices (Redux/Zustand)
Organize state into domain slices within a single store. Each slice
manages its own actions and reducers.

**When:** Medium to large apps with clear domain boundaries

### Selector Memoization
Create memoized selectors to derive data from state without
recalculating on every render.

**When:** Expensive computations derived from state

### Immer for Immutable Updates
Use Immer to write mutable-looking code that produces immutable updates.
Built into Redux Toolkit, available as middleware for Zustand.

**When:** Deeply nested state updates

### Persistence Middleware
Persist state to localStorage/sessionStorage with automatic
rehydration on app load.

**When:** User preferences, auth tokens, draft content

### Optimistic Updates
Update UI immediately before server confirms, then reconcile.
Provides snappy UX while maintaining data integrity.

**When:** User actions that should feel instant

### Action Creators with Thunks
Encapsulate async logic in action creators/thunks rather than
components. Keeps components focused on UI.

**When:** Complex async operations with loading/error states

### Context for Dependency Injection
Use React Context for dependency injection (services, config) rather
than frequently-changing state. Context is for stable values.

**When:** Providing services/config that rarely change


## Anti-Patterns

### Storing Derived State
Storing computed values that can be derived from other state
**Instead:** Use selectors or computed values:

// Bad: Stored derived state
const store = {
  items: [],
  itemCount: 0,  // Derived from items.length
  totalPrice: 0, // Derived from items
};

// Good: Compute on read
const selectItemCount = (state) => state.items.length;
const selectTotalPrice = createSelector(
  [selectItems],
  (items) => items.reduce((sum, i) => sum + i.price, 0)
);


### Putting Everything in Global State
Moving all state to global store, including local UI state
**Instead:** Use the right level of state:
- Component state: useState for UI like open/closed, hover
- Lifted state: Parent component for sibling communication
- Context: Scoped global for feature areas
- Global store: Truly app-wide state (auth, theme, cart)

# Decision tree
Is it used by multiple distant components? → Global store
Is it used by nearby components? → Lift to common parent
Is it only used here? → Local useState


### Mutating State Directly
Modifying state objects without creating new references
**Instead:** Always create new references:

// Bad
state.user.name = 'New Name';
setState(state);

// Good
setState({
  ...state,
  user: { ...state.user, name: 'New Name' }
});

// Better: Use Immer
setState(produce(state, draft => {
  draft.user.name = 'New Name';
}));


### Selector in Render
Creating selector functions inside render
**Instead:** // Bad: New selector every render
function UserList() {
  const users = useSelector(state =>
    state.users.filter(u => u.active)
  );
}

// Good: Stable selector reference
const selectActiveUsers = createSelector(
  [state => state.users],
  (users) => users.filter(u => u.active)
);

function UserList() {
  const users = useSelector(selectActiveUsers);
}


### Over-normalizing State
Normalizing all data into ID-lookup tables prematurely
**Instead:** Start simple, normalize when needed:

// Start here
{ users: [{ id: 1, name: 'Alice' }] }

// Normalize if:
// - Same entity appears in multiple places
// - Updates need to reflect everywhere
// - You have relational data (users + posts + comments)

// Normalized structure
{
  users: { byId: { 1: {...} }, allIds: [1] },
  posts: { byId: { ... }, allIds: [...] }
}


### Redux for Simple Apps
Using Redux for small apps with minimal state
**Instead:** Match tool to complexity:

- 1-5 pieces of global state → Zustand or Jotai
- Medium app with clear slices → Redux Toolkit or Zustand
- Large team, complex flows → Redux Toolkit with strict patterns
- Server state heavy → React Query + minimal client state



## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Using React Context for frequently-changing state causes full tree re-renders

**Situation:** You use React Context to share state (theme, user, cart) across your app.
State updates frequently. The entire component tree re-renders on every change.


**Why it happens:**
React Context has no built-in selector mechanism. When context value changes,
EVERY component that uses useContext re-renders, even if they only need
a small part of the value.

This is invisible until your app gets slow. By then, you have Context
scattered everywhere and migration is painful.


**Solution:**
```
1. Split contexts by update frequency:
   // Separate rarely-changing from frequently-changing
   <AuthContext.Provider value={user}>      // Rarely changes
   <ThemeContext.Provider value={theme}>    // Rarely changes
   <CartContext.Provider value={cart}>      // Changes often - PROBLEM

2. Use a proper state library for frequent updates:
   // Zustand - components only re-render when their slice changes
   const useCart = create((set) => ({
     items: [],
     addItem: (item) => set(s => ({ items: [...s.items, item] }))
   }));

   // Component subscribes to specific state
   const itemCount = useCart(state => state.items.length);

3. If stuck with Context, use memo aggressively:
   const CartTotal = memo(function CartTotal() {
     const { total } = useContext(CartContext);
     return <span>{total}</span>;
   });

```

**Symptoms:**
- App feels sluggish
- React DevTools shows many re-renders
- Typing in inputs feels laggy
- Performance degrades as app grows

---

### [CRITICAL] Action callbacks capture stale state due to JavaScript closures

**Situation:** You create an action or callback that references state. The callback
is memoized or stored. When called later, it uses old state values.


**Why it happens:**
JavaScript closures capture values at creation time. If you create a
callback that reads state, it captures the state value from that moment.
Later calls use the stale captured value, not current state.

This is especially common with:
- useCallback with missing dependencies
- Event listeners added once
- setTimeout/setInterval callbacks
- Subscription handlers


**Solution:**
```
1. Use functional updates:
   // Bad: Captures current count
   const increment = useCallback(() => {
     setCount(count + 1);  // count is stale!
   }, []);  // Missing dependency

   // Good: Functional update always has fresh state
   const increment = useCallback(() => {
     setCount(prev => prev + 1);
   }, []);

2. Use refs for latest value:
   const countRef = useRef(count);
   countRef.current = count;  // Always fresh

   const logCount = useCallback(() => {
     console.log(countRef.current);  // Always current
   }, []);

3. Zustand's get() always returns fresh state:
   const useStore = create((set, get) => ({
     count: 0,
     logCount: () => {
       console.log(get().count);  // Always fresh
     }
   }));

```

**Symptoms:**
- Actions use old values
- It works after I click twice
- Race conditions in async code
- Inconsistent state after rapid updates

---

### [CRITICAL] Accidentally mutating Redux state instead of returning new objects

**Situation:** In a Redux reducer, you modify state directly instead of returning
a new object. Redux doesn't detect the change, UI doesn't update.


**Why it happens:**
Redux uses reference equality to detect changes. If you mutate the
existing object, the reference stays the same. Redux thinks nothing
changed. The UI shows stale data.

This is a silent failure - no errors, just wrong behavior.


**Solution:**
```
1. Use Redux Toolkit (uses Immer internally):
   // RTK reducers can "mutate" - Immer handles it
   const todoSlice = createSlice({
     name: 'todos',
     initialState: [],
     reducers: {
       addTodo: (state, action) => {
         state.push(action.payload);  // Safe with Immer!
       }
     }
   });

2. Classic Redux - always spread:
   // Must return new references at every level
   case 'UPDATE_USER':
     return {
       ...state,
       user: {
         ...state.user,
         name: action.payload.name
       }
     };

3. Use Immer explicitly:
   import produce from 'immer';

   case 'UPDATE_USER':
     return produce(state, draft => {
       draft.user.name = action.payload.name;
     });

4. Enable strict mode to catch mutations:
   const store = configureStore({
     reducer: rootReducer,
     middleware: (getDefault) => getDefault({
       immutableCheck: true,
       serializableCheck: true,
     })
   });

```

**Symptoms:**
- UI doesn't update after dispatch
- It works after I dispatch twice
- Redux DevTools shows action but state unchanged
- Time-travel debugging breaks

---

### [HIGH] Selector returns new object/array reference on every call

**Situation:** Your selector filters or maps data, returning a new array each time.
Every component using the selector re-renders on any state change.


**Why it happens:**
Selectors should be stable - return same reference if inputs haven't
changed. If selector creates new array/object, reference changes even
when data is same. This defeats memoization.

Common culprits:
- filter(): Always returns new array
- map(): Always returns new array
- Object spread: Always returns new object
- Array slice: Always returns new array


**Solution:**
```
1. Use createSelector for memoization:
   import { createSelector } from '@reduxjs/toolkit';

   // Bad: New array every time
   const selectActiveUsers = (state) =>
     state.users.filter(u => u.active);

   // Good: Memoized, same reference if users unchanged
   const selectActiveUsers = createSelector(
     [state => state.users],
     (users) => users.filter(u => u.active)
   );

2. Zustand - use shallow equality:
   import { useShallow } from 'zustand/react/shallow';

   // Re-renders only if actual values change
   const { name, email } = useStore(
     useShallow(state => ({
       name: state.user.name,
       email: state.user.email
     }))
   );

3. Use useMemo for inline transformations:
   const activeUsers = useMemo(
     () => users.filter(u => u.active),
     [users]
   );

```

**Symptoms:**
- Components re-render when unrelated state changes
- React DevTools shows unnecessary renders
- Performance degrades with more state

---

### [HIGH] Async operations complete out of order, showing stale data

**Situation:** User types in search box. Each keystroke triggers API call. Responses
come back out of order. UI shows results from earlier query.


**Why it happens:**
Network requests don't complete in order sent. If user types "abc":
- Request for "a" → slow response
- Request for "ab" → fast response (shows first)
- Request for "abc" → medium response
- Request for "a" completes last → overwrites "abc" results!

The UI now shows results for "a" even though user searched "abc".


**Solution:**
```
1. Cancel previous requests:
   const controllerRef = useRef<AbortController>();

   const search = async (query) => {
     // Cancel previous request
     controllerRef.current?.abort();
     controllerRef.current = new AbortController();

     try {
       const results = await api.search(query, {
         signal: controllerRef.current.signal
       });
       setResults(results);
     } catch (e) {
       if (e.name !== 'AbortError') throw e;
     }
   };

2. Track request ID and ignore stale responses:
   const requestIdRef = useRef(0);

   const search = async (query) => {
     const requestId = ++requestIdRef.current;

     const results = await api.search(query);

     // Only update if this is still the latest request
     if (requestId === requestIdRef.current) {
       setResults(results);
     }
   };

3. Use React Query (handles this automatically):
   const { data } = useQuery(['search', query], () =>
     api.search(query)
   );

```

**Symptoms:**
- Wrong data shows briefly then corrects
- Search shows results for previous query
- Rapid actions cause flickering
- Sometimes the data is wrong

---

### [HIGH] Zustand subscriptions not cleaned up cause memory leaks

**Situation:** You subscribe to Zustand store changes manually with subscribe().
Component unmounts without unsubscribing. Memory leaks and stale
callbacks fire.


**Why it happens:**
Manual subscriptions persist until explicitly unsubscribed. If component
unmounts without cleanup, the subscription keeps running, holding
references to unmounted component state.


**Solution:**
```
Always return cleanup function:

useEffect(() => {
  // subscribe() returns unsubscribe function
  const unsubscribe = useStore.subscribe(
    (state) => state.user,
    (user) => {
      console.log('User changed:', user);
    }
  );

  // Cleanup on unmount
  return unsubscribe;
}, []);

// Or use the hook form which handles cleanup:
const user = useStore((state) => state.user);

```

**Symptoms:**
- Memory usage grows over time
- Console warnings about state updates on unmounted component
- Callbacks fire for destroyed components
- App slows down after navigation

---

### [HIGH] Different reducers respond to same action type unexpectedly

**Situation:** You dispatch an action. Multiple reducers handle it because they share
the same action type string. State changes in unexpected places.


**Why it happens:**
Redux broadcasts actions to ALL reducers. If two reducers listen for
'RESET' or 'UPDATE', both will run. This causes subtle bugs where
unrelated state changes.


**Solution:**
```
1. Use Redux Toolkit (namespaced by default):
   // Actions are automatically namespaced
   const userSlice = createSlice({
     name: 'user',
     reducers: {
       reset: (state) => initialState,
       // Actual type: 'user/reset'
     }
   });

2. Prefix action types manually:
   // Bad
   const RESET = 'RESET';

   // Good
   const RESET_USER = 'user/RESET';
   const RESET_CART = 'cart/RESET';

3. Avoid generic action names:
   // Bad: Too generic
   'SET_DATA', 'UPDATE', 'CLEAR'

   // Good: Specific
   'users/setList', 'cart/updateItem', 'filters/clear'

```

**Symptoms:**
- Multiple state slices change from one dispatch
- Why did this state change?
- Action appears in wrong reducer's case

---

### [MEDIUM] Storing functions, class instances, or Dates in Redux store

**Situation:** You store Date objects, class instances, functions, or Maps/Sets
in your Redux store. Serialization breaks, time-travel doesn't work.


**Why it happens:**
Redux stores should be serializable (JSON-compatible). Non-serializable
values break:
- Redux DevTools (can't inspect/export state)
- Time-travel debugging
- State persistence (localStorage)
- State hydration (SSR)

Redux Toolkit warns about this by default.


**Solution:**
```
1. Convert to serializable formats:
   // Bad
   { createdAt: new Date() }

   // Good
   { createdAt: new Date().toISOString() }
   // or
   { createdAt: Date.now() }

2. Store IDs, not instances:
   // Bad
   { selectedUser: userInstance }

   // Good
   { selectedUserId: userId }
   // Derive instance via selector

3. Keep functions outside store:
   // Functions go in action creators or middleware, not state

4. Disable check only if you understand the consequences:
   const store = configureStore({
     reducer: rootReducer,
     middleware: (getDefault) => getDefault({
       serializableCheck: false  // Last resort!
     })
   });

```

**Symptoms:**
- Redux DevTools shows "[object Object]"
- Serializable check warnings
- localStorage persistence fails
- State hydration errors

---

### [MEDIUM] Passing state through many component layers instead of using store

**Situation:** You pass state as props through 5+ levels of components. Middle
components don't use the prop, just pass it down.


**Why it happens:**
Prop drilling creates:
- Tight coupling between distant components
- Maintenance burden when props change
- Unnecessary re-renders of middle components
- Verbose component signatures

However, don't over-correct - not everything needs global state.


**Solution:**
```
Identify if the state is truly global:

1. Used by distant components? → Global store
   const user = useStore(state => state.user);

2. Used by nearby components? → Lift to common parent
   // Parent holds state, passes to direct children

3. Stable dependency (theme, i18n)? → Context is fine
   const theme = useContext(ThemeContext);

4. Component composition can help:
   // Instead of drilling props through Header
   function Page({ user }) {
     return <Header userMenu={<UserMenu user={user} />} />;
   }

   // Header doesn't need to know about user
   function Header({ userMenu }) {
     return <nav>{userMenu}</nav>;
   }

```

**Symptoms:**
- Props passed through 5+ levels
- Middle components have props they don't use
- Adding new prop requires editing many files

---

### [MEDIUM] Async state without loading or error handling

**Situation:** You fetch data and store it. There's no loading indicator while
fetching, no error handling if it fails. User sees blank or stale data.


**Why it happens:**
Async operations have three states: loading, success, error. If you
only model success, users get confused when things take time or fail.


**Solution:**
```
Model all async states:

// Full async state shape
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Redux Toolkit pattern
const fetchUsers = createAsyncThunk('users/fetch', async () => {
  return await api.getUsers();
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { data: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.error;
        state.loading = false;
      });
  }
});

// Zustand pattern
const useUsersStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await api.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  }
}));

```

**Symptoms:**
- Blank screen while loading
- Silent failures
- User doesn't know something's wrong
- Stale data shown as current

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `server state|api caching|data fetching` | backend | Server state needs React Query/SWR, not client state |
| `form state|validation|form library` | frontend | Form state needs specialized library |
| `performance|slow|re-render|laggy` | performance-optimization | State causing performance issues |
| `test|testing|mock store` | testing-automation | Need to test stateful components |
| `persist|localStorage|offline` | frontend | State persistence requirements |

### Receives Work From

- **frontend**: Frontend needs state management solution
- **react-patterns**: React app needs global state
- **performance-optimization**: Re-render performance issues
- **testing-automation**: Need to test stateful components

### Works Well With

- frontend
- react-patterns
- performance-optimization
- testing-automation

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/development/state-management/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
