import { TextEncoder, TextDecoder } from 'util'
import { employment } from './data'

// jsPDF's Node entry uses these APIs; Jest's jsdom environment does not expose them.
Object.assign(global, { TextEncoder, TextDecoder })
const buildPdf = require('./buildPdf').default

const textContent = doc => Array.from(doc.output().matchAll(/\((.*?)\) Tj/g), match => match[1]).join(' ')

test('short PDF is two pages and retains the complete employer timeline', () => {
  const doc = buildPdf()
  expect(doc.getNumberOfPages()).toBe(2)
  const pdf = textContent(doc)
  expect(pdf).toContain('Summary')
  expect(pdf).not.toContain('Seeking')
  expect(pdf).not.toContain('Skills')
  employment.forEach(job => expect(pdf).toContain(job.company))
  expect(pdf).toContain('67% fewer tokens')
  expect(pdf).toContain('roughly 1,000 engineers')
  expect((pdf.match(/Built internal work-memory tooling/g) || []).length).toBe(1)
  expect(pdf).not.toContain('Designed and built a custom memory system')
})

test('full PDF includes historical technical work and measured-result context', () => {
  const doc = buildPdf({ full: true })
  const pdf = textContent(doc)
  expect(doc.getNumberOfPages()).toBeGreaterThan(2)
  expect(pdf).toContain('dry-run')
  expect(pdf).toContain('underlying dataset')
  expect(pdf).toContain('DirectX 8 to DirectX 9')
  expect(pdf).toContain('Hearts of Venice')
  expect(pdf).toContain('Teaching, music leadership, and recognition')
})
