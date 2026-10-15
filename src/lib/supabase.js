import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const clientKey = '__cuberSupabaseClient'
const storageRequestSignals = new Map()

function getStorageRequestSignal(input, init) {
  const requestUrl = new URL(input instanceof Request ? input.url : input, supabaseUrl)
  const path = requestUrl.pathname.match(/\/storage\/v1\/object\/build-images\/([^/]+)/)?.[1]
  if (path) return storageRequestSignals.get(decodeURIComponent(path))

  if (requestUrl.pathname.endsWith('/object/build-images') && init?.method === 'DELETE') {
    const prefixes = JSON.parse(init.body || '{}').prefixes
    const firstPath = prefixes?.[0]
    if (typeof firstPath === 'string') {
      return storageRequestSignals.get(firstPath.split('/')[0])
    }
  }
  return undefined
}

const client = isSupabaseConfigured
  ? (globalThis[clientKey] ??= createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (input, init) => {
          const signal = getStorageRequestSignal(input, init)
          return fetch(input, signal ? { ...init, signal } : init)
        },
      },
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

async function withStorageRequestSignal(buildId, signal, operation) {
  if (!signal) return operation()
  storageRequestSignals.set(buildId, signal)
  try {
    return await operation()
  } finally {
    if (storageRequestSignals.get(buildId) === signal) {
      storageRequestSignals.delete(buildId)
    }
  }
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

  async createBuild(build, signal) {
    const { data, error } = await getClient()
      .from('builds')
      .upsert(build, { onConflict: 'id' })
      .select()
      .abortSignal(signal)
      .single()
    if (error) throw error
    return data
  },

  async updateBuild(build, signal) {
    const { data, error } = await getClient()
      .from('builds')
      .update(build)
      .eq('id', build.id)
      .select()
      .abortSignal(signal)
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

  async uploadBuildImage(path, file, signal) {
    const buildId = path.split('/')[0]
    const { data, error } = await withStorageRequestSignal(buildId, signal, () => getClient()
      .storage
      .from('build-images')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true,
      }))
    if (error) throw error
    return data
  },

  async deleteBuildImages(paths, signal) {
    if (!paths.length) return
    const buildId = paths[0].split('/')[0]
    const { error } = await withStorageRequestSignal(buildId, signal, () =>
      getClient().storage.from('build-images').remove(paths),
    )
    if (error) throw error
  },

  getPublicImageUrl(path) {
    const { data } = getClient().storage.from('build-images').getPublicUrl(path)
    return data.publicUrl
  },
}
