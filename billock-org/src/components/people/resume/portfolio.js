import { employment } from './data'

export const shortEmployment = employment.slice(0, 3).map((job, index) => ({
  ...job,
  responsibilities: [
    [job.responsibilities[0], job.responsibilities[1], job.responsibilities[2],
      'Architectural oversight of a pricing service averaging 12 million requests per minute at 99.999% measured availability',
      'Increased concurrent experimentation capacity by 400% through development-pipeline improvements'],
    ['Helped migrate a workflow engine from Redis/Sidekiq to Temporal and Go',
      'Established a technical design process and mentored engineers as a team lead'],
    ['Staff engineering for Thinkful’s lead-processing systems; architecture, mentoring, and delivery',
      'Introduced a design process to improve delivery predictability and contributed to monolith-to-microservices redesign'],
  ][index],
}))
export const earlierEmployment = employment.slice(3)
export const careerHighlights = [
  'Invoice2go: built a multi-tenant payments system processing $8 million weekly at 99.999% uptime; promoted from Lead to Principal Engineer.',
  'Sprout Social: managed platform engineers and migrated 1,200 manually billed customers from Oracle NetSuite to Recurly.',
  'WMS Gaming and Raw Thrills: shipped five game titles and developed DirectX rendering and shader-debugging technology.',
]

