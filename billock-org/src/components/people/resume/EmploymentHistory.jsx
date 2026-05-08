import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'

export default class EmploymentHistory extends Component {
  getData() {
    return ([
      {
        'key':uuidv4(),
        'start-date': 'August 2022',
        'end-date': undefined,
        'title': 'Staff Software Engineer',
        'company': 'Affirm, Inc.',
        'location': 'Remote',
        'responsibilities': [
          "Tech used: Python (Flask/SQLAlchemy), Databricks, Docker, Kubernetes, Airflow",
          "Worked to enhance quality of back-end machine learning pipelines",
          "Held architectural oversight for the pricing service, which serves 12 million requests per minute at five 9s of availability, while driving team quality and development practices to maximize delivery reliability",
          "Won a team hackathon and shipped one of the first production LLM integrations at Affirm",
          "Participated in the redesign of the software engineering interview process by developing a new screening question",
          "Provided mentorship and guidance to team members, while also working to level up the larger engineering organization",
          "Created and collaborated on many software designs, gathering feedback and buy-in before driving projects through development to delivery",
          "Improved development pipelines and reduced process inefficiencies to improve concurrent experimentation capacity by 400%",
          "Developed automated reporting to track financing program experimentation and configuration changes, supporting business needs"
        ]
      },
      {
        'key':uuidv4(),
        'start-date': 'June 2021',
        'end-date': 'April 2022',
        'title': 'Staff Software Development Engineer',
        'company': 'Recharge Payments',
        'location': 'Remote',
        'responsibilities': [
          "Tech used: Python (Flask/SQLAlchemy), Ruby (Rails), React, Google Cloud Platform, Shopify API",
          "Worked across multiple tech stacks in a cross-functional role with a focus on scalability and resiliency",
          "Established a technical design process to improve predictability of delivery and reduce bugs",
          "Worked with engineers to shepherd a complex technical workflows engine from a Redis/Sidekiq base to one built on top of Temporal and Go",
          "Mentored multiple engineers successfully while serving as a team lead",
          "Was routinely praised for my communication ability and professionalism"
        ]
      },
      {
        'key':uuidv4(),
        'start-date': 'September 2019',
        'end-date': 'June 2021',
        'title': 'Staff Software Engineer',
        'company': 'Chegg, Inc.',
        'location': 'Remote',
        'responsibilities': [
          "Tech used: Python (Flask/SQLAlchemy), AWS Lambda, AWS SAM, Salesforce, Kotlin",
          "As a staff engineer, I served as a central knowledge touchpoint for the lead processing system for the Thinkful property",
          "Mentored multiple engineers successfully while serving as a team lead",
          "Introduced a software design process that allowed the team to create a predictable velocity, allowing business partners to more effectively work alongside engineering",
          "Designed multiple systems and oversaw their progress from execution to completion",
          "Championed new technology and helped to evangelize patterns throughout the engineering organization",
          "Developed standards for code quality and ensured they were adhered to",
          "Learned new languages and techniques as needed to meet business goals",
          "Participated heavily in redesign of legacy monolith codebases into a microservice architecture"
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "May 2019",
        "end-date": "September 2019",
        "title": "Senior Software Engineer",
        "company": "StyleSeat",
        "location": "Remote",
        "responsibilities": [
          "Tech used: Python (Django), React, Elasticsearch",
          "Developed and delivered multiple features on time and under-budget",
          "Helped enhance code review standards, and served as a champion of unit testing"
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "October 2017",
        "end-date": "May 2019",
        "title": "Chapter Manager, Platform",
        "company": "Sprout Social",
        "location": "Chicago, IL",
        "responsibilities": [
          "Tech used: Python (Django), Java (Dropwizard), NodeJS, MySQL, AWS, Rackspace, Ruby (Rails)",
          "As an engineering manager, I served as direct supervisor to multiple engineers, guiding their performance and resolving conflicts while continuing to serve as a mentor to the engineering organization.",
          "Served successfully in a multidisciplinary role, balancing development deliverables with the needs of my reports while contributing to multiple org-wide programs and training initiatives",
          "Developed and delivered multiple sessions on unit testing, providing critical software engineering education.",
          "Successfully delivered on multiple projects with very short timelines, including GDPR remediation, a significant Rails upgrade that was completed in under a week (2.0 to 5.1), and taking over multiple orphaned edge services, bringing them to a modernized operational status (chef deployment, logstash aggregation, etc)",
          "Wrote production quality code in multiple languages, having picked up two while working on the product, for services that continue to operate efficiently and effectively.",
          "Successfully migrated 1,200 customers billed manually in Oracle Netsuite to a Recurly instance, significantly reducing back-office payment processing costs.",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "January 2017",
        "end-date": "October 2017",
        "title": "Director of Product Management",
        "company": "Backand",
        "location": "Tel Aviv/Remote",
        "responsibilities": [
          "Tech used: Node.JS, JavaScript, AngularJS, AWS Lambda, Microsoft Azure Functions, Google Cloud Functions, Amazon Alexa development, Serverless architectures and development",
          "Successfully managed inception, development, and launch of multiple customer-facing products",
          "Worked extensively with customers to identify pain points in the system, translating these needs and driving engineering implementation",
          "Successfully managed a distributed development team, ensuring all developers were fully utilized while also having full knowledge of the business reasons driving their tasks",
          "Served as the public face of the company, presenting at conferences and meetups throughout the US",
          "Performed developer evangelism via blogging, technical documentation, and direct community outreach",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "March 2015",
        "end-date": "January 2017",
        "title": "Principal Software Engineer",
        "company": "Invoice2go",
        "location": "Redwood City, CA",
        "responsibilities": [
          "Tech used: Ruby on Rails, Postgres, nginx, AngularJS, CircleCI, Git, Sidekiq, Capistrano",
          "Promoted from Lead Engineer due to repeated successful development projects",
          "Successfully managed a distributed development team, with team members located in Redwood City (California), Jakarta (Indonesia), and Sydney (Australia)",
          "Delivered multiple complex projects and integrations on time and under-budget, handling shifting requirements and business needs in a dynamic high-performance environment",
          "Directed every facet of the product development process, from product design through production deployment and maintenance",
          "Used established expertise in TDD to develop a system with zero production defects",
          "Built a payments system that served as the primary revenue driver for the organization, handling $8,000,000 USD in payment processing each week with 99.999% uptime",
          "Successfully integrated with multiple payment vendors in a multi-tenant payments platform with stringent response requirements",
          "Was routinely praised for technical expertise, architectural prowess, and quality of deliverables",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "December 2013",
        "end-date": "March 2015",
        "title": "Senior Software Engineer",
        "company": "Recsolu/Yello",
        "location": "Chicago, IL/Remote",
        "responsibilities": [
          "Tech used: Ruby on Rails, Postgres, JavaScript, Capistrano, Bitbucket",
          "Worked with Amazon S3 to implement resume bundling functionality for event attendees",
          "Cleaned up and organized 700+ unit tests, enhancing team code quality",
          "Worked successfully in a remote capacity, maintaining a high level of productivity and visibility",
          "Helped drive design decisions and highlight architectural improvements to existing Ruby applications",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "August 2012",
        "end-date": "December 2013",
        "title": "Senior Software Engineer",
        "company": "Enova Financial",
        "location": "Chicago, IL",
        "responsibilities": [
          "Tech used: Ruby on Rails, JavaScript, SOAP, REST APIs, Git, Rspec, Cucumber",
          "Received repeated and consistent praise on clarity of communications and project status updates",
          "Was consistently recognized for tenacity, detail orientation, and exemplary work ethic in pursuing solutions",
          "Implemented a fraud sampling application that allowed analysts to perform A/B testing on potential customers, increasing fraud detection capabilities and increasing revenue",
          "Implemented the Yodlee Financial Services API to provide account verification for new customers, reducing fraud and identifying additional customers that would have otherwise been dismissed",
          "Served as a lead developer for an in-house application that localized all common IT maintenance functionality into a single web interface",
          "Served as lead developer on functionality adding additional payment providers to the website, enhancing site stability and reducing business risk",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "August 2011",
        "end-date": "August 2012",
        "title": "Software Engineer",
        "company": "CPM Marketing Group",
        "location": "Madison, WI",
        "responsibilities": [
          "Tech used: ColdFusion, JavaScript, Postgres, SVN",
          "Implemented a high performance mass emailing application back end using Amazon SES, Java, and PostgreSQL",
          "Proposed, developed, and implemented a code review process resulting in a decrease in shipped defects",
          "Implemented new functionality using Google Maps API that assisted users in accomplishing their goals",
          "Consistently shipped low-defect solutions to numerous business problems while helping to revise the software development life cycle to reduce redundancy and increase code reliability",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "March 2010",
        "end-date": "August 2011",
        "title": "Senior Gaming Software Engineer",
        "company": "WMS Gaming, Inc.",
        "location": "Chicago, IL",
        "responsibilities": [
          "Tech used: ActionScript 3.0, C++, SVN",
          "Shipped titles: Hearts Of Venice, Griffin's Gate, I Love Lucy, All That Glitters 2, Plataea",
          "Assisted in setting strategy and objectives for new code artifacts, code reviews, and design meetings",
          "Developed multiple new systems within abbreviated time frames to ensure product success",
          "Received consistent praise of my ability to learn and operate independent of direction",
        ]

      },
      {
        'key':uuidv4(),
        "start-date": "August 2009",
        "end-date": "March 2010",
        "title": "Engineer",
        "company": "Trading Technologies",
        "location": "Chicago, IL",
        "responsibilities": [
          "Developed a multi-threaded messaging system for application permissions management",
          "Demonstrated ability to master complex tasks in a new environment quickly",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "February 2009",
        "end-date": "August 2009",
        "title": "Software Engineer",
        "company": "Enova Financial",
        "location": "Chicago, IL",
        "responsibilities": [
          "Implemented new credit reports using SOAP and Ruby to reduce customer fraud and increase revenues",
          "Documented existing functionality to ease the transition of new developers",
          "Served as a development lead for offshore resources",
          "Served as a technical knowledge base for project managers",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "August 2007",
        "end-date": "January 2009",
        "title": "Graphics Programmer",
        "company": "Raw Thrills, Inc.",
        "location": "Skokie, IL",
        "responsibilities": [
          "Implemented graphical effects in a DirectX 9 rendering engine",
          "Ported game engine from DirectX 8 to DirectX 9",
          "Built a reloadable shader debugger in HLSL and Cg",
        ]
      },
      {
        'key':uuidv4(),
        "start-date": "May 2006",
        "end-date": "August 2007",
        "title": "Gaming Software Engineer",
        "company": "WMS Gaming, Inc.",
        "location": "Chicago, IL",
        "responsibilities": []
      },
      {
        'key':uuidv4(),
        "start-date": "August 2004",
        "end-date": "May 2006",
        "title": "Application Developer Specialist",
        "company": "Allstate Insurance Co.",
        "location": "Northbrook, IL",
        "responsibilities": []
      }
    ]);
  }
  render() {
    var employment_list = this.getData().map( (item) => 
      <div key={uuidv4()}>
        <div>
          <span className="datespan">{item['start-date']}-{item['end-date'] === undefined ? 'Present' : item['end-date']}</span>
          &nbsp;----&nbsp;
          <span className="title">{item['title']}</span>
          &nbsp;----&nbsp;
          <span className="company-location">{item['company']}, {item['location']}</span>
          &nbsp;&nbsp;&nbsp;&nbsp;
        </div>
        <div>
          <ul>
            {item['responsibilities'].map((sub_item) => <li key={uuidv4()}>{sub_item}</li>)}
          </ul>
        </div>
      </div>
    );
    return (
      <div>
        <h2>Employment</h2>
        <div>
          {employment_list}
        </div>
      </div>
    )
  }
}
