import { seedClaims, evidenceCounts, type Claim } from "./claims";

export type TopicConfig = {
  slug: string;
  title: string;
  headline: string;
  summary: string;
  description: string;
  aboutName: string;
  metricLabel: string;
  intro: string[];
  keywords: string[];
  /** Filter function to select relevant claims from the seed data */
  filter: (claim: Claim) => boolean;
};

export const topicConfigs: TopicConfig[] = [
  {
    slug: "ai-claims",
    title: "AI Claims",
    headline: "AI Claims Fact Check",
    summary:
      "Claims about AI models, capabilities, and company announcements from OpenAI, Anthropic, Google, Meta, and more.",
    description:
      "Fact-check AI claims with source-backed evidence. Browse community-assessed claims about GPT-4o, Claude, Gemini, Llama, and other AI models with transparent scoring and traceable sources.",
    aboutName: "Artificial Intelligence Claims",
    metricLabel: "AI claims tracked",
    intro: [
      "AI companies regularly make bold claims about model capabilities, safety measures, and real-world performance. But how many of these claims hold up under scrutiny?",
      "This page collects community-assessed AI claims — each backed by traceable source links and scored on both attribution accuracy and veracity.",
    ],
    keywords: [
      "AI claims",
      "GPT-4o",
      "Claude",
      "Gemini",
      "LLM",
      "fact check",
      "AI verification",
    ],
    filter: (claim: Claim) =>
      claim.domain === "ai" ||
      /\b(GPT|Claude|Gemini|LLM|AI model|language model|ChatGPT|Llama|Mistral|DeepSeek|Anthropic|OpenAI)\b/i.test(
        claim.title + " " + claim.body
      ),
  },
  {
    slug: "ai-safety",
    title: "AI Safety",
    headline: "AI Safety & Risk Claims",
    summary:
      "Claims about AI alignment, existential risk, safety measures, and responsible AI development practices.",
    description:
      "Track and fact-check claims about AI safety, alignment research, existential risk, and responsible development. Source-backed evidence on AI safety debates.",
    aboutName: "AI Safety and Alignment",
    metricLabel: "safety claims tracked",
    intro: [
      "AI safety debates generate some of the most consequential claims in technology — from existential risk warnings to safety testing controversies.",
      "This page tracks community-assessed safety claims with traceable sources and transparent scoring.",
    ],
    keywords: [
      "AI safety",
      "alignment",
      "existential risk",
      "responsible AI",
      "AI ethics",
    ],
    filter: (claim: Claim) =>
      /\b(safety|safe|align|risk|existential|dangerous|harm|ethics|responsible|bias|fairness|guardrail|red team|jailbreak)\b/i.test(
        claim.title + " " + claim.body
      ),
  },
  {
    slug: "ai-regulation",
    title: "AI Regulation & Policy",
    headline: "AI Regulation & Policy Claims",
    summary:
      "Claims about government AI regulation, legislation, policy debates, and governance frameworks worldwide.",
    description:
      "Track and fact-check claims about AI regulation, government policy, and tech legislation with source-backed community evidence.",
    aboutName: "AI Regulation and Policy",
    metricLabel: "regulation claims tracked",
    intro: [
      "Governments worldwide are racing to regulate artificial intelligence, but claims about what's being regulated and whether regulations will work are often misleading.",
      "This page tracks community-assessed regulation claims with traceable sources and transparent scoring.",
    ],
    keywords: [
      "AI regulation",
      "EU AI Act",
      "AI policy",
      "tech legislation",
      "AI governance",
    ],
    filter: (claim: Claim) =>
      /\b(regulat|legislat|government|policy|law|executive order|EU AI Act|Congress|Senate|FTC|compliance|ban|moratorium|federal|state law|governance)\b/i.test(
        claim.title + " " + claim.body
      ),
  },
  {
    slug: "llm-benchmarks",
    title: "LLM Benchmarks",
    headline: "LLM Benchmark & Performance Claims",
    summary:
      "Claims about model performance, benchmark scores, capability evaluations, and cross-model comparisons.",
    description:
      "Fact-check claims about LLM benchmarks and AI model performance with source-backed community evidence.",
    aboutName: "LLM Benchmarks and AI Model Performance",
    metricLabel: "benchmark claims tracked",
    intro: [
      'Every major AI release comes with bold benchmark claims — "state of the art," "surpasses GPT-4," "human-level reasoning." But how reliable are these numbers?',
      "This page tracks community-assessed benchmark claims with traceable source links and independent scoring.",
    ],
    keywords: [
      "LLM benchmarks",
      "model performance",
      "MMLU",
      "HumanEval",
      "AI evaluation",
    ],
    filter: (claim: Claim) =>
      /\b(benchmark|score|performance|accuracy|evaluation|MMLU|HumanEval|GPQA|ARC|HellaSwag|TruthfulQA|comparison|outperform|surpass|state.of.the.art|SOTA|test|exam|rank|leaderboard|capability|pass rate|coding|math|reasoning)\b/i.test(
        claim.title + " " + claim.body
      ),
  },
  {
    slug: "tech-verification",
    title: "Tech Verification",
    headline: "Tech Verification & Industry Claims",
    summary:
      "Claims about technology products, launches, user metrics, partnerships, and industry developments.",
    description:
      "Track and fact-check technology industry claims with source-backed community evidence. Product launches, user metrics, and partnerships verified.",
    aboutName: "Technology Industry Verification",
    metricLabel: "tech claims tracked",
    intro: [
      "The technology industry generates a constant stream of claims about user growth, product capabilities, and partnerships — many of which go unverified.",
      "This page tracks community-assessed tech claims with traceable sources and transparent dual-scoring.",
    ],
    keywords: [
      "tech verification",
      "product claims",
      "user metrics",
      "industry news",
      "tech fact check",
    ],
    filter: (claim: Claim) =>
      claim.domain === "technology" ||
      /\b(users|revenue|launch|partner|acqui|invest|funding|valuation|product|market|growth|billion|million)\b/i.test(
        claim.title + " " + claim.body
      ),
  },
];

export function findTopicConfig(slug: string): TopicConfig | undefined {
  return topicConfigs.find((t) => t.slug === slug);
}

export function getTopicClaims(config: TopicConfig) {
  return seedClaims.filter(config.filter);
}

export function getTopicStats(claims: Claim[]) {
  let totalEvidence = 0;
  const domains = new Set<string>();
  let supportTotal = 0;
  let challengeTotal = 0;

  for (const claim of claims) {
    const counts = evidenceCounts(claim);
    totalEvidence += counts.support + counts.challenge + counts.context;
    supportTotal += counts.support;
    challengeTotal += counts.challenge;
    domains.add(claim.domain);
  }

  return {
    claimCount: claims.length,
    evidenceCount: totalEvidence,
    domainCount: domains.size,
    supportCount: supportTotal,
    challengeCount: challengeTotal,
  };
}
