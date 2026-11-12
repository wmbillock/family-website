import React from 'react'
import { render, screen, act } from '@testing-library/react'
import Activity from './Activity'
import contract from '../../activity/contract.js'
const offline={schemaVersion:1,generatedAt:null,sourceObservedAt:null,lastSuccessAt:null,health:'offline',events:[]}
const response=data=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(data)})
const day=back=>new Date(Date.now()-back*86400000).toISOString().slice(0,10)
function live(chatter){const at=new Date().toISOString();return {schemaVersion:2,generatedAt:at,sourceObservedAt:at,lastSuccessAt:at,health:'healthy',events:[],chatter}}
beforeEach(()=>{jest.useFakeTimers();global.fetch=jest.fn().mockResolvedValue(response(offline));Object.defineProperty(document,'hidden',{configurable:true,value:false})})
afterEach(()=>{jest.useRealTimers();delete global.fetch})
test('empty real feed is explicitly offline with no invented events',async()=>{render(<Activity/>);await act(async()=>{});expect(screen.getByText('⚪ source offline. no lore invented.')).toBeInTheDocument();expect(screen.getByText('no verified updates yet. peaceful scrollback, honestly.')).toBeInTheDocument();expect(fetch).toHaveBeenCalledWith('/activity/feed.json',expect.objectContaining({cache:'no-store'}));})
test('inactive tab makes no request',async()=>{render(<Activity active={false}/>);await act(async()=>{});expect(fetch).not.toHaveBeenCalled();})
test('the page asks rarely: half-hourly while visible, never while hidden, and on return only after five minutes',async()=>{
  render(<Activity/>);await act(async()=>{});expect(fetch).toHaveBeenCalledTimes(1)
  await act(async()=>{jest.advanceTimersByTime(60000)});expect(fetch).toHaveBeenCalledTimes(1)
  await act(async()=>{document.dispatchEvent(new Event('visibilitychange'))});expect(fetch).toHaveBeenCalledTimes(1)
  Object.defineProperty(document,'hidden',{configurable:true,value:true})
  await act(async()=>{jest.advanceTimersByTime(30*60000)});expect(fetch).toHaveBeenCalledTimes(1)
  Object.defineProperty(document,'hidden',{configurable:true,value:false})
  await act(async()=>{document.dispatchEvent(new Event('visibilitychange'))});expect(fetch).toHaveBeenCalledTimes(2)
  await act(async()=>{jest.advanceTimersByTime(30*60000)});expect(fetch).toHaveBeenCalledTimes(3)
})
test('invalid input is disconnected and cannot render raw/private prose',async()=>{fetch.mockResolvedValue(response({...offline,secret:'private-prose'}));render(<Activity/>);await act(async()=>{});expect(screen.getByText('refresh didn’t land. old receipts stay old. 💤')).toBeInTheDocument();expect(screen.queryByText('private-prose')).not.toBeInTheDocument();})
test('old source checks stay stale despite successful fetch',async()=>{const old=new Date(Date.now()-27*3600000).toISOString();fetch.mockResolvedValue(response({...offline,generatedAt:old,sourceObservedAt:old,lastSuccessAt:old,health:'healthy'}));render(<Activity/>);await act(async()=>{});expect(screen.getByText(/last check got sleepy/)).toBeInTheDocument();})
test('unmount aborts and stops polling',async()=>{const {unmount}=render(<Activity/>);await act(async()=>{});const signal=fetch.mock.calls[0][1].signal;unmount();expect(signal.aborted).toBe(true);await act(async()=>{jest.advanceTimersByTime(2*3600000)});expect(fetch).toHaveBeenCalledTimes(1);})
test('feed request is fixed GET without credentials, redirects or cross-origin reads',async()=>{render(<Activity/>);await act(async()=>{});expect(fetch).toHaveBeenCalledWith('/activity/feed.json',expect.objectContaining({method:'GET',mode:'same-origin',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'}));})
test('hostile public command/callback/html fields cannot create requests or executable DOM',async()=>{fetch.mockResolvedValue(response({...offline,url:'http://127.0.0.1:9999/execute',command:'touch /tmp/not-executed',html:'<img src=x onerror=alert(1)>',callback:'https://example.invalid/'}));const {container}=render(<Activity/>);await act(async()=>{});expect(fetch).toHaveBeenCalledTimes(1);expect(container.querySelectorAll('img,iframe,script,form,a,button')).toHaveLength(0);expect(container.textContent).not.toContain('not-executed');expect(screen.getByText('refresh didn’t land. old receipts stay old. 💤')).toBeInTheDocument();})

test('oversized streamed public payload cancels before decoding or rendering',async()=>{const cancel=jest.fn();const read=jest.fn().mockResolvedValueOnce({done:false,value:new Uint8Array(65536)}).mockResolvedValueOnce({done:false,value:new Uint8Array(65537)});fetch.mockResolvedValue({ok:true,headers:{get:()=>null},body:{getReader:()=>({read,cancel})}});render(<Activity/>);await act(async()=>{});expect(cancel).toHaveBeenCalledTimes(1);expect(read).toHaveBeenCalledTimes(2);expect(screen.getByText('refresh didn’t land. old receipts stay old. 💤')).toBeInTheDocument();});

test('chatter is a chat: named speakers, a day heading, scripted lines carrying the real count',async()=>{
  const chatter=[{day:day(1),who:'euphonia',topic:'merged',n:15},{day:day(1),who:'polymath',topic:'seats',n:1},{day:day(1),who:'claude',topic:'seats',n:212},{day:day(1),who:'stagehand',topic:'green',n:4}]
  fetch.mockResolvedValue(response(live(chatter)));const {container}=render(<Activity/>);await act(async()=>{})
  expect(screen.getByText(/live from backstage/)).toBeInTheDocument()
  expect(container.querySelectorAll('.activity-msg')).toHaveLength(4)
  expect(container.querySelectorAll('.activity-day h3 time')).toHaveLength(1)
  for(const name of ['Euphonia','Polymath','Claude','Stagehand'])expect(screen.getByText(name)).toBeInTheDocument()
  const said=[...container.querySelectorAll('.activity-bubble p:last-child')].map(p=>p.textContent)
  expect(said[0]).toContain('15');expect(said[2]).toContain('212');expect(said.join(' ')).not.toMatch(/[{}]/)
  expect(said[1]).not.toBe(said[2].replace('212','1'))
  expect(new Set(said).size).toBe(4)
  expect(container.querySelectorAll('img,iframe,script,form,a,button')).toHaveLength(0)
})
test('only three days are open; older days fold into scrollback',async()=>{
  const chatter=[1,2,3,4,5].map(back=>({day:day(back),who:'euphonia',topic:'quiet',n:0}))
  fetch.mockResolvedValue(response(live(chatter)));const {container}=render(<Activity/>);await act(async()=>{})
  expect(container.querySelectorAll('.activity-day')).toHaveLength(5)
  expect(container.querySelectorAll('.activity-older .activity-day')).toHaveLength(2)
  expect(screen.getByText('older scrollback (2 more days)')).toBeInTheDocument()
})
test('chatter that is not from the script is refused whole',async()=>{
  for(const bad of [{day:day(1),who:'euphonia',topic:'merged',n:3,text:'free prose'},{day:day(1),who:'willow',topic:'merged',n:3},{day:day(1),who:'claude',topic:'merged',n:3},{day:day(1),who:'euphonia',topic:'salary',n:3},{day:day(1),who:'euphonia',topic:'merged',n:'3'},{day:day(1),who:'euphonia',topic:'merged',n:-1},{day:day(1),who:'euphonia',topic:'quiet',n:2},{day:'tomorrow',who:'euphonia',topic:'merged',n:3},{day:day(90),who:'euphonia',topic:'merged',n:3},{day:day(1),who:'euphonia',topic:'__proto__',n:3}]){
    expect(()=>contract.validateChatter([bad])).toThrow()
  }
  expect(()=>contract.validateChatter([{day:day(1),who:'euphonia',topic:'merged',n:3},{day:day(1),who:'euphonia',topic:'merged',n:4}])).toThrow()
  expect(()=>contract.validateChatter([{day:day(2),who:'euphonia',topic:'merged',n:3},{day:day(1),who:'euphonia',topic:'merged',n:4}])).toThrow()
  fetch.mockResolvedValue(response(live([{day:day(1),who:'euphonia',topic:'merged',n:3,text:'free prose'}])));render(<Activity/>);await act(async()=>{})
  expect(screen.getByText('refresh didn’t land. old receipts stay old. 💤')).toBeInTheDocument();expect(screen.queryByText(/free prose/)).not.toBeInTheDocument()
})
test('every scripted line is plain text with only the count and plural slots, and singular reads right',()=>{
  for(const [topic,t] of Object.entries(contract.TOPICS)){
    expect(t.lines.length).toBeGreaterThanOrEqual(4)
    for(const who of t.who)expect(Object.hasOwn(contract.CAST,who)).toBe(true)
    for(const line of t.lines){expect(line.replace(/\{n\}|\{s\}/g,'')).not.toMatch(/[{}<>]|https?:/);expect(line.length).toBeLessThan(140);if(topic!=='quiet')expect(line).toContain('{n}')}
  }
  expect(contract.TOPICS.seats.lines.length).toBeGreaterThanOrEqual(contract.TOPICS.seats.who.length)
  const one=contract.say({day:'2026-11-11',who:'euphonia',topic:'merged',n:1});expect(one).not.toMatch(/1 (changes|merges|things)\b/)
  expect(contract.say({day:'2026-11-11',who:'euphonia',topic:'noanswer',n:3203})).toContain('3,203')
})
