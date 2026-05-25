export type ClaimDomain = "ai" | "news" | "technology";
export type EvidenceStance = "support" | "challenge" | "context";
export type AssessmentTarget = "attribution" | "veracity" | "context";
export type SourceQuality =
  | "primary"
  | "direct witness"
  | "reputable secondary"
  | "indirect secondary"
  | "unverifiable";

export type EvidenceEntry = {
  id: string;
  stance: EvidenceStance;
  assessmentTarget?: AssessmentTarget;
  summary: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceQuality: SourceQuality;
  submittedBy: string;
  createdAt: string;
  aiAssisted: boolean;
};

export type Claim = {
  id: string;
  title: string;
  body: string;
  domain: ClaimDomain;
  claimantName: string;
  subjectKind: string;
  sourceUrl: string;
  sourceTitle: string;
  sourcePublisher: string;
  sourceQuality: SourceQuality;
  attributionScore: number;
  attributionLabel: string;
  attributionExplanation: string;
  veracityScore: number;
  veracityLabel: string;
  veracityExplanation: string;
  createdAt: string;
  submittedBy: string;
  aiAssisted: boolean;
  evidence: EvidenceEntry[];
};

const highQualitySources = new Set<SourceQuality>(["primary", "direct witness"]);

export type ReviewMission = {
  title: string;
  stance: EvidenceStance;
  description: string;
  prompt: string;
};

