# @core-erp/entity

> Core entity management, database types, and Supabase utilities for the Core ERP ecosystem.

## 📖 What is @core-erp/entity?

**@core-erp/entity** is a shared npm package that provides the foundation for all Core ERP applications. It centralizes:

- 🗄️ **Database Types** - TypeScript types for all core entities (User, Role, Permission, etc.)
- 🔧 **Supabase Client Factory** - Configurable Supabase client creation
- ✅ **Validation Schemas** - Zod schemas for runtime data validation
- 🔑 **Permission System** - Utilities for granular access control
- 🪝 **React Hooks** - Hooks for data fetching and mutations (TanStack React Query)
- 🔐 **Auth Context** - Authentication and authorization management
- 📊 **Database Migrations** - SQL schema migrations
- ⚡ **Edge Functions** - Supabase Edge Functions (Deno)

### Design Philosophy

**Configuration Over Convention**: This package NEVER reads environment variables directly. All configuration (Supabase URL, keys, options) must be provided by the consuming application.

**Why?** Multiple applications can use this package with different Supabase instances while maintaining clean separation of concerns.

## Installation

```bash
npm install @core-erp/entity
```

## Usage

### 1. Create Supabase Client

```typescript
import { createSupabaseClient } from '@core-erp/entity'

const supabase = createSupabaseClient({
  url: process.env.VITE_SUPABASE_URL,
  anonKey: process.env.VITE_SUPABASE_ANON_KEY,
})
```

### 2. Wrap Your App with Providers

```typescript
import { SupabaseProvider, AuthProvider } from '@core-erp/entity'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider client={supabase}>
        <AuthProvider supabaseClient={supabase}>
          {/* Your app */}
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}
```

### 3. Use Hooks

```typescript
import { useAuth, useUsers } from '@core-erp/entity'

function MyComponent() {
  const { user, hasPermission } = useAuth()
  const { data: users, isLoading } = useUsers()

  if (!hasPermission('users:view')) {
    return <div>Access denied</div>
  }

  // Use users data
}
```

## 📁 Package Structure

```
@core-erp/entity/
├── src/
│   ├── types/              # Database & config types
│   ├── lib/                # Utilities (client factory, permissions)
│   ├── schemas/            # Zod validation schemas
│   ├── contexts/           # React contexts (Auth, Supabase)
│   └── hooks/              # React Query hooks
├── supabase/
│   ├── migrations/         # Database schema (7 tables)
│   └── functions/          # Edge Functions (5 functions)
├── dist/                   # Built package
└── docs/                   # Documentation
```

## 🗄️ Database Schema

### Core Tables (7)

The package manages these core tables:

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | User profiles | Links to auth.users, includes name, email, phone, status, locale |
| **roles** | Role definitions | Hierarchical (level 0-100), system vs custom roles |
| **permissions** | Permission codes | `resource:action` format (e.g., `users:create`) |
| **user_roles** | Users ↔ Roles | Many-to-many with assignment tracking |
| **role_permissions** | Roles ↔ Permissions | Defines role capabilities |
| **audit_log** | Action tracking | Complete audit trail with changes JSON |
| **translations** | Localization | Database-backed i18n strings |

### Permission Resolution

```
User → user_roles → roles → role_permissions → permissions
```

Users can have multiple roles. Effective permissions = **union** of all role permissions.

## ⚡ Edge Functions

### Available Functions (5)

| Function | Purpose | Security |
|----------|---------|----------|
| **create-user** | Create auth user + profile + roles | Requires `users:create` |
| **update-user** | Update user information | Requires `users:edit` |
| **assign-roles** | Assign/remove user roles | Requires `users:manage_roles` |
| **get-user-permissions** | Calculate user's permissions | Authenticated only |
| **update-user-locale** | Change user's language | Own profile or admin |

All functions use `service_role` key for database operations and include comprehensive audit logging.

## 🎯 Key Features

### 1. Type-Safe Supabase Client

```typescript
const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})

// Returns TypedSupabaseClient with full type inference
```

### 2. Permission Checking

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

// Check single
if (hasPermission('users:create')) { /* ... */ }

// Check any
if (hasAnyPermission(['users:edit', 'users:delete'])) { /* ... */ }

// Check all
if (hasAllPermissions(['users:view', 'users:edit'])) { /* ... */ }
```

### 3. Entity Hooks

```typescript
// Users
const { data: users } = useUsers()

// Roles
const { data: roles, createRole, updateRole } = useRoles()

// Permissions
const { data: permissions, getUserPermissions } = usePermissions()

