import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const clientKey = '__cuberSupabaseClient'
const client = isSupabaseConfigured
  ? (globalThis[clientKey] ??= createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }))
  : null

function withTimeout(promise, operation) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${operation} timed out after 10 seconds.`)),
      10_000,
    )
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

function getClient() {
  if (!client) {
    throw new Error('Supabase is not configured. Add the required VITE_SUPABASE variables to .env.')
  }
  return client
}

export const supabase = {
  async getSession() {
    const { data, error } = await withTimeout(getClient().auth.getSession(), 'Checking the Supabase session')
    if (error) throw error
    return data.session
  },

  async signInWithPassword(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await withTimeout(getClient().auth.signOut(), 'Signing out of Supabase')
    if (error) throw error
  },

  async getUser() {
    const { data, error } = await withTimeout(getClient().auth.getUser(), 'Checking the Supabase user')
    if (error) throw error
    return data.user
  },

  async isAdmin() {
    const { data, error } = await withTimeout(
      getClient().rpc('is_cuber_admin'),
      'Checking CUBER admin authorization',
    )
    if (error) throw error
    return data === true
  },

  async listBuilds() {
    const { data, error } = await withTimeout(
      getClient()
        .from('builds')
        .select('*')
        .order('created_at', { ascending: false }),
      'Loading CUBER builds',
    )
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
