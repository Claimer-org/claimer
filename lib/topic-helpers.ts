import { evidenceCounts, seedClaims, type Claim } from "./claims";

export type TopicConfig = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  summary: string;
  intro: string[];
  keywords: string[];
  metricLabel: string;
  aboutName: string;
  filter: (claim: Claim) => boolean;
};

function claimText(claim: Claim) {
  return [
    claim.title,
    claim.body,
    claim.claimantName,
    claim.sourceTitle,
    claim.veracityExplanation,
    claim.attributionExplanation
  ].join(" ");
}

function matches(claim: Claim, pattern: RegExp) {
  return pattern.test(claimText(claim));
}

export const topicConfigs: TopicConfig[] = [
  {
    slug: "ai-claims",
    title: "AI Claims",
    headline: "AI Claims",
    description:
      "Browse source-backed AI claims about model launches, product claims, capability forecasts, and company announcements.",
    summary:
      "Community-assessed AI claims with attribution and veracity scored separately.",
    intro: [
      "AI companies regularly make bold claims about model capabilities, safety measures, and product launches. Claimer separates whether a source actually made the claim from whether the claim is supported by evidence.",
      "This topic collects AI claims with traceable source links and visible support, challenge, and context evidence."
    ],
    keywords: ["OpenAI", "Anthropic", "Google", "Meta", "LLM", "ChatGPT"],
    metricLabel: "AI claims tracked",
    aboutName: "Artificial intelligence claims",
    filter: (claim) =>
      claim.domain === "ai" ||
      matches(
        claim,
        /\b(GPT|Claude|Gemini|LLM|language model|ChatGPT|Llama|Mistral|DeepSeek|Anthropic|OpenAI|AI model)\b/i
      )
  },
  {
    slug: "llm-benchmarks",
    title: "LLM Benchmarks",
    headline: "LLM Benchmark Claims",
    description:
      "Track evidence around LLM benchmark claims, model capability claims, long-context claims, and AI coding performance.",
    summary:
      "Model capability claims grouped for reviewers who want benchmark and performance evidence.",
    intro: [
      "LLM benchmark and capability claims are easy to overstate because test conditions, model versions, and pricing change quickly.",
      "This topic highlights model-performance claims where reviewers can add primary benchmark links, independent replications, and counter-evidence."
    ],
    keywords: ["benchmark", "GPT", "Claude", "Gemini", "Llama", "coding"],
    metricLabel: "benchmark claims tracked",
    aboutName: "LLM benchmark claims",
    filter: (claim) =>
      matches(
        claim,
        /\b(benchmark|capabilit|performance|model|GPT|Claude|Gemini|Llama|Mistral|DeepSeek|coding|context|reasoning|professional computer tasks|trained|compute cost)\b/i
      )
  },
  {
    slug: "ai-safety",
    title: "AI Safety",
    headline: "AI Safety Claims",
    description:
      "Examine AI safety and risk claims about deepfakes, privacy, energy, jobs, responsible scaling, and academic integrity.",
    summary:
      "Safety and risk claims that need balanced support and challenge evidence.",
    intro: [
      "AI safety claims shape policy, investment, and public trust, but many depend on uncertain evidence.",
      "This topic groups claims about risk, deepfakes, jobs, privacy, responsible scaling, and integrity so contributors can improve the evidence chain."
    ],
    keywords: ["safety", "risk", "deepfake", "privacy", "jobs", "integrity"],
    metricLabel: "safety claims tracked",
    aboutName: "AI safety and risk claims",
    filter: (claim) =>
      matches(
        claim,
        /\b(safety|safe|risk|deepfake|energy|privacy|bias|alignment|responsible|scaling|displacement|job|worker|integrity|surveillance|tracking|academic integrity|generated work)\b/i
      )
  },
  {
    slug: "ai-regulation",
    title: "AI Regulation",
    headline: "AI Regulation Claims",
    description:
      "Review source-backed claims about AI regulation, policy, standards, export controls, and governance.",
    summary:
      "Policy and governance claims collected for reviewers tracking regulatory evidence.",
    intro: [
      "AI policy claims often compress complex legal milestones into simple headlines.",
      "This topic keeps regulatory claims close to primary sources, including institutional releases, standards work, and policy proposals."
    ],
    keywords: ["AI Act", "regulation", "policy", "NIST", "export controls"],
    metricLabel: "regulation claims tracked",
    aboutName: "AI regulation and governance claims",
    filter: (claim) =>
      matches(
        claim,
        /\b(AI Act|regulat|policy|governance|NIST|standard|Council|EU|federal|state-level|preempt|export control|CHIPS Act|government)\b/i
      )
  },
  {
    slug: "tech-verification",
    title: "Technology Verification",
    headline: "Technology Claim Verification",
    description:
      "Verify technology claims about chips, quantum computing, cybersecurity, hardware, robotics, and infrastructure.",
    summary:
      "Technology claims with source-backed evidence and transparent scoring.",
    intro: [
      "Technology announcements often mix real breakthroughs with optimistic positioning.",
      "This topic collects hardware, cybersecurity, infrastructure, robotics, and semiconductor claims for independent source-backed review."
    ],
    keywords: ["semiconductors", "quantum", "cybersecurity", "hardware"],
    metricLabel: "technology claims tracked",
    aboutName: "Technology claim verification",
    filter: (claim) =>
      claim.domain === "technology" ||
      matches(
        claim,
        /\b(chip|semiconductor|quantum|hardware|manufacturing|robot|device|processor|breach|outage|TSMC|NVIDIA|SpaceX|Neuralink|telecom|photonic)\b/i
      )
  }
];

export function findTopicConfig(slug: string) {
  return topicConfigs.find((topic) => topic.slug === slug);
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
    challengeCount: challengeTotal
  };
}
