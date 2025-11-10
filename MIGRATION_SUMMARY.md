# Core Entity Package - Migration Summary

## Overview

Successfully created `@core-erp/entity` - a shared package that extracts and centralizes all core Supabase-related functionality from `core-erp`. This package is now used by all applications to connect to the same Supabase instance.

## What Was Moved

### From `core-erp/src/types/`
- ✅ `database.ts` - All database TypeScript types (User, Role, Permission, etc.)

### From `core-erp/src/lib/`
- ✅ `supabase.ts` - Now a factory function (no environment variables)
- ✅ `authRetry.ts` - Exponential backoff retry logic
- ✅ `constants.ts` - Auth and session constants
- ✅ `permissions.ts` - Permission checking utilities (extracted from AuthContext)

### From `core-erp/src/contexts/`
- ✅ `AuthContext.tsx` - Refactored to accept `supabaseClient` as prop
- ✅ Created new `SupabaseContext.tsx` - Provides Supabase client to hooks

### From `core-erp/src/hooks/`
- ✅ `useAuth.ts` - Access authentication context
- ✅ `useUsers.ts` - User CRUD operations
- ✅ `useRoles.ts` - Role management
- ✅ `usePermissions.ts` - Permission queries
- ✅ `useNetworkStatus.ts` - Network monitoring
- ✅ `useSessionManagement.ts` - Cross-tab session sync

### From `core-erp/supabase/`
- ✅ `migrations/` - All database migration files
- ✅ `functions/` - All Edge Functions

### New Features Created
- ✅ Validation schemas (Zod) for User, Role, Permission entities
- ✅ Configuration types (`SupabaseConfig`)
- ✅ Comprehensive permission utilities

## Architecture Principles

### ✅ Fully Configurable
**Critical**: `@core-erp/entity` NEVER reads environment variables. All configuration must be passed from the consuming application.

```typescript
// ❌ BAD - Reading env vars in core-entity
const url = process.env.VITE_SUPABASE_URL

// ✅ GOOD - Configuration passed from app
const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
```

### ✅ Provider-Based Architecture
The package uses React Context to provide configured instances:

```typescript
<SupabaseProvider client={supabase}>
  <AuthProvider supabaseClient={supabase} toast={toast}>
    <App />
  </AuthProvider>
</SupabaseProvider>
```

## Package Structure

```
core-entity/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts                    # Main exports
│   ├── types/
│   │   ├── database.ts             # Database types
│   │   └── config.ts               # Configuration types
│   ├── lib/
│   │   ├── supabase.ts             # Client factory
│   │   ├── permissions.ts          # Permission utilities
│   │   ├── constants.ts            # Constants
│   │   └── authRetry.ts            # Retry logic
│   ├── schemas/
│   │   ├── user.ts                 # User validation
│   │   ├── role.ts                 # Role validation
│   │   ├── permission.ts           # Permission validation
│   │   ├── audit.ts                # Audit log validation
│   │   └── index.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Auth + permissions
│   │   ├── SupabaseContext.tsx     # Supabase client provider
│   │   └── index.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useUsers.ts
│       ├── useRoles.ts
│       ├── usePermissions.ts
│       ├── useNetworkStatus.ts
│       ├── useSessionManagement.ts
│       └── index.ts
├── supabase/
│   ├── migrations/                 # Database schema
│   └── functions/                  # Edge Functions
└── dist/                           # Built package
```

## Changes to core-erp

### Updated Files

1. **`package.json`**
   - Added: `"@core-erp/entity": "file:../core-entity"`

2. **`src/lib/supabase.ts`**
   - Now uses `createSupabaseClient()` from `@core-erp/entity`
   - Passes configuration from environment variables

3. **`src/main.tsx`**
   - Added `SupabaseProvider` and `AuthProvider` wrappers
   - Passes `supabase` client and `toast` to providers

4. **`src/App.tsx`**
   - Removed `AuthProvider` (now in main.tsx)

5. **All component and page files**
   - Updated imports from `@/hooks/*` → `@core-erp/entity`
   - Updated imports from `@/types/*` → `@core-erp/entity`

### Deleted Files

- ❌ `src/types/database.ts`
- ❌ `src/contexts/AuthContext.tsx`
- ❌ `src/hooks/useAuth.ts`
- ❌ `src/hooks/useUsers.ts`
- ❌ `src/hooks/useRoles.ts`
- ❌ `src/hooks/usePermissions.ts`
- ❌ `src/hooks/useNetworkStatus.ts`
- ❌ `src/hooks/useSessionManagement.ts`
- ❌ `src/lib/authRetry.ts`
- ❌ `supabase/migrations/` (moved to core-entity)
- ❌ `supabase/functions/` (moved to core-entity)

## Usage Example

### In core-erp (or any app)

```typescript
// src/lib/supabase.ts
import { createSupabaseClient } from '@core-erp/entity'

export const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
})
```

```typescript
// src/main.tsx
import { SupabaseProvider, AuthProvider } from '@core-erp/entity'
import { toast } from 'sonner'
import { supabase } from './lib/supabase'

<SupabaseProvider client={supabase}>
  <AuthProvider supabaseClient={supabase} toast={toast}>
    <App />
  </AuthProvider>
</SupabaseProvider>
```

```typescript
// src/pages/Users.tsx
import { useAuth, useUsers } from '@core-erp/entity'

function Users() {
  const { hasPermission } = useAuth()
  const { data: users, isLoading } = useUsers()
  
  if (!hasPermission('users:view')) {
    return <div>Access denied</div>
  }
  
  // Use users...
}
```

## Build Status

### ✅ core-entity
- Built successfully
- TypeScript compilation: ✅ Pass
- Vite build: ✅ Pass
- Output: `dist/index.js` (20.06 kB)

### ✅ core-erp
- TypeScript compilation: ✅ Pass (only pre-existing warnings)
- All imports working correctly
- Ready for development

**Note**: There's a pre-existing Tailwind CSS build issue in core-ui (unrelated to this migration). The dev server works correctly.

## Benefits

1. **✅ Shared Logic**: All apps use the same entity management code
2. **✅ Type Safety**: Centralized types prevent inconsistencies
3. **✅ Validation**: Reusable Zod schemas across apps
4. **✅ Permission System**: Consistent permission checking
5. **✅ Database Schema**: Single source of truth for migrations
6. **✅ Configurable**: No hard-coded values, fully flexible
7. **✅ Maintainable**: Update once, all apps benefit

## Next Steps

To use `@core-erp/entity` in other applications:

1. Add dependency: `"@core-erp/entity": "file:../core-entity"`
2. Create Supabase client with configuration
3. Wrap app with `SupabaseProvider` and `AuthProvider`
4. Import types, hooks, and utilities as needed
5. All apps connect to the SAME Supabase instance

## Testing

To verify everything works:

```bash
# In core-entity
cd core-entity
npm install
npm run build

# In core-erp
cd ../core-erp
npm install
npm run type-check  # Should pass (ignore pre-existing warnings)
npm run dev         # Should start successfully
```

## Documentation

- `../core-entity/README.md` - Package overview and usage
- `../core-entity/src/index.ts` - All public exports
- Original migrations preserved in `../core-entity/supabase/migrations/`
- Original Edge Functions preserved in `../core-entity/supabase/functions/`

---

**Migration completed successfully! 🎉**

All 15 planned tasks completed. The `@core-erp/entity` package is ready for use across all applications in the composable ERP system.

