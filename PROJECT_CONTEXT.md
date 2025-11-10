# @core-erp/entity - Project Context & Architecture

**Last Updated:** 2025-01-10  
**Package Version:** 1.0.0  
**Status:** 🟢 Production Ready  
**Type:** Shared NPM Package (Private)

---

## 📖 Project Overview

### What is @core-erp/entity?

**@core-erp/entity** is a foundational shared package that provides core entity management, database utilities, and authentication infrastructure for the Core ERP ecosystem. It's designed to be:

- **Configurable**: Zero environment variables - all configuration passed explicitly
- **Reusable**: Used by multiple applications (core-erp, plugins, tools)
- **Type-safe**: 100% TypeScript with comprehensive type exports
- **Modular**: Tree-shakeable exports for optimal bundle sizes
- **Production-ready**: Battle-tested with real-world usage

### Purpose & Vision

This package serves as the **single source of truth** for:
1. Database schema and types
2. Authentication and authorization logic
3. Permission system
4. Core entity operations (users, roles, permissions)
5. Supabase client configuration
6. Edge Functions for business logic

**Design Goal**: Enable multiple applications to share the same Supabase backend while maintaining clean separation of concerns and avoiding code duplication.

### Who Uses This Package?

- **core-erp**: Main ERP application
- **plugin-erp/***: All plugin packages
- **admin-tools**: Administrative utilities
- **future applications**: Any app needing core ERP functionality

---

## 🏗️ Architecture & Design Principles

### 1. Configuration Over Convention

**Core Principle**: This package NEVER reads environment variables directly.

#### Why?

Different applications may:
- Use different Supabase instances
- Have different configuration sources
- Run in different environments
- Need different initialization strategies

#### How It Works

```typescript
// ❌ WRONG - Don't do this in core-entity
const url = process.env.VITE_SUPABASE_URL
const supabase = createClient(url, key)

// ✅ CORRECT - Accept configuration from consumer
export function createSupabaseClient(config: SupabaseConfig) {
  return createClient(config.url, config.anonKey, config.options)
}

// In consuming app (e.g., core-erp)
const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
```

### 2. Provider-Based Architecture

All configuration flows through React Context providers.

```typescript
<SupabaseProvider client={configuredSupabaseClient}>
  <AuthProvider 
    supabaseClient={configuredSupabaseClient} 
    toast={toastFunction}
  >
    <App />
  </AuthProvider>
</SupabaseProvider>
```

**Benefits:**
- Explicit configuration flow
- Easy to test (mock providers)
- No global state
- Tree-shakeable

### 3. Zero Side Effects

The package has no side effects on import:
- No automatic initialization
- No global singletons
- No automatic API calls
- Everything must be explicitly configured

```typescript
// Just importing doesn't do anything
import { createSupabaseClient } from '@core-erp/entity'

// You must explicitly configure
const supabase = createSupabaseClient(config)
```

### 4. Peer Dependencies

React and React Query are peer dependencies to avoid version conflicts.

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0"
  }
}
```

**Why:** Let consuming applications control versions to avoid conflicts.

### 5. TypeScript First

- 100% TypeScript
- Strict mode enabled
- Comprehensive type exports
- Generated `.d.ts` files

```typescript
// All types are exported
import type { 
  User, 
  Role, 
  Permission, 
  TypedSupabaseClient 
} from '@core-erp/entity'
```

---

## 📁 Package Structure

### Directory Layout

```
core-entity/
├── src/                            # Source code
│   ├── index.ts                    # Main exports
│   ├── types/                      # TypeScript types
│   │   ├── database.ts             # Database entity types
│   │   └── config.ts               # Configuration types
│   ├── lib/                        # Utilities
│   │   ├── supabase.ts             # Client factory
│   │   ├── permissions.ts          # Permission checking
│   │   ├── constants.ts            # Constants
│   │   └── authRetry.ts            # Retry logic
│   ├── schemas/                    # Zod validation
│   │   ├── user.ts
│   │   ├── role.ts
│   │   ├── permission.ts
│   │   ├── audit.ts
│   │   └── index.ts
│   ├── contexts/                   # React contexts
│   │   ├── AuthContext.tsx         # Auth + permissions
│   │   ├── SupabaseContext.tsx     # Client provider
│   │   └── index.ts
│   └── hooks/                      # React Query hooks
│       ├── useAuth.ts
│       ├── useUsers.ts
│       ├── useRoles.ts
│       ├── usePermissions.ts
│       ├── useNetworkStatus.ts
│       ├── useSessionManagement.ts
│       └── index.ts
├── supabase/                       # Database & Functions
│   ├── migrations/                 # SQL migrations
│   └── functions/                  # Edge Functions (Deno)
├── dist/                           # Built package
├── docs/                           # Documentation
│   ├── guides/
│   ├── api/
│   ├── architecture/
│   └── examples/
├── .cursor/rules/                  # AI assistant rules
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
├── README.md
├── PROJECT_CONTEXT.md              # This file
├── DOCUMENTATION.md
└── MIGRATION_SUMMARY.md
```

### Export Structure

The package provides granular exports for optimal tree-shaking:

```typescript
// Main barrel export
export * from './types/database'
export * from './types/config'
export * from './schemas'
export * from './lib/permissions'
export * from './lib/constants'
export * from './contexts'
export * from './hooks'
export { createSupabaseClient } from './lib/supabase'
export { withRetry, createRetryWrapper } from './lib/authRetry'
```

---

## 🗄️ Database Schema

### Overview

The package manages 7 core tables that power the authentication and authorization system.

### Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└─────┬───────┘
      │
      │ 1
      │
      │ N
┌─────▼───────────┐
│  user_roles     │
└─────┬───────────┘
      │
      │ N
      │
      │ 1
┌─────▼────────────┐         ┌──────────────────┐
│     roles        │◄────────┤ role_permissions │
└──────────────────┘    1  N └────────┬─────────┘
                                      │
                                      │ N
                                      │
                                      │ 1
                              ┌───────▼──────────┐
                              │   permissions    │
                              └──────────────────┘

┌──────────────┐
│  audit_log   │  (tracks all actions)
└──────────────┘

┌──────────────┐
│ translations │  (i18n strings)
└──────────────┘
```

### Table Descriptions

#### 1. users

User profiles (separate from Supabase auth.users for flexibility).

```typescript
interface User {
  id: string                    // UUID primary key
  auth_user_id: string          // Links to auth.users(id)
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  status: 'active' | 'inactive' | 'suspended'
  locale: string                // e.g., 'en', 'th'
  created_at: string
  updated_at: string
}
```

**Why separate from auth.users?**
- More flexible schema
- Can add custom fields
- RLS policies easier to manage
- Can soft-delete without affecting auth

#### 2. roles

Role definitions with hierarchical levels.

```typescript
interface Role {
  id: string                    // UUID primary key
  code: string                  // Unique: 'superadmin', 'admin', 'user'
  name: string                  // Display name
  level: number                 // Hierarchy: 0-100
  is_system: boolean            // Protected system roles
  created_at: string
  updated_at: string
}
```

**Default System Roles:**
- `superadmin` (level 100) - Full access, cannot be deleted
- `admin` (level 50) - Administrative access
- `user` (level 10) - Standard access

**Level System:**
- Higher level = more permissions typically
- Used for role hierarchy (can't manage higher-level roles)
- Custom roles can be created at any level

#### 3. permissions

Granular permission definitions.

```typescript
interface Permission {
  id: string                    // UUID primary key
  code: string                  // Unique: 'users:create', 'roles:edit'
  name: string                  // Display name
  description: string           // What this permission allows
  category: string              // Group: 'users', 'roles', 'system'
  created_at: string
}
```

**Permission Format:** `resource:action`

**Examples:**
- `users:view`, `users:create`, `users:edit`, `users:delete`, `users:manage_roles`
- `roles:view`, `roles:create`, `roles:edit`, `roles:delete`
- `permissions:view`, `permissions:assign`
- `system:configure`, `system:audit`

#### 4. user_roles

Many-to-many junction: users ↔ roles.

```typescript
interface UserRole {
  user_id: string               // FK to users(id)
  role_id: string               // FK to roles(id)
  assigned_by: string           // FK to users(id)
  assigned_at: string
  // Composite primary key: (user_id, role_id)
}
```

**Key Points:**
- Users can have multiple roles
- Effective permissions = union of all role permissions
- Tracks who assigned the role and when

#### 5. role_permissions

Many-to-many junction: roles ↔ permissions.

```typescript
interface RolePermission {
  role_id: string               // FK to roles(id)
  permission_id: string         // FK to permissions(id)
  // Composite primary key: (role_id, permission_id)
}
```

Defines which permissions each role has.

#### 6. audit_log

Tracks all important actions for compliance and debugging.

```typescript
interface AuditLog {
  id: string                    // UUID primary key
  user_id: string               // FK to users(id)
  action: string                // 'create', 'update', 'delete', 'login', etc.
  resource: string              // 'user', 'role', 'permission'
  resource_id: string | null    // ID of affected resource
  changes: object | null        // JSON: before/after
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
```

**Use Cases:**
- Security auditing
- Debugging user actions
- Compliance requirements
- Understanding system usage

#### 7. translations

Localization strings stored in database.

```typescript
interface Translation {
  id: string                    // UUID primary key
  key: string                   // e.g., 'common.save', 'users.title'
  locale: string                // e.g., 'en', 'th'
  value: string                 // Translated text
  created_at: string
  updated_at: string
  // Unique: (key, locale)
}
```

**Benefits:**
- Dynamic translations without redeployment
- Easy to add new languages
- Can be managed via UI
- Shared across all applications

---

## 🔐 Security & Permission System

### Permission Resolution Flow

```
1. User logs in
2. Fetch user's roles from user_roles
3. For each role, fetch permissions from role_permissions
4. Union all permissions (deduplicate)
5. Store in AuthContext
6. Check permissions on every protected action
```

### Permission Checking Functions

#### hasPermission

Check if user has a specific permission.

```typescript
const { hasPermission } = useAuth()

if (hasPermission('users:create')) {
  // Show create button
}
```

#### hasAnyPermission

Check if user has ANY of the specified permissions.

```typescript
const { hasAnyPermission } = useAuth()

if (hasAnyPermission(['users:edit', 'users:delete'])) {
  // Show actions menu
}
```

#### hasAllPermissions

Check if user has ALL of the specified permissions.

```typescript
const { hasAllPermissions } = useAuth()

if (hasAllPermissions(['users:view', 'users:edit'])) {
  // Can both view and edit
}
```

### Security Layers

#### Layer 1: Row Level Security (RLS)

Database-level security (first line of defense).

```sql
-- Example: Users can only see active users
CREATE POLICY "Users can view active users" ON users
  FOR SELECT
  USING (status = 'active' AND auth.uid() IS NOT NULL);
```

#### Layer 2: Edge Functions

Server-side logic using service_role key (bypasses RLS when needed).

```typescript
// create-user Edge Function
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY  // Has admin access
)

// Create auth user
const { data: authUser } = await supabase.auth.admin.createUser(...)

// Create profile
await supabase.from('users').insert(...)
```

#### Layer 3: Client Permission Checks

UX layer - shows/hides UI elements.

```typescript
{hasPermission('users:create') && (
  <Button onClick={createUser}>Create User</Button>
)}
```

**Important:** Client checks are UX only. Real security is RLS + Edge Functions.

---

## 🔧 Core Features & APIs

### 1. Supabase Client Factory

```typescript
import { createSupabaseClient } from '@core-erp/entity'

const supabase = createSupabaseClient({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
})
```

Returns a fully typed Supabase client: `TypedSupabaseClient`.

### 2. Authentication Context

Provides authentication state and permission checking.

```typescript
import { AuthProvider, useAuth } from '@core-erp/entity'

// In app setup
<AuthProvider supabaseClient={supabase} toast={toast}>
  <App />
</AuthProvider>

// In components
const {
  user,                   // Current user
  profile,                // User profile
  permissions,            // Array of permission codes
  isLoading,              // Loading state
  hasPermission,          // Check permission
  hasAnyPermission,       // Check any
  hasAllPermissions,      // Check all
  signOut                 // Logout function
} = useAuth()
```

### 3. Entity Hooks

React Query hooks for CRUD operations.

#### useUsers

```typescript
import { useUsers } from '@core-erp/entity'

const {
  data: users,            // Array of users
  isLoading,              // Loading state
  error,                  // Error state
  refetch                 // Refetch function
} = useUsers()
```

#### useRoles

```typescript
import { useRoles } from '@core-erp/entity'

const {
  data: roles,
  isLoading,
  createRole,             // Mutation
  updateRole,             // Mutation
  deleteRole              // Mutation
} = useRoles()
```

#### usePermissions

```typescript
import { usePermissions } from '@core-erp/entity'

const {
  data: permissions,
  isLoading,
  getUserPermissions,     // Get permissions for user
  getRolePermissions      // Get permissions for role
} = usePermissions()
```

### 4. Validation Schemas

Zod schemas for runtime validation.

```typescript
import { userSchema, roleSchema, permissionSchema } from '@core-erp/entity'

// Validate user input
const result = userSchema.safeParse(formData)
if (!result.success) {
  console.error(result.error)
}

// Use with React Hook Form
const form = useForm({
  resolver: zodResolver(userSchema)
})
```

### 5. Permission Utilities

Standalone permission checking functions.

```typescript
import { hasPermission, checkPermissions } from '@core-erp/entity'

// Check single permission
if (hasPermission(userPermissions, 'users:create')) {
  // Allow action
}

// Check multiple with options
const result = checkPermissions(userPermissions, {
  required: ['users:view'],
  any: ['users:edit', 'users:delete']
})
```

### 6. Session Management

Handle cross-tab session synchronization.

```typescript
import { useSessionManagement } from '@core-erp/entity'

// Automatically keeps sessions in sync across tabs
useSessionManagement()
```

### 7. Network Status

Monitor online/offline status.

```typescript
import { useNetworkStatus } from '@core-erp/entity'

const { isOnline } = useNetworkStatus()

{!isOnline && <OfflineWarning />}
```

---

## 🚀 Edge Functions

### Overview

Edge Functions are serverless Deno functions that run on Supabase edge servers.

**Location:** `supabase/functions/`

**Runtime:** Deno (TypeScript)

**Why Edge Functions:**
- Use service_role key (bypass RLS when needed)
- Centralize business logic
- Audit sensitive operations
- Complex operations requiring multiple tables

### Available Functions

#### 1. create-user

Creates auth user + profile + assigns roles.

```typescript
// Request
POST /functions/v1/create-user
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "roleIds": ["role-id-1", "role-id-2"]
}

// Response
{
  "user": { ...userProfile },
  "authUser": { ...authUserData }
}
```

#### 2. update-user

Updates user profile and optionally roles.

```typescript
// Request
POST /functions/v1/update-user
{
  "userId": "user-id",
  "updates": {
    "name": "Jane Doe",
    "phone": "+0987654321"
  }
}
```

#### 3. assign-roles

Assigns or removes roles from user.

```typescript
// Request
POST /functions/v1/assign-roles
{
  "userId": "user-id",
  "roleIds": ["role-id-1", "role-id-2"]
}
```

**Security:** Validates requesting user has `users:manage_roles` permission.

#### 4. get-user-permissions

Calculates all permissions for a user.

```typescript
// Request
POST /functions/v1/get-user-permissions
{
  "userId": "user-id"
}

// Response
{
  "permissions": ["users:view", "users:create", "roles:view", ...]
}
```

**Optimization:** Could be cached for performance.

#### 5. update-user-locale

Updates user's locale preference.

```typescript
// Request
POST /functions/v1/update-user-locale
{
  "locale": "th"
}
```

### Shared Utilities

#### CORS Headers

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## 📦 Build & Distribution

### Build Process

```bash
npm run build
```

**Steps:**
1. TypeScript compilation (`tsc`)
2. Vite library bundling
3. Type definition generation (`.d.ts`)

**Output:**
```
dist/
├── index.js              # Bundled code (ESM)
├── index.js.map          # Source map
├── index.d.ts            # Type definitions
└── [other files].d.ts    # Individual type files
```

### Package Configuration

```json
{
  "name": "@core-erp/entity",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "supabase"
  ]
}
```

**Key Points:**
- ESM only (no CommonJS)
- Type definitions included
- Supabase files included (migrations, functions)

### Publishing

```bash
# 1. Build
npm run build

# 2. Test in consuming app
cd ../core-erp
npm install file:../core-entity

# 3. Publish to private registry
npm publish --registry=https://your-private-registry.com
```

### Versioning

Follow semantic versioning (semver):

- **Patch** (1.0.1): Bug fixes, no API changes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

---

## 🎯 Usage in Consuming Applications

### Installation

```bash
# Local development
npm install file:../core-entity

# From private registry
npm install @core-erp/entity
```

### Setup (Step-by-Step)

#### Step 1: Create Supabase Client

```typescript
// src/lib/supabase.ts
import { createSupabaseClient } from '@core-erp/entity'

export const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL!,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
})
```

#### Step 2: Setup Providers

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider, AuthProvider } from '@core-erp/entity'
import { toast } from 'sonner'
import { supabase } from './lib/supabase'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider client={supabase}>
        <AuthProvider supabaseClient={supabase} toast={toast}>
          <App />
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
```

#### Step 3: Use in Components

```typescript
// src/pages/Users.tsx
import { useAuth, useUsers, type User } from '@core-erp/entity'

export function UsersPage() {
  const { hasPermission } = useAuth()
  const { data: users, isLoading } = useUsers()

  if (!hasPermission('users:view')) {
    return <AccessDenied />
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div>
      <h1>Users</h1>
      {users?.map((user: User) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

---

## 🧪 Testing Strategy

### Type Checking

```bash
npm run type-check
```

Ensures all TypeScript types are valid.

### Integration Testing

Test in a consuming application:

```bash
# Build package
cd core-entity
npm run build

# Install in core-erp
cd ../core-erp
npm install file:../core-entity

# Test functionality
npm run dev
```

### Manual Testing Checklist

- [ ] Authentication flow works
- [ ] Permission checking is accurate
- [ ] All hooks return correct data
- [ ] Supabase client functions properly
- [ ] Edge Functions can be invoked
- [ ] Types are exported and usable
- [ ] No runtime errors
- [ ] Build completes successfully

---

## 📚 Documentation

### Complete Documentation

- **README.md** - Quick start and overview
- **PROJECT_CONTEXT.md** - This file (architecture)
- **DOCUMENTATION.md** - Documentation index
- **MIGRATION_SUMMARY.md** - Migration from core-erp
- **docs/guides/** - How-to guides
- **docs/api/** - API reference
- **docs/architecture/** - Architecture details
- **docs/examples/** - Code examples
- **.cursor/rules/** - AI assistant context

---

## 🔄 Maintenance & Updates

### Adding New Features

1. Update source code in `src/`
2. Update types in `src/types/`
3. Add validation schema if needed
4. Export from `src/index.ts`
5. Build and test
6. Update documentation
7. Bump version
8. Publish

### Handling Breaking Changes

1. Mark old API as deprecated
2. Provide migration guide
3. Update all examples
4. Bump major version
5. Communicate to users
6. Publish

### Bug Fixes

1. Fix the issue
2. Test in consuming app
3. Update documentation if needed
4. Bump patch version
5. Publish

---

## ⚠️ Important Considerations

### Do's ✅

- ✅ Accept all configuration as parameters
- ✅ Use TypeScript strict mode
- ✅ Export all public types
- ✅ Document breaking changes
- ✅ Test in consuming apps before publishing
- ✅ Follow semantic versioning
- ✅ Keep peer dependencies minimal

### Don'ts ❌

- ❌ Read environment variables
- ❌ Create global singletons
- ❌ Have side effects on import
- ❌ Bundle React or React Query
- ❌ Skip documentation updates
- ❌ Make breaking changes in minor versions
- ❌ Forget to test before publishing

---

## 🎓 Migration History

This package was extracted from `core-erp` to enable code sharing across multiple applications. See `MIGRATION_SUMMARY.md` for complete details.

**Key Changes:**
- Supabase client became a factory function
- AuthContext accepts configuration props
- All environment variable reads removed
- Hooks use SupabaseContext for client access
- Migrations and Edge Functions moved to this package

---

## 📊 Package Stats

- **Total Exports:** 40+
- **TypeScript Types:** 30+
- **React Hooks:** 6
- **Context Providers:** 2
- **Validation Schemas:** 4
- **Edge Functions:** 5
- **Database Tables:** 7

---

## 🚀 Future Enhancements

### Planned Features

- [ ] Plugin entity management
- [ ] File attachment utilities
- [ ] Real-time subscriptions helper
- [ ] Advanced caching strategies
- [ ] Offline support utilities
- [ ] Data export/import helpers

### Nice to Have

- [ ] GraphQL support
- [ ] REST API client
- [ ] WebSocket utilities
- [ ] Testing utilities/mocks
- [ ] Storybook for hooks

---

**Status**: ✅ Production Ready  
**Maintainers**: Core ERP Team  
**Last Updated**: 2025-01-10  
**Next Review**: 2025-02-10

