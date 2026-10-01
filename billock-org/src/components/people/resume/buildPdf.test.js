import buildPdf from './buildPdf'
import { employment } from './data'

const textContent = doc => Array.from(doc.output().matchAll(/\((.*?)\) Tj/g), match => match[1]).join(' ')

test('short PDF is two pages and retains the complete employer timeline', () => {
  const doc = buildPdf()
  expect(doc.getNumberOfPages()).toBe(2)
  const pdf = textContent(doc)
  expect(pdf).toContain('Objective')
  expect(pdf).not.toContain('Skills')
  employment.forEach(job => expect(pdf).toContain(job.company))
  expect(pdf).toContain('40% in testing')
  expect(pdf).toContain('over 1,000 developers')
  expect((pdf.match(/Developed Libretto/g) || []).length).toBe(1)
  expect(pdf).not.toContain('Designed and built a custom memory system')
})

test('full PDF includes historical technical work and measured-result context', () => {
  const doc = buildPdf({ full: true })
  const pdf = textContent(doc)
  expect(doc.getNumberOfPages()).toBeGreaterThan(2)
  expect(pdf).toContain('Chronosphere')
  expect(pdf).toContain('no memory access')
  expect(pdf).toContain('DirectX 8 to DirectX 9')
  expect(pdf).toContain('Hearts of Venice')
  expect(pdf).toContain('Teaching, music leadership, and recognition')
})