export const seedClaims: Claim[] = [
  {
    id: "openai-gpt-4o-launch",
    title: "OpenAI announced GPT-4o as a multimodal flagship model in May 2024",
    body:
      "The attribution source directly describes GPT-4o as a flagship model handling text, audio, and image inputs and outputs.",
    domain: "ai",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/index/hello-gpt-4o/",
    sourceTitle: "Hello GPT-4o",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 96,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited source is OpenAI's own announcement, so the platform can attribute the claim directly to the organization.",
    veracityScore: 88,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "Primary launch material supports the existence and positioning of the model; independent performance claims still need separate evidence.",
    createdAt: "2026-05-25T12:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-openai-gpt-4o-primary",
        stance: "support",
        summary:
          "OpenAI's launch post identifies GPT-4o and describes its multimodal capabilities.",
        sourceUrl: "https://openai.com/index/hello-gpt-4o/",
        sourceTitle: "Hello GPT-4o",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:05:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "apple-wwdc-2024-apple-intelligence",
    title: "Apple introduced Apple Intelligence at WWDC 2024",
    body:
      "The source chain attributes the announcement to Apple and identifies Apple Intelligence as a personal intelligence system.",
    domain: "ai",
    claimantName: "Apple",
    subjectKind: "company",
    sourceUrl: "https://www.apple.com/newsroom/2024/06/introducing-apple-intelligence-for-iphone-ipad-and-mac/",
    sourceTitle: "Introducing Apple Intelligence for iPhone, iPad, and Mac",
    sourcePublisher: "Apple Newsroom",
    sourceQuality: "primary",
    attributionScore: 96,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim is sourced to Apple's official newsroom announcement.",
    veracityScore: 86,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The announcement supports that Apple introduced the feature family; rollout availability varies by device, region, and software version.",
    createdAt: "2026-05-25T12:08:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-apple-intelligence-primary",
        stance: "support",
        summary:
          "Apple's newsroom source describes the announcement and eligible product families.",
        sourceUrl: "https://www.apple.com/newsroom/2024/06/introducing-apple-intelligence-for-iphone-ipad-and-mac/",
        sourceTitle: "Introducing Apple Intelligence for iPhone, iPad, and Mac",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:10:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "anthropic-claude-3-5-sonnet",
    title: "Anthropic announced Claude 3.5 Sonnet in June 2024",
    body:
      "The attribution source says Anthropic released Claude 3.5 Sonnet and describes it as the first release in the Claude 3.5 model family.",
    domain: "ai",
    claimantName: "Anthropic",
    subjectKind: "company",
    sourceUrl: "https://www.anthropic.com/news/claude-3-5-sonnet",
    sourceTitle: "Claude 3.5 Sonnet",
    sourcePublisher: "Anthropic",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Anthropic's official announcement is a direct source for the launch claim.",
    veracityScore: 85,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The launch is supported by a primary source; comparative benchmark claims should be assessed individually.",
    createdAt: "2026-05-25T12:12:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-anthropic-sonnet-primary",
        stance: "support",
        summary:
          "Anthropic's announcement provides the launch date context and model-family positioning.",
        sourceUrl: "https://www.anthropic.com/news/claude-3-5-sonnet",
        sourceTitle: "Claude 3.5 Sonnet",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:13:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "eu-ai-act-2024",
    title: "The European Union adopted the AI Act in 2024",
    body:
      "EU institutional sources describe final adoption of the Artificial Intelligence Act in 2024.",
    domain: "technology",
    claimantName: "European Union",
    subjectKind: "organization",
    sourceUrl: "https://www.consilium.europa.eu/en/press/press-releases/2024/05/21/artificial-intelligence-ai-act-council-gives-final-green-light-to-the-first-worldwide-rules-on-ai/",
    sourceTitle: "Artificial intelligence act: Council gives final green light",
    sourcePublisher: "Council of the EU",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The Council source directly records final approval by an EU institution.",
    veracityScore: 89,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "Institutional sources support adoption; implementation dates require separate tracking.",
    createdAt: "2026-05-25T12:16:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-eu-ai-act-council",
        stance: "support",
        summary:
          "The Council announcement records the final green light for the AI Act.",
        sourceUrl: "https://www.consilium.europa.eu/en/press/press-releases/2024/05/21/artificial-intelligence-ai-act-council-gives-final-green-light-to-the-first-worldwide-rules-on-ai/",
        sourceTitle: "Council gives final green light to the AI Act",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:17:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "nvidia-blackwell-announcement",
    title: "NVIDIA announced the Blackwell platform in March 2024",
    body:
      "NVIDIA's GTC 2024 materials describe the Blackwell architecture and platform announcement.",
    domain: "technology",
    claimantName: "NVIDIA",
    subjectKind: "company",
    sourceUrl: "https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing",
    sourceTitle: "NVIDIA Blackwell Platform Arrives",
    sourcePublisher: "NVIDIA Newsroom",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "NVIDIA's newsroom post is the direct source for the platform announcement.",
    veracityScore: 84,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The announcement is well sourced; claims about customer delivery and performance need further evidence.",
    createdAt: "2026-05-25T12:19:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-nvidia-blackwell-primary",
        stance: "support",
        summary:
          "NVIDIA's announcement describes Blackwell as a platform for accelerated computing.",
        sourceUrl: "https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing",
        sourceTitle: "NVIDIA Blackwell Platform Arrives",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:20:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "microsoft-copilot-plus-pcs",
    title: "Microsoft introduced Copilot+ PCs in May 2024",
    body:
      "Microsoft's announcement describes Copilot+ PCs as a new category of Windows PCs designed for AI experiences.",
    domain: "technology",
    claimantName: "Microsoft",
    subjectKind: "company",
    sourceUrl: "https://blogs.microsoft.com/blog/2024/05/20/introducing-copilot-pcs/",
    sourceTitle: "Introducing Copilot+ PCs",
    sourcePublisher: "Microsoft",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited Microsoft blog post directly attributes the announcement to Microsoft.",
    veracityScore: 82,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The category announcement is supported; performance and feature-availability claims need device-specific evidence.",
    createdAt: "2026-05-25T12:22:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-ms-copilot-plus-primary",
        stance: "support",
        summary:
          "Microsoft's announcement names Copilot+ PCs and explains the device category.",
        sourceUrl: "https://blogs.microsoft.com/blog/2024/05/20/introducing-copilot-pcs/",
        sourceTitle: "Introducing Copilot+ PCs",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:23:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "google-gemini-1-5",
    title: "Google announced Gemini 1.5 with a long-context capability in 2024",
    body:
      "Google's source material describes Gemini 1.5 and highlights long-context understanding as a technical capability.",
    domain: "ai",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl: "https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/",
    sourceTitle: "Our next-generation model: Gemini 1.5",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Google's official blog is a primary attribution source for the model announcement.",
    veracityScore: 81,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The announcement supports the claim; practical long-context quality requires independent testing.",
    createdAt: "2026-05-25T12:25:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-google-gemini-primary",
        stance: "support",
        summary:
          "Google's post introduces Gemini 1.5 and describes its long-context window.",
        sourceUrl: "https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/",
        sourceTitle: "Our next-generation model: Gemini 1.5",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:26:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "meta-llama-3-release",
    title: "Meta released Llama 3 models in April 2024",
    body:
      "Meta's announcement says it released the first Llama 3 models and describes 8B and 70B parameter versions.",
    domain: "ai",
    claimantName: "Meta",
    subjectKind: "company",
    sourceUrl: "https://ai.meta.com/blog/meta-llama-3/",
    sourceTitle: "Introducing Meta Llama 3",
    sourcePublisher: "Meta AI",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Meta AI's announcement is a direct source for the release claim.",
    veracityScore: 84,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The release is source-backed; downstream license and benchmark claims need separate assessment.",
    createdAt: "2026-05-25T12:29:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-meta-llama3-primary",
        stance: "support",
        summary:
          "Meta's launch post describes the initial Llama 3 model releases.",
        sourceUrl: "https://ai.meta.com/blog/meta-llama-3/",
        sourceTitle: "Introducing Meta Llama 3",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:30:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "perplexity-pages-launch",
    title: "Perplexity launched Pages for generating shareable reports in 2024",
    body:
      "Perplexity's announcement describes Pages as a feature for turning research into shareable pages.",
    domain: "ai",
    claimantName: "Perplexity",
    subjectKind: "company",
    sourceUrl: "https://www.perplexity.ai/hub/blog/perplexity-pages",
    sourceTitle: "Introducing Perplexity Pages",
    sourcePublisher: "Perplexity",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited source is Perplexity's own product announcement.",
    veracityScore: 78,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The launch claim is supported by Perplexity's source; usefulness and output quality need user evidence.",
    createdAt: "2026-05-25T12:33:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-perplexity-pages-primary",
        stance: "support",
        summary:
          "The Perplexity post announces Pages and its intended report-generation workflow.",
        sourceUrl: "https://www.perplexity.ai/hub/blog/perplexity-pages",
        sourceTitle: "Introducing Perplexity Pages",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:34:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "mistral-large-2-release",
    title: "Mistral AI released Mistral Large 2 in July 2024",
    body:
      "Mistral AI's source material describes Mistral Large 2 as a new flagship model release.",
    domain: "ai",
    claimantName: "Mistral AI",
    subjectKind: "company",
    sourceUrl: "https://mistral.ai/news/mistral-large-2407/",
    sourceTitle: "Mistral Large 2",
    sourcePublisher: "Mistral AI",
    sourceQuality: "primary",
    attributionScore: 93,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim is attributed to Mistral AI's official announcement.",
    veracityScore: 80,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The release announcement supports the claim; comparative benchmark positioning needs additional corroboration.",
    createdAt: "2026-05-25T12:36:00+04:00",
    submittedBy: "Smith",
    aiAssisted: false,
    evidence: [
      {
        id: "ev-mistral-large-2-primary",
        stance: "support",
        summary:
          "Mistral AI's post identifies Mistral Large 2 and describes the release.",
        sourceUrl: "https://mistral.ai/news/mistral-large-2407/",
        sourceTitle: "Mistral Large 2",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T12:37:00+04:00",
        aiAssisted: false
      }
    ]
  },
  {
    id: "google-gemini-embedding-2-preview",
    title:
      "Google DeepMind announced Gemini Embedding 2 as a public-preview multimodal embedding model",
    body:
      "The attribution source describes Gemini Embedding 2 as a public-preview embedding model for multimodal retrieval and understanding workflows.",
    domain: "ai",
    claimantName: "Google DeepMind",
    subjectKind: "company",
    sourceUrl:
      "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/",
    sourceTitle: "Gemini Embedding 2",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited Google source directly attributes the model announcement to Google DeepMind.",
    veracityScore: 80,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The primary source supports the public-preview launch; performance and retrieval-quality claims need independent evaluation.",
    createdAt: "2026-05-25T13:40:00+04:00",
    submittedBy: "Rune",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-google-gemini-embedding-2-primary",
        stance: "support",
        summary:
          "Google's announcement identifies Gemini Embedding 2 and describes its public-preview status.",
        sourceUrl:
          "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/",
        sourceTitle: "Gemini Embedding 2",
        sourceQuality: "primary",
        submittedBy: "Rune",
        createdAt: "2026-05-25T13:41:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "microsoft-osmos-acquisition",
    title:
      "Microsoft announced an acquisition of Osmos to accelerate autonomous data engineering in Fabric",
    body:
      "The attribution source says Microsoft announced the Osmos acquisition and connects it to autonomous data engineering work in Microsoft Fabric.",
    domain: "technology",
    claimantName: "Microsoft",
    subjectKind: "company",
    sourceUrl:
      "https://blogs.microsoft.com/blog/2026/01/05/microsoft-announces-acquisition-of-osmos-to-accelerate-autonomous-data-engineering-in-fabric/",
    sourceTitle:
      "Microsoft announces acquisition of Osmos to accelerate autonomous data engineering in Fabric",
    sourcePublisher: "Microsoft",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Microsoft's official blog is a direct source for the acquisition announcement.",
    veracityScore: 82,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The primary announcement supports the acquisition claim; integration outcomes should be assessed with later product evidence.",
    createdAt: "2026-05-25T13:44:00+04:00",
    submittedBy: "Rune",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-microsoft-osmos-primary",
        stance: "support",
        summary:
          "Microsoft's source announces the Osmos acquisition and its intended Fabric data-engineering role.",
        sourceUrl:
          "https://blogs.microsoft.com/blog/2026/01/05/microsoft-announces-acquisition-of-osmos-to-accelerate-autonomous-data-engineering-in-fabric/",
        sourceTitle:
          "Microsoft announces acquisition of Osmos to accelerate autonomous data engineering in Fabric",
        sourceQuality: "primary",
        submittedBy: "Rune",
        createdAt: "2026-05-25T13:45:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "meta-ai-glasses-impact-grants",
    title: "Meta launched AI Glasses Impact Grants totaling nearly $2 million",
    body:
      "The attribution source describes Meta's grant program for wearable technology projects and states that the grants total nearly $2 million.",
    domain: "ai",
    claimantName: "Meta",
    subjectKind: "company",
    sourceUrl:
      "https://about.fb.com/news/2026/01/ai-glasses-impact-grants-wearable-technology-for-good/",
    sourceTitle: "AI Glasses Impact Grants",
    sourcePublisher: "Meta",
    sourceQuality: "primary",
    attributionScore: 93,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Meta's official news post is the direct source for the grant-program claim.",
    veracityScore: 81,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The program and total are supported by the primary source; grant awards and downstream impact need later evidence.",
    createdAt: "2026-05-25T13:48:00+04:00",
    submittedBy: "Rune",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-meta-ai-glasses-grants-primary",
        stance: "support",
        summary:
          "Meta's announcement describes the AI Glasses Impact Grants and the nearly $2 million total.",
        sourceUrl:
          "https://about.fb.com/news/2026/01/ai-glasses-impact-grants-wearable-technology-for-good/",
        sourceTitle: "AI Glasses Impact Grants",
        sourceQuality: "primary",
        submittedBy: "Rune",
        createdAt: "2026-05-25T13:49:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "nist-ai-agent-standards-initiative",
    title: "NIST launched an AI Agent Standards Initiative",
    body:
      "The attribution source identifies a NIST and CAISI standards initiative focused on AI agents.",
    domain: "technology",
    claimantName: "NIST / CAISI",
    subjectKind: "organization",
    sourceUrl: "https://www.nist.gov/node/1906621",
    sourceTitle: "AI Agent Standards Initiative",
    sourcePublisher: "NIST",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited NIST page is an official government source for the initiative.",
    veracityScore: 85,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The official source supports the initiative's existence; specific standards outputs should be tracked separately.",
    createdAt: "2026-05-25T13:52:00+04:00",
    submittedBy: "Rune",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-nist-ai-agent-standards-primary",
        stance: "support",
        summary:
          "NIST's page identifies the AI Agent Standards Initiative and its institutional context.",
        sourceUrl: "https://www.nist.gov/node/1906621",
        sourceTitle: "AI Agent Standards Initiative",
        sourceQuality: "primary",
        submittedBy: "Rune",
        createdAt: "2026-05-25T13:53:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "eu-ai-act-august-2026-applicability",
    title:
      "The European Commission says the EU AI Act is scheduled to become fully applicable on August 2, 2026, with exceptions",
    body:
      "The attribution source is an official European Commission FAQ describing the AI Act implementation timeline and exceptions.",
    domain: "technology",
    claimantName: "European Commission",
    subjectKind: "organization",
    sourceUrl:
      "https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act",
    sourceTitle: "Navigating the AI Act",
    sourcePublisher: "European Commission",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited European Commission FAQ is an official source for the implementation timeline.",
    veracityScore: 84,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The official FAQ supports the schedule, but applicability can vary by provision and jurisdictional context.",
    createdAt: "2026-05-25T13:56:00+04:00",
    submittedBy: "Rune",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-eu-ai-act-2026-faq",
        stance: "support",
        summary:
          "The European Commission FAQ gives the August 2, 2026 applicability date and notes exceptions.",
        sourceUrl:
          "https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act",
        sourceTitle: "Navigating the AI Act",
        sourceQuality: "primary",
        submittedBy: "Rune",
        createdAt: "2026-05-25T13:57:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-gpt-5-4-release",
    title: "OpenAI released GPT-5.4 across ChatGPT, the API, and Codex",
    body:
      "OpenAI's announcement says GPT-5.4 is available in ChatGPT, the API, and Codex, with GPT-5.4 Pro also released for higher-performance use cases.",
    domain: "ai",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
    sourceTitle: "Introducing GPT-5.4",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 96,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited OpenAI launch post is a primary source for the release and availability claim.",
    veracityScore: 82,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The release and availability claim is supported by OpenAI's source; performance claims need independent benchmark evidence.",
    createdAt: "2026-05-25T18:03:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-openai-gpt-5-4-primary",
        stance: "support",
        summary:
          "OpenAI's release post states that GPT-5.4 is available in ChatGPT, the API, and Codex.",
        sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
        sourceTitle: "Introducing GPT-5.4",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T18:04:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-122b-funding-round",
    title:
      "OpenAI said it closed a $122 billion funding round at an $852 billion post-money valuation",
    body:
      "The attribution source says OpenAI closed its latest funding round with committed capital and a stated post-money valuation.",
    domain: "ai",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/index/accelerating-the-next-phase-ai/",
    sourceTitle: "OpenAI raises $122 billion to accelerate the next phase of AI",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 96,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited OpenAI corporate post directly attributes the financing statement to OpenAI.",
    veracityScore: 76,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The primary company source supports the statement; financing details should gain confidence from filings or reputable secondary confirmation.",
    createdAt: "2026-05-25T18:05:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-openai-122b-funding-primary",
        stance: "support",
        summary:
          "OpenAI's corporate post states the committed-capital amount and post-money valuation.",
        sourceUrl: "https://openai.com/index/accelerating-the-next-phase-ai/",
        sourceTitle:
          "OpenAI raises $122 billion to accelerate the next phase of AI",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T18:06:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-gemini-3-pro-preview",
    title: "Google released Gemini 3 Pro in preview across Google products",
    body:
      "Google's Gemini 3 announcement says Gemini 3 Pro began in preview and was made available across a suite of Google products.",
    domain: "ai",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl:
      "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
    sourceTitle: "A new era of intelligence with Gemini 3",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited Google product announcement is a primary source for the Gemini 3 Pro preview claim.",
    veracityScore: 81,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The availability claim is supported by Google's source; benchmark and capability claims need separate independent evidence.",
    createdAt: "2026-05-25T18:07:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-google-gemini-3-pro-primary",
        stance: "support",
        summary:
          "Google's announcement describes Gemini 3 Pro in preview and available across Google products.",
        sourceUrl:
          "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
        sourceTitle: "A new era of intelligence with Gemini 3",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T18:08:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-gemini-3-5-flash-io-2026",
    title: "Google launched Gemini 3.5 Flash at I/O 2026",
    body:
      "Google's I/O 2026 announcement roundup says it launched Gemini 3.5 Flash and made it generally available through developer platforms.",
    domain: "ai",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl:
      "https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/",
    sourceTitle: "100 things we announced at Google I/O 2026",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited Google I/O roundup is a primary event source for the Gemini 3.5 Flash launch claim.",
    veracityScore: 80,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The launch and availability claim is supported by Google's source; model-performance comparisons need external testing.",
    createdAt: "2026-05-25T18:09:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-google-gemini-3-5-flash-primary",
        stance: "support",
        summary:
          "Google's I/O roundup says Gemini 3.5 Flash launched and was generally available through listed platforms.",
        sourceUrl:
          "https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/",
        sourceTitle: "100 things we announced at Google I/O 2026",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T18:10:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-claude-opus-4-7",
    title: "Anthropic made Claude Opus 4.7 available across Claude products",
    body:
      "Anthropic's announcement says Opus 4.7 is available across Claude products, its API, Amazon Bedrock, Google Cloud Vertex AI, and Microsoft Foundry.",
    domain: "ai",
    claimantName: "Anthropic",
    subjectKind: "company",
    sourceUrl: "https://www.anthropic.com/news/claude-opus-4-7",
    sourceTitle: "Introducing Claude Opus 4.7",
    sourcePublisher: "Anthropic",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The cited Anthropic launch post is a direct source for the Opus 4.7 availability claim.",
    veracityScore: 81,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The availability statement is supported by Anthropic's source; benchmark and quality claims should be assessed separately.",
    createdAt: "2026-05-25T18:11:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-anthropic-opus-4-7-primary",
        stance: "support",
        summary:
          "Anthropic's post states where Claude Opus 4.7 is available and lists the API model identifier.",
        sourceUrl: "https://www.anthropic.com/news/claude-opus-4-7",
        sourceTitle: "Introducing Claude Opus 4.7",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T18:12:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "eu-ai-act-enforcement-2025",
    title: "The EU AI Act began enforcement of its first provisions in February 2025",
    body:
      "The European Union's Artificial Intelligence Act, adopted in 2024, started enforcing its first prohibitions on unacceptable-risk AI systems in February 2025, with full enforcement planned in stages through 2027.",
    domain: "ai",
    claimantName: "European Commission",
    subjectKind: "institution",
    sourceUrl: "https://artificialintelligenceact.eu/",
    sourceTitle: "EU AI Act",
    sourcePublisher: "EU",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Official EU regulatory portal confirms the enforcement timeline and provisions.",
    veracityScore: 90,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The AI Act was formally adopted and its staged enforcement timeline is documented in official EU sources.",
    createdAt: "2026-05-25T19:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-eu-ai-act-official",
        stance: "support",
        summary:
          "The EU official documentation confirms the AI Act's phased enforcement beginning February 2025.",
        sourceUrl: "https://artificialintelligenceact.eu/",
        sourceTitle: "EU AI Act Official",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-generated-content-50-percent-web",
    title: "AI-generated content may constitute over 50% of internet text by 2026",
    body:
      "Multiple researchers and industry analysts have warned that AI-generated text could make up a majority of online content, raising concerns about 'model collapse' and information quality degradation.",
    domain: "ai",
    claimantName: "Various researchers",
    subjectKind: "research",
    sourceUrl: "https://www.europol.europa.eu/media-press/newsroom/news/criminal-use-of-chatgpt-assessed-in-new-europol-report",
    sourceTitle: "Europol assessment of AI-generated content risks",
    sourcePublisher: "Europol",
    sourceQuality: "reputable secondary",
    attributionScore: 55,
    attributionLabel: "Weak attribution",
    attributionExplanation:
      "Multiple sources make similar claims but with varying methodologies and definitions of 'AI-generated content.'",
    veracityScore: 45,
    veracityLabel: "Evidence inconclusive",
    veracityExplanation:
      "While the trend is real, the 50% threshold is difficult to verify and depends heavily on how 'AI-generated' is defined.",
    createdAt: "2026-05-25T19:10:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-ai-content-europol",
        stance: "support",
        summary:
          "Europol's report highlights the growing scale of AI-generated content online.",
        sourceUrl: "https://www.europol.europa.eu/media-press/newsroom/news/criminal-use-of-chatgpt-assessed-in-new-europol-report",
        sourceTitle: "Europol ChatGPT Assessment",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:10:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "nvidia-market-cap-3-trillion-2024",
    title: "NVIDIA briefly surpassed a $3 trillion market capitalization in 2024",
    body:
      "Driven by demand for AI training chips, NVIDIA's market cap crossed the $3 trillion threshold in mid-2024, briefly making it the world's most valuable public company.",
    domain: "technology",
    claimantName: "Financial press",
    subjectKind: "company",
    sourceUrl: "https://www.reuters.com/technology/nvidia-becomes-worlds-most-valuable-company-2024-06-18/",
    sourceTitle: "Nvidia becomes world's most valuable company",
    sourcePublisher: "Reuters",
    sourceQuality: "reputable secondary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Reuters and multiple financial outlets reported the milestone with market data.",
    veracityScore: 95,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "Market data is publicly verifiable and widely confirmed by financial reporting.",
    createdAt: "2026-05-25T19:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-nvidia-reuters",
        stance: "support",
        summary:
          "Reuters reported NVIDIA becoming the world's most valuable company with a $3.34T market cap.",
        sourceUrl: "https://www.reuters.com/technology/nvidia-becomes-worlds-most-valuable-company-2024-06-18/",
        sourceTitle: "Reuters: Nvidia most valuable company",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-training-energy-consumption-growing",
    title: "Training a single large AI model can consume as much energy as 5 cars over their lifetime",
    body:
      "Research from the University of Massachusetts Amherst estimated that training a single large transformer model can emit over 284 tons of CO2, comparable to the lifetime emissions of five average cars.",
    domain: "ai",
    claimantName: "Strubell et al.",
    subjectKind: "research",
    sourceUrl: "https://arxiv.org/abs/1906.02243",
    sourceTitle: "Energy and Policy Considerations for Deep Learning in NLP",
    sourcePublisher: "arXiv",
    sourceQuality: "primary",
    attributionScore: 88,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The peer-reviewed paper provides specific energy measurements for specific model architectures.",
    veracityScore: 65,
    veracityLabel: "Evidence mixed",
    veracityExplanation:
      "The original 2019 estimates are dated; modern training efficiency has improved, but model sizes have also grown dramatically.",
    createdAt: "2026-05-25T19:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-energy-arxiv",
        stance: "support",
        summary:
          "The original Strubell et al. paper documents specific energy measurements and CO2 equivalents.",
        sourceUrl: "https://arxiv.org/abs/1906.02243",
        sourceTitle: "Strubell et al. 2019",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:30:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-energy-challenge",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Training efficiency has improved significantly since 2019, and the comparison may be misleading for current models.",
        sourceUrl: "https://arxiv.org/abs/2104.10350",
        sourceTitle: "Carbon Emissions and Large Neural Network Training",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-revenue-projection-2025",
    title: "OpenAI projected over $11 billion in annualized revenue by late 2025",
    body:
      "Reports indicate OpenAI's revenue grew rapidly from $1.6B in 2023 to projections exceeding $11B annualized by 2025, primarily driven by ChatGPT subscriptions and API usage.",
    domain: "ai",
    claimantName: "The Information / OpenAI",
    subjectKind: "company",
    sourceUrl: "https://www.theinformation.com/articles/openai-revenue-surged-to-300-million-a-month",
    sourceTitle: "OpenAI Revenue Reporting",
    sourcePublisher: "The Information",
    sourceQuality: "reputable secondary",
    attributionScore: 72,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "Revenue projections come from credible tech press citing internal sources, not from OpenAI's official disclosures.",
    veracityScore: 70,
    veracityLabel: "Evidence suggests plausible",
    veracityExplanation:
      "Multiple credible outlets report similar figures but exact numbers are not independently audited.",
    createdAt: "2026-05-25T19:40:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-openai-revenue",
        stance: "support",
        summary:
          "The Information reported OpenAI reaching $300M/month in revenue, which annualizes to $3.6B+ and growing.",
        sourceUrl: "https://www.theinformation.com/articles/openai-revenue-surged-to-300-million-a-month",
        sourceTitle: "The Information: OpenAI Revenue",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "deepfake-detection-falling-behind",
    title: "Current deepfake detection tools fail to identify AI-generated content more than 30% of the time",
    body:
      "Multiple studies show that state-of-the-art deepfake detection systems have significant false negative rates, especially as generation technology improves faster than detection.",
    domain: "ai",
    claimantName: "Various academic studies",
    subjectKind: "research",
    sourceUrl: "https://arxiv.org/abs/2401.14556",
    sourceTitle: "Deepfake Detection: A Comprehensive Study",
    sourcePublisher: "arXiv",
    sourceQuality: "primary",
    attributionScore: 60,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "Aggregated from multiple studies with varying methodologies, making a single attribution difficult.",
    veracityScore: 55,
    veracityLabel: "Evidence inconclusive",
    veracityExplanation:
      "Detection accuracy varies wildly by domain (video, audio, text) and specific tool; the 30% figure is approximate.",
    createdAt: "2026-05-25T19:50:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-deepfake-study",
        stance: "support",
        summary:
          "Academic surveys document significant gaps in deepfake detection accuracy across modalities.",
        sourceUrl: "https://arxiv.org/abs/2401.14556",
        sourceTitle: "Deepfake Detection Survey 2024",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T19:50:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-coding-assistants-40-percent-code",
    title: "AI coding assistants now generate approximately 40% of new code at some major tech companies",
    body:
      "GitHub reported that Copilot generates about 40% of code in supported languages, and Google's internal data shows similar adoption rates for AI-assisted coding.",
    domain: "technology",
    claimantName: "GitHub / Google",
    subjectKind: "company",
    sourceUrl: "https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/",
    sourceTitle: "Research: Quantifying GitHub Copilot's Impact",
    sourcePublisher: "GitHub Blog",
    sourceQuality: "primary",
    attributionScore: 85,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "GitHub's own research blog provides first-party data on Copilot's code generation metrics.",
    veracityScore: 75,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "First-party data confirms high adoption; the 40% figure is specific to supported languages and may not generalize.",
    createdAt: "2026-05-25T20:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-copilot-research",
        stance: "support",
        summary:
          "GitHub's research shows Copilot generating significant portions of code in supported files.",
        sourceUrl: "https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/",
        sourceTitle: "GitHub Copilot Research",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T20:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-job-displacement-imf-estimate",
    title: "The IMF estimates AI could affect up to 40% of global jobs",
    body:
      "The International Monetary Fund published analysis suggesting AI will affect about 40% of jobs globally, with advanced economies more exposed at 60% due to higher cognitive task concentration.",
    domain: "ai",
    claimantName: "International Monetary Fund",
    subjectKind: "institution",
    sourceUrl: "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity",
    sourceTitle: "AI Will Transform the Global Economy",
    sourcePublisher: "IMF Blog",
    sourceQuality: "primary",
    attributionScore: 93,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The IMF's own blog post by the Managing Director provides the specific figures.",
    veracityScore: 70,
    veracityLabel: "Evidence suggests plausible",
    veracityExplanation:
      "The IMF's methodology is transparent but projections about future labor market impacts are inherently uncertain.",
    createdAt: "2026-05-25T20:05:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-imf-ai-jobs",
        stance: "support",
        summary:
          "The IMF Managing Director's blog post provides the 40% global and 60% advanced economy figures.",
        sourceUrl: "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity",
        sourceTitle: "IMF: AI and Global Economy",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T20:05:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "apple-on-device-ai-privacy-approach",
    title: "Apple's AI strategy prioritizes on-device processing for user privacy",
    body:
      "Apple has positioned its AI approach around on-device processing and 'Private Cloud Compute' to differentiate from competitors who rely primarily on cloud-based AI inference.",
    domain: "technology",
    claimantName: "Apple",
    subjectKind: "company",
    sourceUrl: "https://security.apple.com/blog/private-cloud-compute/",
    sourceTitle: "Private Cloud Compute: A new frontier for AI privacy in the cloud",
    sourcePublisher: "Apple Security Research",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Apple's security research blog directly describes their Private Cloud Compute architecture.",
    veracityScore: 80,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "Apple's stated architecture is well-documented; independent verification of actual privacy guarantees is ongoing.",
    createdAt: "2026-05-25T20:10:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-apple-pcc",
        stance: "support",
        summary:
          "Apple's security blog details the Private Cloud Compute architecture for privacy-preserving AI.",
        sourceUrl: "https://security.apple.com/blog/private-cloud-compute/",
        sourceTitle: "Apple: Private Cloud Compute",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T20:10:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "china-ai-chip-restrictions-impact",
    title: "US export controls on advanced AI chips significantly impacted China's AI development timeline",
    body:
      "The US imposed restrictions on exports of advanced semiconductors and chipmaking equipment to China starting in October 2022, with expanding scope in 2023 and 2024, affecting access to NVIDIA A100/H100 GPUs.",
    domain: "technology",
    claimantName: "US Bureau of Industry and Security",
    subjectKind: "institution",
    sourceUrl: "https://www.bis.gov/press-release/commerce-strengthens-restrictions-advanced-semiconductors-semiconductor-manufacturing",
    sourceTitle: "Commerce Strengthens Restrictions on Advanced Semiconductors",
    sourcePublisher: "Bureau of Industry and Security",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Official BIS press releases document the specific export control rules and their scope.",
    veracityScore: 60,
    veracityLabel: "Evidence mixed",
    veracityExplanation:
      "While restrictions are confirmed, their actual impact on China's AI timeline is debated — Chinese labs have shown workarounds and domestic chip development.",
    createdAt: "2026-05-25T20:15:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-bis-chips",
        stance: "support",
        summary:
          "The Bureau of Industry and Security's official announcements confirm the semiconductor export restrictions.",
        sourceUrl: "https://www.bis.gov/press-release/commerce-strengthens-restrictions-advanced-semiconductors-semiconductor-manufacturing",
        sourceTitle: "BIS: Semiconductor Restrictions",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T20:15:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-china-workarounds",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Reports indicate Chinese companies have found workarounds including domestic chip development and third-party procurement channels.",
        sourceUrl: "https://www.reuters.com/technology/china-uses-tricks-buy-american-chips-undercut-bidens-tech-war-2024-01-18/",
        sourceTitle: "Reuters: China chip workarounds",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-25T20:15:00+04:00",
        aiAssisted: true
      }
    ]
  }
];

