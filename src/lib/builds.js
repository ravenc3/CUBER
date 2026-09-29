import { supabase } from './supabase.js'

export function mapBuildForLanguage(build, language, labels) {
  const suffix = language === 'tr' ? 'tr' : 'en'
  const images = (build.images || []).map((path) => supabase.getPublicImageUrl(path))
  const specs = [
    build.cpu && `${labels.cpu}: ${build.cpu}`,
    build.gpu && `${labels.gpu}: ${build.gpu}`,
    build.ram && `${labels.ram}: ${build.ram}`,
    build.storage && `${labels.storage}: ${build.storage}`,
    build.motherboard && `${labels.motherboard}: ${build.motherboard}`,
    build.cpu_cooler && `${labels.cpuCooler}: ${build.cpu_cooler}`,
    build.pc_case && `${labels.pcCase}: ${build.pc_case}`,
    build.case_fans && `${labels.caseFans}: ${build.case_fans}`,
    build.psu && `${labels.psu}: ${build.psu}`,
  ].filter(Boolean)

  return {
    id: build.id,
    name: build[`name_${suffix}`],
    category: build[`category_${suffix}`],
    description: build[`description_${suffix}`],
    specs: [...specs, ...(build[`additional_specs_${suffix}`] || [])],
    images,
    image: images[0] || '',
    imageAlt: build[`name_${suffix}`],
  }
}