export const achievements = [
  {
    id: 'libretto', title: 'Libretto: project-oriented knowledge and autonomous notes', organization: 'Affirm',
    contribution: 'Developed a dynamic autonomous note-taking swarm using PARA memory architecture, custom collectors, and agent lifecycle management.',
    approach: 'A local Obsidian-based Markdown library provides a project-oriented discovery surface. Pre-organizing information by project reduces the repeated retrieval and research needed to assemble request context.',
    result: 'Testing of the custom memory system showed an average 40% reduction in billed tokens per request across established research, synthesis, development, and general-usage tasks.',
    context: 'The comparison used a control chat prompt and shared tasks across Claude, Codex, and a control agent with no memory access, comparing billed token counts across the three approaches. The average is a testing result, not a production-wide cost-savings claim.',
  },
  {
    id: 'pricing-recovery', title: 'Bringing 13 teams back to a shared pricing goal', organization: 'Affirm',
    contribution: 'Assumed cross-team leadership of recovery efforts for a stalled pricing-configuration project.',
    approach: 'Aligned 13 teams around the same project goal, extending the role beyond a single team’s delivery responsibilities.',
    result: 'Led the cross-team recovery effort.',
    context: 'The team count describes coordination scope, not 13 teams of direct reports. A final delivery milestone is not asserted here.',
  },
  {
    id: 'pricing-scale', title: 'Architectural oversight at pricing-service scale', organization: 'Affirm',
    contribution: 'Held architectural oversight for the pricing service while guiding team quality and development practices.',
    approach: 'Combined architectural work with engineering practices intended to improve delivery reliability.',
    result: 'The service averages a sustained 12 million requests per minute at 99.999% measured availability, tracked using Chronosphere and service metrics.',
    context: 'Throughput is a sustained average rather than a peak. Availability is measured rather than a target. These are system-level figures; my contribution was architectural oversight and engineering leadership within the team.',
  },
  {
    id: 'experimentation', title: 'Increasing experimentation capacity', organization: 'Affirm',
    contribution: 'Improved development pipelines and reduced process inefficiencies.',
    approach: 'Focused on the development workflow supporting concurrent financing-program experiments; also developed reporting for experimentation and configuration changes.',
    result: 'Increased concurrent experimentation capacity by 400%.',
    context: 'This describes experimentation capacity, not a claim that all engineering productivity or revenue increased by 400%.',
  },
  {
    id: 'production-llm', title: 'From a team hackathon to production LLM integration', organization: 'Affirm',
    contribution: 'Won a team hackathon and helped ship one of Affirm’s first production LLM integrations.',
    approach: 'Contributed as part of the winning team and the subsequent production integration effort.',
    result: 'A production LLM integration, in addition to the hackathon win.',
    context: 'The achievement is team-based. Internal implementation and evaluation artifacts are not published here.',
  },
  {
    id: 'payments', title: 'Payments infrastructure handling $8 million weekly', organization: 'Invoice2go',
    contribution: 'Built a multi-tenant payments system and integrated multiple payment vendors.',
    approach: 'Worked across product design, engineering, deployment, and maintenance, with a distributed team spanning California, Indonesia, and Australia.',
    result: 'The system processed $8 million per week at 99.999% uptime and served as a primary revenue driver for the organization.',
    context: 'The dollar amount is payment-processing volume, not company revenue. The uptime figure is recorded in my career account without a published measurement window.',
  },
  {
    id: 'billing-migration', title: 'Replacing manual billing for 1,200 customers', organization: 'Sprout Social',
    contribution: 'Migrated 1,200 manually billed customers from Oracle NetSuite to Recurly.',
    approach: 'Combined hands-on platform delivery with engineering management, including performance guidance, mentoring, and organizational training.',
    result: 'Reduced back-office payment-processing costs by moving those customers to the billing platform.',
    context: 'The customer count is recorded in my career account; no unsupported percentage reduction in cost is claimed.',
  },
  {
    id: 'music-service', title: 'Music leadership and nonprofit service', organization: 'NABBA / Chicago Brass Band',
    contribution: 'North American Brass Band Association board member and tech lead (2022-2024); Chicago Brass Band board member (2023), vice president (2024), and president (2025).',
    approach: 'Combined organizational leadership with active performance in brass bands and drum corps. Kilties roles also included program coordinator, visual caption head, and visual tech.',
    result: 'A record of service, organizational leadership, performance, and instruction alongside a software engineering career.',
    context: 'Role titles, dates, and performance history are preserved in the music and service section below.',
  },
  {
    id: 'teaching', title: 'Teaching graphics, games, and software development', organization: 'DeVry / SNHU / Rasmussen',
    contribution: 'Visiting Professor at DeVry (2011-2018); Adjunct Faculty at Southern New Hampshire University (2012-2017); Adjunct Faculty and Subject Matter Expert at Rasmussen (2012-2015).',
    approach: 'Taught graphics programming, math programming for games, game and simulation programming, software development, interactive 3D environments, game design theory, and DirectX lighting.',
    result: 'Designed multiple computer-graphics courses at Rasmussen and taught across three institutions.',
    context: 'Teaching appointments overlapped the employment timeline. They are additional roles rather than replacements for the engineering positions.',
  },
  {
    id: 'games', title: 'Commercial games and real-time graphics', organization: 'WMS Gaming / Raw Thrills',
    contribution: 'Worked as a gaming software engineer and graphics programmer across two WMS roles and a Raw Thrills role.',
    approach: 'Used ActionScript and C++ at WMS. At Raw Thrills, ported a game engine from DirectX 8 to DirectX 9, implemented graphical effects, and built a reloadable shader debugger in HLSL and Cg.',
    result: 'WMS shipped-title credits: Hearts of Venice, Griffin’s Gate, I Love Lucy, All That Glitters 2, and Plataea.',
    context: 'These titles and roles are preserved in my earlier resume. Individual contributions are described without claiming sole authorship of the games.',
  },
]

export const projects = [
  { name: 'Ensemble', description: 'Hierarchical multi-agent software-development system with specialized roles, TDD workflows, execution monitoring, and feedback mechanisms.', url: 'https://github.com/wmbillock/ensemble' },
  { name: 'Abbiebot-9000', description: 'Persistent assistant architecture separating conversational transports from execution through Redis Streams, with durable task state and tiered memory.', url: 'https://github.com/wmbillock/Abbiebot-9000' },
]

export const writingAndSpeaking = [
  'Backand: developer evangelism through blogging, technical documentation, and direct community outreach; presentations at conferences and meetups throughout the US.',
  'Sprout Social: developed and delivered multiple unit-testing education sessions for engineers.',
]
