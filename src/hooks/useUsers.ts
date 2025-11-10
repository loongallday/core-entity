import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '../contexts/SupabaseContext'
import type { User, Database } from '../types/database'

export function useUsers() {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_roles!user_roles_user_id_fkey(role:roles(*))
        `)
        .order('name')

      if (error) throw error
      return data as (User & { roles?: any[] })[]
    },
  })
}

export function useUser(id: string) {
  const supabase = useSupabase()

  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_roles!user_roles_user_id_fkey(role:roles(*))
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as User & { roles?: any[] }
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: { email: string; name: string; phone?: string; role_ids: string[] }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)
      return data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<User> & { id: string }) => {
      // Extract only the fields that can be updated (exclude id, created_at, updated_at)
      const updateData: Database['public']['Tables']['users']['Update'] = {}
      
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active
      if (updates.locale !== undefined) updateData.locale = updates.locale
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone

      const { data, error } = await supabase
        .from('users')
        // @ts-expect-error - Supabase type inference issue with Update type
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

