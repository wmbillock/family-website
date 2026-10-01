import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Resume from './index'
import buildPdf from './buildPdf'
import { employment } from './data'

jest.mock('./buildPdf', () => jest.fn())

beforeEach(() => buildPdf.mockReturnValue({ save: jest.fn() }))

test('short view retains every role while full view exposes achievement context', () => {
  render(<Resume />)
  expect(screen.getByRole('button', { name: 'Short resume' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('heading', { name: 'Objective' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Skills' })).not.toBeInTheDocument()
  expect(document.querySelectorAll('.resume-entry')).toHaveLength(employment.length + 2)
  expect(screen.queryByText(/Ported a game engine/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Full career & achievements' }))
  expect(screen.getByRole('heading', { name: 'Full employment history' })).toBeInTheDocument()
  expect(screen.getByText('Ported a game engine from DirectX 8 to DirectX 9')).toBeInTheDocument()
  expect(screen.getByText(/control chat prompt and shared tasks across Claude/)).toBeInTheDocument()
  expect(document.querySelectorAll('details')).toHaveLength(10)
  expect(screen.getByText('Allstate Insurance Co.', { exact: false })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'North American Brass Band Association' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Teaching & curriculum development' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Writing, speaking & developer education' })).toBeInTheDocument()
})

test('export uses the selected view and distinct filenames', () => {
  render(<Resume />)
  fireEvent.click(screen.getByRole('button', { name: 'Export short resume PDF' }))
  expect(buildPdf).toHaveBeenLastCalledWith({ full: false })
  expect(buildPdf.mock.results[0].value.save).toHaveBeenLastCalledWith('willow-billock-resume.pdf')
  fireEvent.click(screen.getByRole('button', { name: 'Full career & achievements' }))
  fireEvent.click(screen.getByRole('button', { name: 'Export full career PDF' }))
  expect(buildPdf).toHaveBeenLastCalledWith({ full: true })
  expect(buildPdf.mock.results[1].value.save).toHaveBeenLastCalledWith('willow-billock-career-portfolio.pdf')
})


test('full career has a directly shareable URL', () => {
  window.history.replaceState({}, '', '/willow?career=full')
  try {
    render(<Resume />)
    expect(screen.getByRole('heading', { name: 'Full employment history' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Permanent link to full career' })).toHaveAttribute('href', '/willow?career=full')
  } finally {
    window.history.replaceState({}, '', '/')
  }
})
