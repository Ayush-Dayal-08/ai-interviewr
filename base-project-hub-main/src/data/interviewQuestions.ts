export type InterviewCategory = "hr" | "technical";

export interface InterviewQuestion {
  id: number;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  category: InterviewCategory;
  difficulty: "medium" | "hard";
}

// ─── HR Interview Questions ───
const HR_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question:
      "Tell me about a time you had a major conflict with a coworker. How did you resolve it, and what would you do differently today?",
    modelAnswer:
      "In my previous role, a teammate and I disagreed on the architecture for a critical feature. Instead of escalating, I scheduled a one-on-one where we each presented our reasoning backed by data. We discovered both approaches had merit, so we combined the best parts into a hybrid solution. The outcome was a more resilient design and a stronger working relationship. Looking back, I would have initiated the conversation sooner to avoid the two days of tension. I learned that proactive communication and focusing on shared goals—rather than being right—leads to better outcomes.",
    keyPoints: [
      "specific example",
      "proactive communication",
      "data-driven",
      "compromise",
      "lesson learned",
      "outcome",
      "relationship",
    ],
    category: "hr",
    difficulty: "hard",
  },
  {
    id: 2,
    question:
      "Describe a situation where you failed to meet a deadline. What went wrong and how did you handle the fallout?",
    modelAnswer:
      "During a product launch, I underestimated the integration testing phase. When I realized we would miss the deadline by three days, I immediately informed my manager and stakeholders with a revised timeline and mitigation plan. I prioritized the most critical test cases, brought in a colleague to parallelize work, and delivered with a two-day delay instead of three. Post-mortem, I implemented buffer time in all future estimates and created a checklist for integration dependencies. This failure taught me that transparency and fast recovery matter more than perfection.",
    keyPoints: [
      "accountability",
      "early communication",
      "mitigation plan",
      "stakeholder management",
      "lesson learned",
      "process improvement",
      "transparency",
    ],
    category: "hr",
    difficulty: "hard",
  },
  {
    id: 3,
    question:
      "How do you prioritize when you have three urgent tasks from three different managers, all due today?",
    modelAnswer:
      "I would first assess each task's actual impact: which one affects the most customers, revenue, or team members? Then I'd communicate with all three managers, sharing my assessment and proposed order. If there's still conflict, I'd escalate to my direct manager for a tiebreaker. While working, I'd provide brief status updates so everyone knows the timeline. I also look for shortcuts—can any task be partially completed or delegated? The key is being transparent about capacity rather than silently struggling.",
    keyPoints: [
      "impact assessment",
      "prioritization",
      "communication",
      "escalation",
      "delegation",
      "transparency",
      "time management",
    ],
    category: "hr",
    difficulty: "medium",
  },
  {
    id: 4,
    question:
      "Give me an example of when you had to lead a team through an unpopular decision. How did you gain buy-in?",
    modelAnswer:
      "When our company decided to migrate from a beloved legacy system to a new platform, my team was resistant. I organized a town hall where I acknowledged their concerns openly, then presented the business case with concrete numbers—maintenance costs, security risks, and feature limitations. I created a transition roadmap with milestones and assigned each team member a role in shaping the new system. By giving them ownership and showing how it benefited their daily work, resistance turned into enthusiasm. Within two months, the team was actively championing the change.",
    keyPoints: [
      "empathy",
      "transparency",
      "data-driven reasoning",
      "ownership",
      "roadmap",
      "stakeholder engagement",
      "change management",
    ],
    category: "hr",
    difficulty: "hard",
  },
  {
    id: 5,
    question:
      "Tell me about the most creative solution you've ever implemented to solve a business problem.",
    modelAnswer:
      "Our customer support team was overwhelmed with repetitive queries, causing 48-hour response times. Instead of hiring more staff, I analyzed the top 50 questions and built an interactive FAQ chatbot using a simple decision tree. I also created template responses for agents. Within a month, 40% of queries were self-served, response time dropped to 6 hours, and customer satisfaction rose 20%. The creative part was reframing it as a customer empowerment tool rather than a cost-cutting measure, which got both management and support team buy-in.",
    keyPoints: [
      "problem identification",
      "creative thinking",
      "measurable results",
      "cost-effective",
      "stakeholder framing",
      "automation",
      "customer impact",
    ],
    category: "hr",
    difficulty: "medium",
  },
  {
    id: 6,
    question:
      "Describe a time when you received harsh feedback. How did you process it and what changed as a result?",
    modelAnswer:
      "During a quarterly review, my manager told me that while my technical work was strong, I was perceived as unapproachable by junior team members. Initially, I felt defensive, but I took 24 hours to reflect. I then asked three junior colleagues for honest feedback and confirmed the pattern. I started having weekly 15-minute coffee chats with team members, began explaining my reasoning in code reviews rather than just pointing out issues, and volunteered to mentor an intern. Six months later, my approachability score in peer reviews improved from 3.2 to 4.6 out of 5.",
    keyPoints: [
      "emotional intelligence",
      "self-reflection",
      "seeking feedback",
      "concrete actions",
      "measurable improvement",
      "growth mindset",
      "mentoring",
    ],
    category: "hr",
    difficulty: "hard",
  },
  {
    id: 7,
    question:
      "How do you ensure diversity and inclusion in your team decisions and daily interactions?",
    modelAnswer:
      "I actively practice inclusive behaviors: in meetings, I use a round-robin format to ensure quieter voices are heard. When hiring, I advocate for diverse interview panels and structured scorecards to reduce bias. I've organized workshops on unconscious bias and created a team norm of using inclusive language. In one instance, I noticed a colleague was consistently interrupted in meetings, so I started redirecting: 'I'd like to hear the rest of what Sarah was saying.' I believe inclusion isn't a policy—it's a daily practice in every interaction.",
    keyPoints: [
      "inclusive behaviors",
      "bias reduction",
      "diverse perspectives",
      "active allyship",
      "structured processes",
      "daily practice",
      "psychological safety",
    ],
    category: "hr",
    difficulty: "medium",
  },
  {
    id: 8,
    question:
      "Walk me through a time you had to make a critical decision with incomplete information. What was your process?",
    modelAnswer:
      "When a production outage hit and logs were incomplete, I had to decide whether to roll back the latest deploy or investigate further. I gathered available data: the timing correlated with our deploy, but the affected service was unchanged. I applied the 70% rule—make a decision when you have 70% of the information—and decided to roll back as the safer option while a team investigated root cause. The rollback resolved it. Post-incident, we found it was actually an infrastructure change that coincided with our deploy. I documented the decision framework so future on-calls could act faster.",
    keyPoints: [
      "risk assessment",
      "decision framework",
      "available data analysis",
      "bias for action",
      "documentation",
      "post-mortem",
      "team learning",
    ],
    category: "hr",
    difficulty: "hard",
  },
  {
    id: 9,
    question:
      "What motivates you beyond salary? How do you sustain motivation during repetitive or unglamorous work?",
    modelAnswer:
      "I'm driven by impact and mastery. Knowing that my work helps real people keeps me going through tedious phases. For repetitive tasks, I gamify them—I track my speed improvements, automate what I can, and listen to podcasts while doing manual work. I also connect boring tasks to the bigger picture: that data migration isn't exciting, but it unblocks the team for three months. I sustain energy by alternating deep work with creative side projects and setting micro-goals that give a sense of progress every few hours.",
    keyPoints: [
      "intrinsic motivation",
      "impact-driven",
      "gamification",
      "automation mindset",
      "big picture thinking",
      "self-management",
      "continuous learning",
    ],
    category: "hr",
    difficulty: "medium",
  },
  {
    id: 10,
    question:
      "If you discovered your manager was making an unethical decision, what would you do? Walk me through your exact steps.",
    modelAnswer:
      "First, I'd verify my understanding—am I seeing the full picture? I'd document specific facts without speculation. Then I'd have a private, respectful conversation with my manager: 'I noticed X and want to understand the reasoning.' If the explanation didn't resolve my concern, I'd escalate to HR or their manager, providing my documentation. I'd follow the company's ethics reporting process. Throughout, I'd focus on facts not emotions, maintain professionalism, and be prepared for potential discomfort. Ethical integrity isn't optional regardless of the personal cost.",
    keyPoints: [
      "verification",
      "documentation",
      "direct conversation",
      "escalation process",
      "ethics reporting",
      "professionalism",
      "integrity",
      "courage",
    ],
    category: "hr",
    difficulty: "hard",
  },
];

