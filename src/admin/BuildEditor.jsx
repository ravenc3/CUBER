import { useEffect, useRef, useState } from 'react'

function toForm(build) {
  return {
    id: build?.id || crypto.randomUUID(),
    name_tr: build?.name_tr || '',
    name_en: build?.name_en || '',
    description_tr: build?.description_tr || '',
    description_en: build?.description_en || '',
    category_tr: build?.category_tr || '',
    category_en: build?.category_en || '',
    cpu: build?.cpu || '',
    gpu: build?.gpu || '',
    motherboard: build?.motherboard || '',
    ram: build?.ram || '',
    storage: build?.storage || '',
    cpu_cooler: build?.cpu_cooler || '',
    pc_case: build?.pc_case || '',
    case_fans: build?.case_fans || '',
    psu: build?.psu || '',
    additional_specs_tr: (build?.additional_specs_tr || []).join('\n'),
    additional_specs_en: (build?.additional_specs_en || []).join('\n'),
    images: build?.images || [],
  }
}

function BuildEditor({ build, saving, error, onSave, onCancel, imageUrl }) {
  const [form, setForm] = useState(() => toForm(build))
  const [files, setFiles] = useState([])
  const objectUrls = useRef(new Set())

  useEffect(() => {
    const urls = objectUrls.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateFiles(event) {
    const selectedFiles = Array.from(event.target.files || []).map((file) => {
      const preview = URL.createObjectURL(file)
      objectUrls.current.add(preview)
      return { id: crypto.randomUUID(), file, preview }
    })
    setFiles((current) => [...current, ...selectedFiles])
    event.target.value = ''
  }

  function removeFile(index) {
    setFiles((current) => {
      const removed = current[index]
      if (removed) {
        URL.revokeObjectURL(removed.preview)
        objectUrls.current.delete(removed.preview)
      }
      return current.filter((_, fileIndex) => fileIndex !== index)
    })
  }

  function removeExistingImage(image) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((path) => path !== image),
    }))
  }

  function submit(event) {
    event.preventDefault()
    onSave({
      ...form,
      additional_specs_tr: form.additional_specs_tr
        .split('\n')
        .map((spec) => spec.trim())
        .filter(Boolean),
      additional_specs_en: form.additional_specs_en
        .split('\n')
        .map((spec) => spec.trim())
        .filter(Boolean),
    }, files.map(({ id, file }) => ({ id, file })))
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="admin-editor-heading">
        <div>
          <p className="admin-eyebrow">Build management</p>
          <h2>{build ? 'Edit build' : 'Add build'}</h2>
        </div>
        <button className="admin-button admin-button-secondary" type="button" onClick={onCancel}>
          {saving ? 'Cancel save' : 'Cancel'}
        </button>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}

      <section className="admin-form-section" aria-labelledby="admin-build-information">
        <h3 id="admin-build-information">Build Information</h3>
        <div className="admin-form-grid">
          <label>
            Build name (Turkish)
            <input name="name_tr" value={form.name_tr} onChange={updateField} required />
          </label>
          <label>
            Build name (English)
            <input name="name_en" value={form.name_en} onChange={updateField} required />
          </label>
          <label className="admin-field-wide">
            Description (Turkish)
            <textarea name="description_tr" value={form.description_tr} onChange={updateField} rows="3" required />
          </label>
          <label className="admin-field-wide">
            Description (English)
            <textarea name="description_en" value={form.description_en} onChange={updateField} rows="3" required />
          </label>
          <label>
            Category / tag (Turkish)
            <input name="category_tr" value={form.category_tr} onChange={updateField} required />
          </label>
          <label>
            Category / tag (English)
            <input name="category_en" value={form.category_en} onChange={updateField} required />
          </label>
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="admin-components">
        <h3 id="admin-components">Components</h3>
        <div className="admin-form-grid">
          <label>
            CPU / Processor
            <input name="cpu" value={form.cpu} onChange={updateField} />
          </label>
          <label>
            GPU / Graphics Card
            <input name="gpu" value={form.gpu} onChange={updateField} />
          </label>
          <label>
            Motherboard
            <input name="motherboard" value={form.motherboard} onChange={updateField} />
          </label>
          <label>
            RAM
            <input name="ram" value={form.ram} onChange={updateField} />
          </label>
          <label>
            Storage
            <input name="storage" value={form.storage} onChange={updateField} />
          </label>
          <label>
            CPU Cooler
            <input name="cpu_cooler" value={form.cpu_cooler} onChange={updateField} />
          </label>
          <label>
            Case
            <input name="pc_case" value={form.pc_case} onChange={updateField} />
          </label>
          <label>
            Case Fans
            <input name="case_fans" value={form.case_fans} onChange={updateField} />
          </label>
          <label>
            PSU / Power Supply
            <input name="psu" value={form.psu} onChange={updateField} />
          </label>
        </div>
      </section>

      <section className="admin-image-field" aria-label="Build images">
        <div>
          <h3>Build Images</h3>
          <p>Select one or more JPEG, PNG, WebP, or AVIF images (up to 10 MB each).</p>
        </div>
        <label className="admin-button admin-button-secondary admin-upload-button">
          Choose images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={updateFiles}
          />
        </label>
        <div className="admin-image-grid">
          {form.images.map((path) => (
            <div className="admin-image-preview" key={path}>
              <img src={imageUrl(path)} alt="" />
              <button type="button" aria-label="Remove image" onClick={() => removeExistingImage(path)}>
                Remove
              </button>
            </div>
          ))}
          {files.map(({ file, preview }, index) => (
            <div className="admin-image-preview" key={preview}>
              <img src={preview} alt={file.name || 'Selected image preview'} />
              <button type="button" aria-label="Remove selected image" onClick={() => removeFile(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-form-section" aria-labelledby="admin-additional">
        <h3 id="admin-additional">Additional Notes <span>(optional)</span></h3>
        <div className="admin-form-grid">
          <label>
            Additional Notes (Turkish, one per line)
            <textarea name="additional_specs_tr" value={form.additional_specs_tr} onChange={updateField} rows="4" />
          </label>
          <label>
            Additional Notes (English, one per line)
            <textarea name="additional_specs_en" value={form.additional_specs_en} onChange={updateField} rows="4" />
          </label>
        </div>
      </section>

      <div className="admin-form-actions">
        <button className="admin-button admin-button-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save build'}
        </button>
        <button className="admin-button admin-button-secondary" type="button" onClick={onCancel}>
          {saving ? 'Cancel save' : 'Cancel'}
        </button>
      </div>
    </form>
  )
}

export default BuildEditor