export function findSeedClaim(id: string) {
  return seedClaims.find((claim) => claim.id === id);
}

export function evidenceCounts(claim: Claim) {
  return claim.evidence.reduce(
    (counts, item) => {
      counts[item.stance] += 1;
      return counts;
    },
    { support: 0, challenge: 0, context: 0 } satisfies Record<EvidenceStance, number>
  );
}

export function evidenceHealth(claim: Claim) {
  const counts = evidenceCounts(claim);
  const highQualityCount = claim.evidence.filter((item) =>
    highQualitySources.has(item.sourceQuality)
  ).length;
  const hasSupport = counts.support > 0;
  const hasChallenge = counts.challenge > 0;
  const hasHighQualitySource =
    highQualitySources.has(claim.sourceQuality) || highQualityCount > 0;

  return {
    ...counts,
    total: claim.evidence.length,
    highQualityCount,
    hasHighQualitySource,
    needsSupport: !hasSupport,
    needsChallenge: !hasChallenge,
    balanceLabel:
      hasSupport && hasChallenge
        ? "Two-sided evidence"
        : hasSupport
          ? "Needs challenge"
          : hasChallenge
            ? "Needs support"
            : "Needs evidence"
  };
}

export function reviewMission(claim: Claim): ReviewMission {
  const health = evidenceHealth(claim);

  if (health.needsChallenge) {
    return {
      title: "Find challenge evidence",
      stance: "challenge",
      description:
        "Look for a public source that disputes, limits, or materially qualifies this claim.",
      prompt:
        "Find one public source that challenges or limits the claim. Prefer a primary source, direct witness, regulator, standards body, or reputable secondary source. Do not use rumors or private-person claims."
    };
  }

  if (health.needsSupport) {
    return {
      title: "Find support evidence",
      stance: "support",
      description:
        "Look for a public source that independently supports the claim beyond the attribution source.",
      prompt:
        "Find one public source that supports the claim. Prefer a primary source, direct witness, regulator, standards body, or reputable secondary source. Do not use rumors or private-person claims."
    };
  }

  if (!health.hasHighQualitySource) {
    return {
      title: "Upgrade source quality",
      stance: "context",
      description:
        "Replace weak sourcing with a primary or direct-witness source so the assessment is more useful.",
      prompt:
        "Find a primary or direct-witness source for the claim, then add it as context evidence. Avoid anonymous, unverifiable, or circular sources."
    };
  }

  return {
    title: "Add context",
    stance: "context",
    description:
      "Add recent context that changes how the community should interpret this claim.",
    prompt:
      "Find one recent public source that adds useful context without hiding support or challenge evidence. Disclose AI assistance if you use it to summarize."
  };
}