// ─── Technical Interview Questions ───
const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 11,
    question:
      "Explain the difference between a hash table and a balanced binary search tree. When would you choose one over the other?",
    modelAnswer:
      "A hash table provides O(1) average-case lookup, insertion, and deletion using a hash function to map keys to buckets. However, worst-case is O(n) with many collisions, and it doesn't maintain order. A balanced BST like AVL or Red-Black tree provides O(log n) for all operations but maintains sorted order, enabling range queries and ordered traversal. Choose a hash table when you need fastest possible lookups and don't need ordering—like caching or deduplication. Choose a BST when you need sorted data, range queries, or finding nearest elements—like implementing an ordered set or database index.",
    keyPoints: [
      "time complexity",
      "hash function",
      "collision handling",
      "ordered vs unordered",
      "range queries",
      "use cases",
      "trade-offs",
      "BST balancing",
    ],
    category: "technical",
    difficulty: "medium",
  },
  {
    id: 12,
    question:
      "Design a URL shortening service like bit.ly. Walk me through the architecture, database schema, and how you'd handle billions of URLs.",
    modelAnswer:
      "Architecture: A stateless API tier behind a load balancer, backed by a distributed key-value store. For encoding, use base62 of an auto-incrementing counter or a hash of the URL truncated to 7 characters. Database schema: a table with columns (short_code, original_url, created_at, expiry, click_count). For scale, shard by short_code hash across multiple database nodes. Use a CDN for 301 redirect caching. To handle billions: pre-generate short codes in batches, use Redis for hot URL caching with TTL, and implement rate limiting. Analytics via async event streaming to a data warehouse. For collision avoidance, use a counter-based approach with a distributed counter service like ZooKeeper.",
    keyPoints: [
      "base62 encoding",
      "database sharding",
      "caching",
      "load balancer",
      "collision handling",
      "scalability",
      "analytics",
      "distributed systems",
    ],
    category: "technical",
    difficulty: "hard",
  },
  {
    id: 13,
    question:
      "What is the CAP theorem? Give a real-world example of a system choosing each pair of guarantees.",
    modelAnswer:
      "The CAP theorem states that a distributed system can provide at most two of three guarantees: Consistency (every read returns the latest write), Availability (every request gets a response), and Partition tolerance (the system works despite network splits). CP example: MongoDB with majority write concern—during a partition, it sacrifices availability by refusing writes to maintain consistency. AP example: Cassandra—during a partition, it continues serving reads/writes but may return stale data. CA doesn't truly exist in distributed systems since partitions are inevitable, but a single-node PostgreSQL is effectively CA. In practice, you tune the trade-off: banking needs CP, social media feeds can use AP.",
    keyPoints: [
      "consistency",
      "availability",
      "partition tolerance",
      "trade-offs",
      "real examples",
      "distributed systems",
      "eventual consistency",
      "practical implications",
    ],
    category: "technical",
    difficulty: "hard",
  },
  {
    id: 14,
    question:
      "Explain how garbage collection works in a language you're familiar with. What are the trade-offs of different GC strategies?",
    modelAnswer:
      "In JavaScript/V8, garbage collection uses a generational approach. The young generation uses Scavenge (semi-space copying): memory is split into two spaces, live objects are copied from one to the other, and the old space is freed. Objects surviving multiple scavenges are promoted to the old generation, which uses Mark-Sweep-Compact: it marks all reachable objects from roots, sweeps unmarked ones, and compacts memory to reduce fragmentation. Trade-offs: reference counting is simple but can't handle circular references. Mark-sweep handles cycles but causes stop-the-world pauses. Generational GC optimizes for the hypothesis that most objects die young, reducing pause times. Concurrent/incremental collectors reduce pauses but add CPU overhead.",
    keyPoints: [
      "generational collection",
      "mark and sweep",
      "reference counting",
      "stop-the-world pauses",
      "memory fragmentation",
      "circular references",
      "roots and reachability",
      "trade-offs",
    ],
    category: "technical",
    difficulty: "hard",
  },
  {
    id: 15,
    question:
      "You have an array of 1 million integers. How would you find the k-th largest element efficiently? Analyze the time complexity.",
    modelAnswer:
      "The optimal approach is Quickselect, based on the partition step of Quicksort. Pick a pivot, partition the array so elements greater than the pivot are on one side. If the pivot's position equals k, we're done. Otherwise, recurse into the relevant partition. Average case is O(n), worst case O(n²). To guarantee O(n), use the Median of Medians algorithm for pivot selection. Alternative: use a min-heap of size k—iterate through the array, maintaining the k largest elements. Time: O(n log k), space O(k). For very large k close to n, a max-heap with extraction is better at O(n + k log n). Sorting works but is O(n log n)—overkill for a single query.",
    keyPoints: [
      "quickselect",
      "partition",
      "time complexity O(n)",
      "heap approach",
      "median of medians",
      "space complexity",
      "trade-offs",
      "average vs worst case",
    ],
    category: "technical",
    difficulty: "hard",
  },
  {
    id: 16,
    question:
      "What are the SOLID principles in object-oriented design? Give a practical violation and fix for each one.",
    modelAnswer:
      "S—Single Responsibility: A class should have one reason to change. Violation: a User class that handles authentication AND email sending. Fix: separate into User, Authenticator, and EmailService. O—Open/Closed: Open for extension, closed for modification. Violation: adding new payment types by modifying a switch statement. Fix: use a PaymentProcessor interface. L—Liskov Substitution: Subtypes must be substitutable for base types. Violation: Square extending Rectangle where setWidth changes height. Fix: use separate shapes or a Shape interface. I—Interface Segregation: Don't force clients to depend on methods they don't use. Violation: a fat IWorker interface with eat() for robots. Fix: split into IWorkable and IFeedable. D—Dependency Inversion: Depend on abstractions, not concretions. Violation: a Service directly instantiating MySQLDatabase. Fix: inject an IDatabase interface.",
    keyPoints: [
      "single responsibility",
      "open closed",
      "liskov substitution",
      "interface segregation",
      "dependency inversion",
      "practical examples",
      "violations and fixes",
      "abstraction",
    ],
    category: "technical",
    difficulty: "medium",
  },
  {
    id: 17,
    question:
      "Explain how HTTPS works from the moment a user types a URL to when the page loads. Include the TLS handshake.",
    modelAnswer:
      "1) DNS resolution: browser resolves domain to IP. 2) TCP connection: three-way handshake (SYN, SYN-ACK, ACK). 3) TLS handshake: Client Hello (supported ciphers, random number), Server Hello (chosen cipher, certificate, random number), client verifies certificate against trusted CAs, client generates pre-master secret encrypted with server's public key, both derive symmetric session keys from the three random values. 4) Secure channel established using symmetric encryption (AES). 5) HTTP request sent encrypted, server responds with encrypted HTML. 6) Browser parses HTML, makes additional HTTPS requests for CSS, JS, images. Key point: asymmetric encryption (slow) is only used during the handshake; actual data transfer uses symmetric encryption (fast).",
    keyPoints: [
      "DNS resolution",
      "TCP handshake",
      "TLS handshake",
      "certificate verification",
      "asymmetric encryption",
      "symmetric encryption",
      "session keys",
      "certificate authority",
    ],
    category: "technical",
    difficulty: "medium",
  },
  {
    id: 18,
    question:
      "What's the difference between SQL and NoSQL databases? Design a schema for an e-commerce platform and justify your choice.",
    modelAnswer:
      "SQL databases are relational, use structured schemas, support ACID transactions, and are ideal for complex joins—PostgreSQL, MySQL. NoSQL databases are non-relational, offer flexible schemas, and scale horizontally—MongoDB (document), Redis (key-value), Cassandra (wide-column), Neo4j (graph). For e-commerce, I'd use a hybrid: PostgreSQL for core transactional data (users, orders, payments) because ACID guarantees are critical for financial data. MongoDB for product catalog because products have varying attributes. Redis for session management and cart caching. The schema: Users(id, email, password_hash), Products(id, name, price, category_id), Orders(id, user_id, total, status, created_at), OrderItems(order_id, product_id, quantity, price).",
    keyPoints: [
      "ACID transactions",
      "schema flexibility",
      "horizontal scaling",
      "relational vs document",
      "use case justification",
      "hybrid approach",
      "data modeling",
      "trade-offs",
    ],
    category: "technical",
    difficulty: "medium",
  },
  {
    id: 19,
    question:
      "Explain the concept of event-driven architecture. How would you design a real-time notification system using it?",
    modelAnswer:
      "Event-driven architecture uses events as the primary communication mechanism between services. Producers emit events without knowing consumers. Components: event producers, event bus/broker (Kafka, RabbitMQ), event consumers. For a notification system: when an event occurs (new message, order update), the service publishes to a message broker. A notification service subscribes, determines the delivery channel (push, email, SMS), and dispatches via appropriate provider. Benefits: loose coupling, scalability (add consumers independently), resilience (broker persists events if consumer is down). Implementation: use Kafka for durability and ordering, have separate consumer groups for each notification type, implement dead letter queues for failures, and use WebSockets for real-time push to connected clients.",
    keyPoints: [
      "event producers consumers",
      "message broker",
      "loose coupling",
      "scalability",
      "WebSockets",
      "dead letter queue",
      "pub-sub pattern",
      "real-time delivery",
    ],
    category: "technical",
    difficulty: "hard",
  },
  {
    id: 20,
    question:
      "What is a race condition? Give an example in web development and explain three different strategies to prevent it.",
    modelAnswer:
      "A race condition occurs when the system's behavior depends on the timing of uncontrollable events—two operations compete to modify shared state. Web example: two users simultaneously buying the last item in stock. Both read inventory=1, both proceed to purchase, resulting in overselling. Prevention strategies: 1) Database-level locking: use SELECT FOR UPDATE to lock the row during the transaction, ensuring sequential access. 2) Optimistic concurrency control: add a version column; on update, check if version matches what was read, retry if not. 3) Atomic operations: use database atomic decrements (SET stock = stock - 1 WHERE stock > 0) so the operation is indivisible. Additional: use distributed locks (Redis SETNX) for cross-service coordination, or use message queues to serialize critical operations.",
    keyPoints: [
      "shared state",
      "timing dependency",
      "database locking",
      "optimistic concurrency",
      "atomic operations",
      "distributed locks",
      "practical example",
      "prevention strategies",
    ],
    category: "technical",
    difficulty: "hard",
  },
];

export const ALL_QUESTIONS: InterviewQuestion[] = [
  ...HR_QUESTIONS,
  ...TECHNICAL_QUESTIONS,
];

export function getQuestionsByCategory(
  category: InterviewCategory,
): InterviewQuestion[] {
  return category === "hr" ? [...HR_QUESTIONS] : [...TECHNICAL_QUESTIONS];
}

/**
 * Returns a shuffled copy of questions for the given category.
 */
export function getShuffledQuestions(
  category: InterviewCategory,
): InterviewQuestion[] {
  const questions = getQuestionsByCategory(category);
  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}