// All hooks use TanStack React Query for caching and real-time updates
```

### 4. Validation Schemas

```typescript
import { userSchema, roleSchema } from '@core-erp/entity'

// Validate data
const result = userSchema.safeParse(formData)

// Use with React Hook Form
const form = useForm({
  resolver: zodResolver(userSchema)
})
```

### 5. Session Management

```typescript
// Automatic cross-tab session sync
import { useSessionManagement } from '@core-erp/entity'

function App() {
  useSessionManagement()
  // Sessions now stay in sync across all tabs
}
```

## 🚀 Setup in New Project

### Step 1: Install Dependencies

```bash
npm install @core-erp/entity @tanstack/react-query @supabase/supabase-js zod
```

### Step 2: Apply Database Migrations

```bash
# Copy migrations from package
cp -r node_modules/@core-erp/entity/supabase ./

# Apply to your Supabase project
supabase db push
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-user
supabase functions deploy update-user
supabase functions deploy assign-roles
supabase functions deploy get-user-permissions
supabase functions deploy update-user-locale
```

### Step 4: Configure App (see Usage section above)

## 💻 Tech Stack

- **TypeScript** - Strict mode, 100% typed
- **React 18** - Peer dependency
- **Supabase JS** - v2.79.0+
- **TanStack React Query** - v5.0.0+ (peer dependency)
- **Zod** - Runtime validation
- **Vite** - Build tool

## 📚 Documentation

### 📁 Essential Reading

- **[README.md](./README.md)** - This file (overview & quick start)
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - 📖 **Complete architecture guide** (5000+ lines)
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - 📖 **Master documentation index**
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Migration history from core-erp

### 🔧 For AI Assistants

- **[.cursor/rules/core-entity-project.mdc](./.cursor/rules/core-entity-project.mdc)** - Project rules and context
- **[.cursor/rules/documentation-protocol.mdc](./.cursor/rules/documentation-protocol.mdc)** - Documentation guidelines

### 📖 Documentation Structure

- **docs/guides/** - How-to guides (setup, permissions, validation)
- **docs/api/** - API reference (types, hooks, contexts)
- **docs/architecture/** - Architecture details (providers, permission resolution)
- **docs/examples/** - Code examples (basic setup, advanced usage)

> **👉 Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for complete architecture**  
> **📍 Use [DOCUMENTATION.md](./DOCUMENTATION.md) to navigate all docs**

## 🛠️ Development

### Build Package

```bash
npm run build
```

Output: `dist/index.js`, `dist/index.d.ts` (ESM + types)

### Watch Mode

```bash
npm run dev
```

### Type Check

```bash
npm run type-check
```

### Test in Consuming App

```bash
# Build package
npm run build

# In consuming app
cd ../core-erp
npm install file:../core-entity
npm run dev
```

## 🚢 Publishing

### To Private NPM Registry

```bash
# 1. Build
npm run build

# 2. Test locally
cd ../core-erp && npm install file:../core-entity

# 3. Publish
npm publish --registry=https://your-private-registry.com
```

### Versioning

Follow semantic versioning:
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

## ❓ FAQ

**Q: Why no environment variables?**  
A: This package is shared by multiple apps that may use different Supabase instances. Configuration must be passed explicitly.

**Q: Can I use this without React?**  
A: The core utilities (types, schemas, client factory) work without React. Contexts and hooks require React 18+.

**Q: How do I add new entity types?**  
A: Add to `src/types/database.ts`, create Zod schema, create hook, export from `src/index.ts`, build and publish.

**Q: Do I need to deploy Edge Functions?**  
A: Yes, for create/update user operations and role assignments. They use service_role key for admin operations.

**Q: How do permissions work?**  
A: See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) (Security & Permission System section) for complete details.

**Q: Can I customize the database schema?**  
A: Yes, but this is a shared package. Schema changes affect all consuming apps. Add migrations carefully.

## 🤝 Contributing

### Before Contributing

1. Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)
2. Follow [.cursor/rules/](./.cursor/rules/) guidelines
3. Test in consuming application
4. Update documentation

### Making Changes

1. Update source code
2. Update types if needed
3. Add validation schemas if needed
4. Export from `src/index.ts`
5. Build and test
6. Update documentation
7. Bump version
8. Publish

## 📄 License

MIT

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-01-10

---

> 💡 **New to this package?**  
> - Read [DOCUMENTATION.md](./DOCUMENTATION.md) for complete navigation  
> - Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for comprehensive architecture  
> - Check [docs/examples/](./docs/examples/) for code examples

