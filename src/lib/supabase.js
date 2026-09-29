import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const client = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

function getClient() {
  if (!client) {
    throw new Error('Supabase is not configured. Add the required VITE_SUPABASE variables to .env.')
  }
  return client
}

export const supabase = {
  async getSession() {
    const { data, error } = await getClient().auth.getSession()
    if (error) throw error
    return data.session
  },

  async signInWithPassword(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await getClient().auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const { data, error } = await getClient().auth.getUser()
    if (error) throw error
    return data.user
  },

  async isAdmin(userId) {
    const { data, error } = await getClient()
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return Boolean(data)
  },

  async listBuilds() {
    const { data, error } = await getClient()
      .from('builds')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  subscribeToBuilds(onChange) {
    return getClient()
      .channel('public-builds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'builds' },
        onChange,
      )
      .subscribe()
  },

  async removeBuildSubscription(subscription) {
    const status = await getClient().removeChannel(subscription)
    if (status !== 'ok') {
      throw new Error(`Supabase Realtime subscription cleanup failed: ${status}.`)
    }
  },

  async createBuild(build) {
    const { data, error } = await getClient()
      .from('builds')
      .insert(build)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateBuild(build) {
    const { data, error } = await getClient()
      .from('builds')
      .update(build)
      .eq('id', build.id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteBuild(id) {
    const { data, error } = await getClient()
      .from('builds')
      .delete()
      .eq('id', id)
      .select('id')
      .single()
    if (error) throw error
    if (!data) throw new Error('The build was not deleted.')
  },

  async uploadBuildImage(path, file) {
    const { data, error } = await getClient()
      .storage
      .from('build-images')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
    if (error) throw error
    return data
  },

  async deleteBuildImages(paths) {
    if (!paths.length) return
    const { error } = await getClient().storage.from('build-images').remove(paths)
    if (error) throw error
  },

  getPublicImageUrl(path) {
    const { data } = getClient().storage.from('build-images').getPublicUrl(path)
    return data.publicUrl
  },
}
