import { useCallback, useEffect, useState } from 'react'
import BuildEditor from './BuildEditor.jsx'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import './Admin.css'

function AdminApp() {
  const [user, setUser] = useState(null)
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorBuild, setEditorBuild] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [error, setError] = useState('')
  const [editorError, setEditorError] = useState('')

  const loadBuilds = useCallback(async () => {
    try {
      setBuilds(await supabase.listBuilds())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function checkSession() {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Copy .env.example to .env, then add your project URL and anon key.')
        setLoading(false)
        return
      }

      try {
        const session = await supabase.getSession()
        if (!session?.access_token) return

        const authenticatedUser = await supabase.getUser()
        if (!active) return
        if (!(await supabase.isAdmin())) {
          await supabase.signOut()
          setError('This account does not have CUBER admin access.')
          return
        }
        setUser(authenticatedUser)
        await loadBuilds()
      } catch (sessionError) {
        if (active) {
          let message = sessionError.message
          try {
            await supabase.signOut()
          } catch (signOutError) {
            message = `${message} Signing out also failed: ${signOutError.message}`
          }
          if (active) setError(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    checkSession()
    return () => {
      active = false
    }
  }, [loadBuilds])

  async function signIn(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    try {
      const { user: authenticatedUser } = await supabase.signInWithPassword(
        String(formData.get('email')),
        String(formData.get('password')),
      )
      if (!authenticatedUser || !(await supabase.isAdmin())) {
        await supabase.signOut()
        throw new Error('This account does not have CUBER admin access.')
      }
      setUser(authenticatedUser)
      await loadBuilds()
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setError('')
    try {
      await supabase.signOut()
    } catch (signOutError) {
      setError(signOutError.message)
    } finally {
      setUser(null)
      setBuilds([])
    }
  }

  async function saveBuild(form, files) {
    setSaving(true)
    setEditorError('')
    const uploadedPaths = []
    const removedPaths = editorBuild
      ? editorBuild.images.filter((path) => !form.images.includes(path))
      : []
    const buildId = form.id || crypto.randomUUID()

    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
          throw new Error(`${file.name} is not a supported image format.`)
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds the 10 MB image limit.`)
        }
        const path = `${buildId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '-')}`
        await supabase.uploadBuildImage(path, file)
        uploadedPaths.push(path)
      }

      const { id, ...fields } = form
      const buildRecord = {
        ...fields,
        id: buildId,
        images: [...form.images, ...uploadedPaths],
        updated_at: new Date().toISOString(),
      }
      const saved = id
        ? await supabase.updateBuild(buildRecord)
        : await supabase.createBuild(buildRecord)

      if (removedPaths.length) {
        try {
          await supabase.deleteBuildImages(removedPaths)
        } catch (cleanupError) {
          setError(`Build saved, but removed images could not be deleted: ${cleanupError.message}`)
        }
      }

      setBuilds((current) => [
        saved,
        ...current.filter((build) => build.id !== saved.id),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setEditorOpen(false)
      setEditorBuild(null)
    } catch (saveError) {
      if (uploadedPaths.length) {
        try {
          await supabase.deleteBuildImages(uploadedPaths)
        } catch (cleanupError) {
          setEditorError(`${saveError.message} Uploaded images could not be cleaned up: ${cleanupError.message}`)
          setSaving(false)
          return
        }
      }
      setEditorError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteBuild(build) {
    if (!window.confirm(`Delete "${build.name_en}"? This cannot be undone.`)) return
    setError('')
    try {
      await supabase.deleteBuild(build.id)
      setBuilds((current) => current.filter((item) => item.id !== build.id))
      if (build.images.length) {
        try {
          await supabase.deleteBuildImages(build.images)
        } catch (cleanupError) {
          setError(`Build deleted, but its images could not be removed: ${cleanupError.message}`)
        }
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  function openEditor(build = null) {
    setEditorBuild(build)
    setEditorOpen(true)
    setError('')
    setEditorError('')
  }

  if (!isSupabaseConfigured) {
    return <AdminShell><div className="admin-alert" role="alert">{error}</div></AdminShell>
  }

  if (loading && !user) {
    return <AdminShell><p className="admin-status">Checking admin session…</p></AdminShell>
  }

  if (!user) {
    return (
      <AdminShell>
        <form className="admin-login" onSubmit={signIn}>
          <p className="admin-eyebrow">CUBER / PRIVATE AREA</p>
          <h1>Admin sign in</h1>
          <p className="admin-muted">Sign in with an authorized CUBER admin account.</p>
          {error && <p className="admin-alert" role="alert">{error}</p>}
          <label>
            Email
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button className="admin-button admin-button-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <a className="admin-back-link" href="/">Return to CUBER website</a>
        </form>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="admin-dashboard">
        <header className="admin-topbar">
          <a className="admin-brand" href="/">CUBER <span>/ ADMIN</span></a>
          <div>
            <span className="admin-user">{user.email}</span>
            <button className="admin-button admin-button-secondary" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>

        {editorOpen ? (
          <BuildEditor
            build={editorBuild}
            saving={saving}
            error={editorError}
            onSave={saveBuild}
            onCancel={() => {
              setEditorOpen(false)
              setEditorBuild(null)
              setEditorError('')
            }}
            imageUrl={supabase.getPublicImageUrl}
          />
        ) : (
          <section className="admin-builds">
            <div className="admin-page-heading">
              <div>
                <p className="admin-eyebrow">Dashboard</p>
                <h1>Builds</h1>
              </div>
              <button className="admin-button admin-button-primary" type="button" onClick={() => openEditor()}>
                Add build
              </button>
            </div>
            {error && <p className="admin-alert" role="alert">{error}</p>}
            {loading ? (
              <p className="admin-status">Loading builds…</p>
            ) : builds.length === 0 ? (
              <p className="admin-empty">No builds yet. Add your first build to publish it on the website.</p>
            ) : (
              <div className="admin-build-list">
                {builds.map((build) => (
                  <article className="admin-build-row" key={build.id}>
                    {build.images[0] ? (
                      <img src={supabase.getPublicImageUrl(build.images[0])} alt="" />
                    ) : (
                      <div className="admin-build-placeholder">No image</div>
                    )}
                    <div className="admin-build-title">
                      <h2>{build.name_en}</h2>
                      <p>{build.name_tr} · {build.category_en}</p>
                    </div>
                    <div className="admin-row-actions">
                      <button className="admin-button admin-button-secondary" type="button" onClick={() => openEditor(build)}>
                        Edit
                      </button>
                      <button className="admin-button admin-button-danger" type="button" onClick={() => deleteBuild(build)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AdminShell>
  )
}

function AdminShell({ children }) {
  return <main className="admin-shell">{children}</main>
}

export default AdminApp
