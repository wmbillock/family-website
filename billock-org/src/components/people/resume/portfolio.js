import { employment } from './data'

export const shortEmployment = employment.slice(0, 3).map((job, index) => ({
  ...job,
  responsibilities: [
    job.responsibilities.slice(0, 6),
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
    "id": "agent-memory",
    "title": "Measured work-memory tooling for agents",
    "organization": "Affirm",
    "contribution": "Built and released an internal, local-first work-memory tool that collects engineering activity into a dated, cited knowledge base.",
    "approach": "Combined collectors, scoped retrieval, and source-backed memory for engineering work; the supplied calibration reports 15 collectors and about 1,500 tests.",
    "result": "A 288-run controlled evaluation reported 67% fewer tokens, 49% lower cost, and 58% lower wall-clock time per question, with no measured accuracy loss.",
    "context": "Figures come from my October 30, 2026 career calibration. The underlying dataset, model versions, task allocation, accuracy rubric, and uncertainty estimates are not published here. No measured accuracy loss is not a statistical equivalence claim. Employer implementation and personal projects remain separate."
  },
  {
    "id": "pricing-recovery",
    "title": "Leading a 14-team migration recovery",
    "organization": "Affirm",
    "contribution": "Leading recovery of a stalled cross-team migration, with a recovery RFC, an evidence inventory, and a review package for each of 14 teams.",
    "approach": "Ran six kickoff meetings in four days and aligned architecture review around a pre-peak audit and additional preparation.",
    "result": "Established the recovery plan and cross-team preparation; final migration delivery is not claimed.",
    "context": "The 14-team scope comes from the October 30, 2026 calibration. It describes coordination across teams, not direct reports. An older career account used a different team count; the records are retained privately rather than silently treated as the same observation."
  },
  {
    "id": "pricing-platform",
    "title": "Pricing and experimentation platform ownership",
    "organization": "Affirm",
    "contribution": "Owned the pricing-experiment lifecycle and management API, service-boundary designs, and platform standards.",
    "approach": "Made experiments accessible to engineers outside the pricing team, selected smaller cross-domain designs, and wrote reusable domain-model and design-specification standards.",
    "result": "Met the objective of reducing experiment setup time by 25%; two engineers developed independent ownership of the experiment platform.",
    "context": "The experiment-setup result is distinct from older concurrency-capacity claims. UK launch contributions preceded the later country-aware, multi-tenant RFC; the later design is not credited retroactively with enabling that launch."
  },
  {
    "id": "reliability",
    "title": "Safer migrations and operational ownership",
    "organization": "Affirm",
    "contribution": "Defined service SLAs and monitoring, built runbooks and change reporting, reinstated end-to-end tests, and developed synthetic shadow-traffic verification.",
    "approach": "Used dry-run defaults and an audit ledger for configuration migration, and designed a controlled migration to a different feature-flag and experimentation platform.",
    "result": "The feature-flag platform migration completed without an incident; operational tooling supported verification and on-call work.",
    "context": "The incident-free statement concerns that migration, not all service history. Non-public business volumes and system-scale figures are omitted."
  },
  {
    "id": "production-llm",
    "title": "Shipping LLM features and leading AI development practices",
    "organization": "Affirm",
    "contribution": "Originated and shipped the team portal's first LLM feature end to end, covering the PRD, React front end, server-side LLM proxy, security review, guide, and training.",
    "approach": "Used an implement-and-critique workflow that ran unattended for three weeks and produced more than 90 small pull requests under a reviewability contract. Served as division AI-retooling technical lead.",
    "result": "Delivered a production LLM feature and presented a keynote and context-management deep dive at an internal engineering AI conference of roughly 1,000 engineers.",
    "context": "Pull-request count describes generated work, not independently verified accepted features. The source records a hackathon entry that became the feature; competing win/attribution accounts remain a private reconciliation item. Employer-specific implementation is not published here."
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
  { name: 'Euphonia', description: 'Conversational interface to an evolutionary agent swarm with dual-tier PARA memory: shared project knowledge and focused agent-local experience. Designed to develop agent capabilities through training, independent evaluation and selection, preserving identity and learning across tasks and model changes.', url: 'https://billock.org/blog/talking-a-personal-ai-into-existence/' },
  { name: 'DrumSwarm International', description: 'Experimental platform exploring how persistent agent organizations develop specialization and collaboration. Uses a drum-corps domain model of training, team composition, repeated performance and independent adjudication to investigate reputation and organizational evolution.', url: 'https://github.com/wmbillock/DrumSwarmInternational' },
]

export const writingAndSpeaking = [
  'Affirm: keynote and deep dive on agent context management at an internal engineering AI conference of roughly 1,000 engineers.',
  'Backand: developer evangelism through blogging, technical documentation, and direct community outreach; presentations at conferences and meetups throughout the US.',
  'Sprout Social: developed and delivered multiple unit-testing education sessions for engineers.',
]
