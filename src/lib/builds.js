import { supabase } from './supabase.js'

export function mapBuildForLanguage(build, language, labels) {
  const suffix = language === 'tr' ? 'tr' : 'en'
  const images = (build.images || []).map((path) => supabase.getPublicImageUrl(path))
  const specs = [
    build.cpu && { label: labels.cpu, value: build.cpu },
    build.gpu && { label: labels.gpu, value: build.gpu },
    build.ram && { label: labels.ram, value: build.ram },
    build.storage && { label: labels.storage, value: build.storage },
    build.motherboard && { label: labels.motherboard, value: build.motherboard },
    build.cpu_cooler && { label: labels.cpuCooler, value: build.cpu_cooler },
    build.pc_case && { label: labels.pcCase, value: build.pc_case },
    build.case_fans && { label: labels.caseFans, value: build.case_fans },
    build.psu && { label: labels.psu, value: build.psu },
  ].filter(Boolean)
  const additionalSpecs = build[`additional_specs_${suffix}`]

  return {
    id: build.id,
    name: language === 'ar' && build.name_ar?.trim()
      ? build.name_ar
      : build[`name_${suffix}`] || build.name_en,
    category: build[`category_${suffix}`] || build.category_en,
    description: language === 'ar' && build.description_ar?.trim()
      ? build.description_ar
      : build[`description_${suffix}`] || build.description_en,
    specs: [...specs, ...(additionalSpecs || []).map((value) => ({ label: '', value }))],
    images,
    image: images[0] || '',
    imageAlt: language === 'ar' && build.name_ar?.trim()
      ? build.name_ar
      : build[`name_${suffix}`] || build.name_en,
  }
}
