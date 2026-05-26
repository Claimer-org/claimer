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
  },
  {
    id: "ai-agents-supply-chain-500b",
    title:
      "AI agents autonomously managing corporate supply chains expected to handle $500B in procurement by 2027",
    body:
      "McKinsey & Company projects that AI agents operating autonomously within corporate supply chains will manage approximately $500 billion in procurement decisions by 2027, driven by advances in multi-agent orchestration and real-time data integration.",
    domain: "ai",
    claimantName: "McKinsey & Company",
    subjectKind: "organization",
    sourceUrl:
      "https://www.mckinsey.com/capabilities/operations/our-insights/ai-agents-in-supply-chain-procurement-2026",
    sourceTitle: "AI Agents in Supply Chain: The $500B Procurement Frontier",
    sourcePublisher: "McKinsey & Company",
    sourceQuality: "reputable secondary",
    attributionScore: 85,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim is directly sourced from a McKinsey research report, a well-known management consultancy, though McKinsey's projections are analytical estimates rather than primary data.",
    veracityScore: 40,
    veracityLabel: "Evidence suggests uncertain",
    veracityExplanation:
      "The $500B figure is a forward-looking projection with significant uncertainty; current autonomous procurement deployments remain limited in scope and decision authority.",
    createdAt: "2026-05-26T01:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-gartner-supply-chain-ai",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Gartner's 2026 supply chain technology report identifies autonomous AI agents as a top-3 transformative technology, projecting that 45% of large enterprises will pilot agent-based procurement by 2027.",
        sourceUrl:
          "https://www.gartner.com/en/supply-chain/trends/ai-agents-autonomous-procurement",
        sourceTitle:
          "Gartner: Top Supply Chain Technology Trends 2026",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-supply-chain-skepticism",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Industry procurement leaders express skepticism about fully autonomous AI decision-making, citing liability concerns, supplier relationship complexity, and the inability of current AI to handle exception-heavy negotiations that dominate real-world procurement.",
        sourceUrl:
          "https://hbr.org/2026/04/why-autonomous-procurement-agents-arent-ready",
        sourceTitle:
          "HBR: Why Autonomous Procurement Agents Aren't Ready",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "fortune-500-chatgpt-ban-60pct",
    title:
      "More than 60% of Fortune 500 companies have banned employee use of ChatGPT for sensitive internal data",
    body:
      "A Reuters survey of corporate AI policies claims that over 60% of Fortune 500 companies have implemented formal restrictions or outright bans on employee use of ChatGPT and similar generative AI tools when handling sensitive internal data, intellectual property, or client information.",
    domain: "technology",
    claimantName: "Reuters",
    subjectKind: "company",
    sourceUrl:
      "https://www.reuters.com/technology/corporate-ai-policy-survey-fortune-500-chatgpt-restrictions-2026-05",
    sourceTitle:
      "Corporate AI Policy Survey: Fortune 500 ChatGPT Restrictions",
    sourcePublisher: "Reuters",
    sourceQuality: "reputable secondary",
    attributionScore: 70,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "Reuters is a reputable news organization, but the 60% figure relies on survey methodology and self-reporting by companies, which introduces potential response bias.",
    veracityScore: 55,
    veracityLabel: "Evidence mixed",
    veracityExplanation:
      "While many companies have issued AI usage policies, the 60% ban figure is contested by evidence showing widespread unofficial adoption and shadow AI usage across the same companies.",
    createdAt: "2026-05-26T01:02:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-company-ai-policies",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Multiple public company disclosures and SEC filings from JPMorgan, Samsung, Apple, and others confirm formal policies restricting generative AI use for internal data, lending credibility to the broader trend.",
        sourceUrl:
          "https://www.cnbc.com/2026/03/companies-banning-chatgpt-generative-ai-policies.html",
        sourceTitle:
          "CNBC: Major Companies Restricting ChatGPT Usage",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:02:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-shadow-ai-adoption",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "A Microsoft and LinkedIn Work Trend Index report found that 78% of AI users at large enterprises bring their own AI tools to work, suggesting that formal bans have limited practical effect and actual adoption rates contradict stated restrictions.",
        sourceUrl:
          "https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-2026",
        sourceTitle:
          "Microsoft Work Trend Index: AI at Work 2026",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:02:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-music-30pct-streaming-2028",
    title:
      "AI-generated music will account for 30% of all streaming content by 2028",
    body:
      "The CEO of Universal Music Group predicted at the 2026 Global Music Summit that AI-generated music — including fully synthetic compositions and AI-assisted productions — will constitute 30% of all music streaming content by 2028, fundamentally reshaping royalty structures and artist economics.",
    domain: "ai",
    claimantName: "Universal Music Group CEO",
    subjectKind: "organization",
    sourceUrl:
      "https://variety.com/2026/music/news/universal-music-ceo-ai-generated-music-30-percent-streaming-1236789012/",
    sourceTitle:
      "UMG CEO Predicts AI-Generated Music Will Hit 30% of Streaming by 2028",
    sourcePublisher: "Variety",
    sourceQuality: "reputable secondary",
    attributionScore: 80,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim is attributed through a reputable entertainment trade publication reporting on a named executive's public keynote remarks.",
    veracityScore: 35,
    veracityLabel: "Evidence suggests uncertain",
    veracityExplanation:
      "The 30% projection is speculative and lacks methodological backing; current AI music represents a small fraction of streams, and regulatory and quality barriers may limit growth.",
    createdAt: "2026-05-26T01:04:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-spotify-ai-music-growth",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Spotify's 2026 Q1 transparency report showed AI-generated or AI-assisted tracks grew 340% year-over-year and now represent approximately 8% of new uploads, suggesting a rapid growth trajectory that could approach the predicted figure.",
        sourceUrl:
          "https://newsroom.spotify.com/2026-04-ai-music-transparency-report/",
        sourceTitle:
          "Spotify Newsroom: AI Music Transparency Report Q1 2026",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:04:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-ai-music-quality-regulation",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Music industry analysts and the Recording Industry Association argue that AI-generated music faces significant quality ceilings, listener fatigue, and emerging EU regulatory frameworks requiring AI content labeling — all of which could suppress rather than accelerate streaming share growth.",
        sourceUrl:
          "https://www.billboard.com/pro/ai-generated-music-regulation-quality-barriers-2026/",
        sourceTitle:
          "Billboard: AI Music Faces Regulation and Quality Barriers",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:04:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "open-source-ai-5pct-gap",
    title:
      "Open-source AI models have closed the capability gap with proprietary models to within 5%",
    body:
      "Meta AI Research claims that open-source large language models, specifically Llama 4, have narrowed the performance gap with leading proprietary models like GPT-4o and Claude to within 5% across major benchmarks, challenging the assumption that closed-source development is necessary for frontier capabilities.",
    domain: "ai",
    claimantName: "Meta AI Research",
    subjectKind: "organization",
    sourceUrl:
      "https://ai.meta.com/blog/llama-4-open-source-closing-the-gap/",
    sourceTitle: "Llama 4: Closing the Gap with Open Source",
    sourcePublisher: "Meta AI",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim originates from Meta AI's official research blog, making it a primary source for Meta's own assertion about Llama 4 performance.",
    veracityScore: 50,
    veracityLabel: "Evidence mixed",
    veracityExplanation:
      "Benchmark parity claims are contested; while open-source models show strong results on standard benchmarks, enterprise deployment, instruction-following quality, and safety alignment gaps remain less documented.",
    createdAt: "2026-05-26T01:06:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-llama-benchmark-parity",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Independent evaluations on MMLU, HumanEval, and MATH benchmarks show Llama 4 405B scoring within 2-5% of GPT-4o and Claude 3.5 Sonnet, corroborating Meta's narrowing-gap claim on standardized benchmarks.",
        sourceUrl:
          "https://arxiv.org/abs/2605.12345",
        sourceTitle:
          "Independent LLM Benchmark Comparison: Open vs. Proprietary Models (May 2026)",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:06:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-enterprise-deployment-gaps",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Enterprise AI deployment reports from Databricks and Anyscale indicate that open-source models require 3-5x more engineering effort for production-grade safety, reliability, and compliance — suggesting the capability gap is larger than benchmark scores imply in real-world settings.",
        sourceUrl:
          "https://www.databricks.com/blog/state-of-enterprise-ai-2026",
        sourceTitle:
          "Databricks: State of Enterprise AI 2026",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:06:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "autonomous-ai-research-agents-papers",
    title:
      "Autonomous AI research agents produced 3 peer-reviewed papers without human intervention",
    body:
      "Stanford's Institute for Human-Centered AI (HAI) reported that autonomous AI research agents independently designed experiments, ran analyses, and drafted 3 papers that passed peer review at recognized venues — all without direct human intervention beyond initial goal specification.",
    domain: "ai",
    claimantName: "Stanford HAI",
    subjectKind: "organization",
    sourceUrl:
      "https://hai.stanford.edu/news/autonomous-ai-research-agents-quarterly-report-q1-2026",
    sourceTitle:
      "Autonomous AI Research Agents: HAI Quarterly Report Q1 2026",
    sourcePublisher: "Stanford HAI",
    sourceQuality: "primary",
    attributionScore: 75,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "Stanford HAI is a credible research institute and the report is a primary source, though the exact definition of 'without human intervention' requires scrutiny given the initial goal-setting and infrastructure setup.",
    veracityScore: 45,
    veracityLabel: "Evidence suggests uncertain",
    veracityExplanation:
      "While the published papers exist, significant questions remain about the degree of autonomy claimed, the rigor of the peer review venues, and whether human oversight was more extensive than reported.",
    createdAt: "2026-05-26T01:08:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-hai-published-papers",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Three papers listed in the HAI report appear in proceedings of recognized ML workshops and a second-tier NLP conference, with author metadata indicating the AI agent system as sole contributor and HAI researchers listed only as system developers.",
        sourceUrl:
          "https://hai.stanford.edu/research/autonomous-agents-publications",
        sourceTitle:
          "Stanford HAI: Autonomous Agent Publications List",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:08:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-methodology-oversight-concerns",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "AI research methodology critics, including researchers at DeepMind, argue that the 'without human intervention' framing is misleading — noting that human researchers selected the research questions, curated training data, defined evaluation criteria, and iteratively debugged agent failures before the final successful runs.",
        sourceUrl:
          "https://www.nature.com/articles/d41586-026-01234-5",
        sourceTitle:
          "Nature: The Autonomy Illusion in AI Research Agents",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T01:08:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ibm-quantum-eagle-1121-qubits",
    title: "IBM unveiled a 1,121-qubit quantum processor named Condor in December 2023",
    body:
      "IBM announced the Condor quantum processor with 1,121 superconducting qubits at the IBM Quantum Summit 2023, claiming it was the world's largest gate-based quantum processor at the time of announcement.",
    domain: "technology",
    claimantName: "IBM",
    subjectKind: "company",
    sourceUrl:
      "https://newsroom.ibm.com/2023-12-04-IBM-Debuts-Next-Generation-Quantum-Processor-and-IBM-Quantum-System-Two",
    sourceTitle:
      "IBM Debuts Next-Generation Quantum Processor & IBM Quantum System Two",
    sourcePublisher: "IBM Newsroom",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "IBM's own newsroom press release is the primary source for this announcement, clearly attributing the claim to the company.",
    veracityScore: 80,
    veracityLabel: "Mostly supported",
    veracityExplanation:
      "IBM did unveil a 1,121-qubit processor. However, qubit count alone doesn't indicate practical quantum advantage — error rates and coherence times matter significantly.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-ibm-condor-press",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "IBM's official press release confirms the Condor processor with 1,121 qubits was unveiled at the IBM Quantum Summit on December 4, 2023.",
        sourceUrl:
          "https://newsroom.ibm.com/2023-12-04-IBM-Debuts-Next-Generation-Quantum-Processor-and-IBM-Quantum-System-Two",
        sourceTitle: "IBM Newsroom: Next-Generation Quantum Processor",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-ibm-condor-challenge",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Quantum computing researchers note that IBM simultaneously announced a shift in strategy toward smaller, more error-corrected processors (Heron), suggesting the large qubit count of Condor was less practically significant than the headline implied.",
        sourceUrl:
          "https://www.nature.com/articles/d41586-023-03854-1",
        sourceTitle:
          "Nature: IBM shifts quantum-computing strategy",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "tesla-optimus-gen-2-walking",
    title: "Tesla demonstrated Optimus Gen 2 humanoid robot walking and performing tasks in December 2023",
    body:
      "Tesla released a video showing the Optimus Gen 2 humanoid robot walking, performing squats, and handling eggs with improved dexterity compared to the first generation, with Elon Musk claiming it would eventually cost less than $20,000.",
    domain: "technology",
    claimantName: "Elon Musk / Tesla",
    subjectKind: "company",
    sourceUrl:
      "https://twitter.com/Tesla/status/1734727688667771089",
    sourceTitle:
      "Tesla official post: Optimus Gen 2 demonstration",
    sourcePublisher: "Tesla (X/Twitter)",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "The demonstration video was posted from Tesla's official account. The $20,000 price claim comes from Elon Musk's statements at various events.",
    veracityScore: 50,
    veracityLabel: "Partially supported",
    veracityExplanation:
      "The robot demonstration is verified, but the video showed controlled demo conditions. The sub-$20,000 price claim remains unverified and many robotics experts are skeptical of the timeline.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-optimus-demo-video",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Tesla's official video on X shows Optimus Gen 2 walking with improved biomechanics, performing squats, and gently handling eggs.",
        sourceUrl: "https://twitter.com/Tesla/status/1734727688667771089",
        sourceTitle: "Tesla official Optimus Gen 2 video",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-optimus-skepticism",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Robotics researchers from MIT and Boston Dynamics have noted that demo videos do not represent real-world capability, and the sub-$20,000 price target contradicts current humanoid robot economics.",
        sourceUrl:
          "https://spectrum.ieee.org/tesla-optimus-robot",
        sourceTitle:
          "IEEE Spectrum: Tesla Optimus analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "crowdstrike-outage-july-2024",
    title: "CrowdStrike caused the largest IT outage in history on July 19, 2024, affecting 8.5 million Windows devices",
    body:
      "A faulty content update from CrowdStrike's Falcon sensor caused approximately 8.5 million Windows devices worldwide to crash with blue screens, grounding flights, disrupting hospitals, and taking banks offline in what has been called the largest IT outage in history.",
    domain: "technology",
    claimantName: "CrowdStrike / Microsoft",
    subjectKind: "company",
    sourceUrl:
      "https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/",
    sourceTitle:
      "Microsoft: Helping our customers through the CrowdStrike outage",
    sourcePublisher: "Microsoft Blog",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Both CrowdStrike and Microsoft acknowledged the outage in official blog posts. The 8.5 million figure comes from Microsoft's official post.",
    veracityScore: 90,
    veracityLabel: "Strongly supported",
    veracityExplanation:
      "The outage is extensively documented. The 8.5 million device count comes from Microsoft. The 'largest IT outage in history' claim is supported by multiple industry analysts.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-crowdstrike-microsoft-blog",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Microsoft's official blog post confirms 8.5 million Windows devices were affected and details the recovery assistance provided.",
        sourceUrl:
          "https://blogs.microsoft.com/blog/2024/07/20/helping-our-customers-through-the-crowdstrike-outage/",
        sourceTitle: "Microsoft Blog: CrowdStrike outage response",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-crowdstrike-root-cause",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "CrowdStrike's own root cause analysis confirmed a content configuration update for the Falcon sensor triggered the crashes, not a cyberattack.",
        sourceUrl:
          "https://www.crowdstrike.com/blog/falcon-update-for-windows-hosts-technical-details/",
        sourceTitle: "CrowdStrike: Technical Details on Falcon Update",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-willow-quantum-chip-2024",
    title: "Google claimed its Willow quantum chip solved a computation in under 5 minutes that would take classical supercomputers 10 septillion years",
    body:
      "Google announced in December 2024 that its Willow quantum chip with 105 qubits achieved a random circuit sampling benchmark result in under 5 minutes that would require classical supercomputers approximately 10 septillion years to complete.",
    domain: "technology",
    claimantName: "Google / Hartmut Neven",
    subjectKind: "company",
    sourceUrl:
      "https://blog.google/technology/research/google-willow-quantum-chip/",
    sourceTitle:
      "Google Blog: Meet Willow, our state-of-the-art quantum chip",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Google's official blog post and Nature publication clearly attribute the claim. Hartmut Neven, head of Google Quantum AI, authored the announcement.",
    veracityScore: 65,
    veracityLabel: "Partially supported",
    veracityExplanation:
      "The benchmark result is published in Nature and verified. However, random circuit sampling has limited practical utility, and the classical comparison is theoretical rather than demonstrated.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-willow-nature-paper",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "The peer-reviewed Nature paper confirms the random circuit sampling results and the exponential advantage claim over classical simulation.",
        sourceUrl:
          "https://www.nature.com/articles/s41586-024-08449-y",
        sourceTitle: "Nature: Quantum error correction below the surface code threshold with superconducting qubits",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-willow-practical-critique",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Quantum computing critics note that random circuit sampling is a benchmark specifically designed to be hard for classical computers but has no known practical applications, making the comparison misleading.",
        sourceUrl:
          "https://www.quantamagazine.org/quantum-computers-are-starting-to-become-useful-20241209/",
        sourceTitle: "Quanta Magazine: Quantum Computers analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "figure-ai-bmw-factory-deployment",
    title: "Figure AI deployed humanoid robots in a BMW manufacturing facility in early 2024",
    body:
      "Figure AI announced its Figure 01 humanoid robots were deployed at a BMW manufacturing plant in Spartanburg, South Carolina, marking one of the first commercial deployments of general-purpose humanoid robots in automotive manufacturing.",
    domain: "technology",
    claimantName: "Figure AI / Brett Adcock",
    subjectKind: "company",
    sourceUrl:
      "https://www.figure.ai/news/figure-partners-with-bmw",
    sourceTitle: "Figure AI partners with BMW Manufacturing",
    sourcePublisher: "Figure AI",
    sourceQuality: "primary",
    attributionScore: 85,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Figure AI's official announcement and BMW's confirmation both attribute the partnership. CEO Brett Adcock discussed it publicly.",
    veracityScore: 60,
    veracityLabel: "Partially supported",
    veracityExplanation:
      "The partnership is confirmed, but details about the scope of deployment and actual autonomous task completion remain limited compared to the marketing framing.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-figure-bmw-announcement",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Figure AI's official website confirms the BMW partnership and deployment of humanoid robots at the Spartanburg facility.",
        sourceUrl: "https://www.figure.ai/news/figure-partners-with-bmw",
        sourceTitle: "Figure AI: BMW partnership announcement",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-figure-bmw-scope-questions",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Industry analysts note the deployment involved a small number of robots performing limited tasks, far from the autonomous general-purpose manufacturing implied by the announcement.",
        sourceUrl:
          "https://www.reuters.com/technology/figure-ai-humanoid-robots-2024/",
        sourceTitle: "Reuters: Figure AI humanoid robot deployment",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "tsmc-2nm-mass-production-2025",
    title: "TSMC announced mass production of 2nm chips (N2) would begin in the second half of 2025",
    body:
      "Taiwan Semiconductor Manufacturing Company announced its N2 (2-nanometer) process technology would enter mass production in the second half of 2025, using gate-all-around transistor architecture for the first time.",
    domain: "technology",
    claimantName: "TSMC / C.C. Wei",
    subjectKind: "company",
    sourceUrl:
      "https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm",
    sourceTitle: "TSMC N2 Technology Overview",
    sourcePublisher: "TSMC",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "TSMC CEO C.C. Wei made this announcement at multiple earnings calls and the technology day. The timeline is documented in investor relations materials.",
    veracityScore: 70,
    veracityLabel: "Mostly supported",
    veracityExplanation:
      "TSMC's track record on process node timelines is generally good, but 'mass production' definitions vary and the timeline remains forward-looking.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-tsmc-n2-official",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "TSMC's official technology page and investor presentations confirm the N2 timeline and gate-all-around architecture.",
        sourceUrl:
          "https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm",
        sourceTitle: "TSMC: N2 Technology",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-tsmc-n2-yield-concerns",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Industry reports suggest early N2 yields may be lower than expected, potentially delaying true mass production despite the official timeline.",
        sourceUrl:
          "https://www.tomshardware.com/tech-industry/tsmc-2nm",
        sourceTitle: "Tom's Hardware: TSMC 2nm yield analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "spacex-starship-fourth-flight-reentry",
    title: "SpaceX achieved the first successful controlled reentry and splashdown of Starship's upper stage in June 2024",
    body:
      "On the fourth integrated flight test (IFT-4) on June 6, 2024, SpaceX successfully landed Starship's Super Heavy booster and achieved a controlled reentry and soft splashdown of the Ship (upper stage) in the Indian Ocean for the first time.",
    domain: "technology",
    claimantName: "SpaceX",
    subjectKind: "company",
    sourceUrl:
      "https://www.spacex.com/launches/mission/?missionId=starship-flight-4",
    sourceTitle: "SpaceX: Starship Flight 4 Mission",
    sourcePublisher: "SpaceX",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "SpaceX live-streamed the flight and published mission details on their website. The flight was independently tracked by multiple agencies.",
    veracityScore: 85,
    veracityLabel: "Strongly supported",
    veracityExplanation:
      "The flight was broadcast live and independently verified. Both stages achieved their primary objectives, with the Ship completing a controlled reentry and soft water landing despite some heat shield tile damage.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-spacex-ift4-webcast",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "SpaceX's live webcast showed the Ship surviving reentry, deploying its landing burn, and achieving a soft splashdown in the Indian Ocean.",
        sourceUrl: "https://www.spacex.com/launches/mission/?missionId=starship-flight-4",
        sourceTitle: "SpaceX: IFT-4 mission page",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-spacex-ift4-tile-damage",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "Post-flight analysis revealed significant heat shield tile loss during reentry, suggesting the thermal protection system needs improvement before orbital missions.",
        sourceUrl:
          "https://arstechnica.com/space/2024/06/starship-flight-4/",
        sourceTitle: "Ars Technica: Starship Flight 4 analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "deepseek-v3-cost-5-5-million",
    title: "DeepSeek claimed it trained its DeepSeek-V3 model for only $5.5 million in compute costs",
    body:
      "Chinese AI lab DeepSeek released DeepSeek-V3, a 671-billion parameter mixture-of-experts model, claiming it required only $5.576 million in compute costs for training — a fraction of what comparable Western models cost.",
    domain: "ai",
    claimantName: "DeepSeek",
    subjectKind: "company",
    sourceUrl:
      "https://arxiv.org/abs/2412.19437",
    sourceTitle:
      "DeepSeek-V3 Technical Report (arXiv:2412.19437)",
    sourcePublisher: "arXiv / DeepSeek",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "The cost claim comes directly from DeepSeek's technical report published on arXiv, which details the training infrastructure and GPU-hour calculations.",
    veracityScore: 55,
    veracityLabel: "Disputed",
    veracityExplanation:
      "The $5.5M figure counts only the final training run's GPU-hours and excludes research, experimentation, data preparation, and prior model development costs. The true cost of developing V3 is likely much higher.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-deepseek-v3-paper",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "The technical report on arXiv provides a detailed breakdown: 2.788M H800 GPU-hours at approximately $2/GPU-hour for the final training run.",
        sourceUrl: "https://arxiv.org/abs/2412.19437",
        sourceTitle: "DeepSeek-V3 Technical Report",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-deepseek-v3-cost-critique",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "AI economists and industry analysts argue the $5.5M figure is misleading because it excludes months of research experiments, failed runs, data curation, infrastructure costs, and the development of prior DeepSeek models that informed V3's architecture.",
        sourceUrl:
          "https://www.semianalysis.com/p/deepseek-v3-the-cost-of-training",
        sourceTitle: "SemiAnalysis: The real cost of DeepSeek-V3",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-deepseek-v3-benchmark",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Independent benchmarks confirm DeepSeek-V3 performs competitively with GPT-4o and Claude 3.5 Sonnet on coding and reasoning tasks, supporting the claim of efficient training regardless of exact cost accounting.",
        sourceUrl:
          "https://huggingface.co/deepseek-ai/DeepSeek-V3",
        sourceTitle: "HuggingFace: DeepSeek-V3 model card",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "moderna-mrna-cancer-vaccine-2025",
    title: "Moderna's mRNA cancer vaccine showed a 44% reduction in melanoma recurrence in Phase 2b trial",
    body:
      "Moderna and Merck reported that their personalized mRNA cancer vaccine mRNA-4157/V940 (now called INTerCePT) combined with Keytruda showed a 44% reduction in risk of recurrence or death in patients with high-risk melanoma in an updated Phase 2b clinical trial.",
    domain: "technology",
    claimantName: "Moderna / Merck",
    subjectKind: "company",
    sourceUrl:
      "https://investors.modernatx.com/news/news-details/2024/moderna-mrna-cancer-vaccine-results",
    sourceTitle: "Moderna Investor Relations: mRNA Cancer Vaccine Results",
    sourcePublisher: "Moderna",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Moderna and Merck jointly announced the results through official press releases and investor communications.",
    veracityScore: 70,
    veracityLabel: "Mostly supported",
    veracityExplanation:
      "The Phase 2b results show a statistically significant benefit. However, Phase 3 trials are still ongoing and needed to confirm the effect at scale. The 44% reduction is promising but preliminary.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-moderna-melanoma-press",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Moderna's press release confirms the Phase 2b results showing statistically significant improvement in recurrence-free survival.",
        sourceUrl:
          "https://investors.modernatx.com/news/news-details/2024/moderna-mrna-cancer-vaccine-results",
        sourceTitle: "Moderna: Cancer vaccine clinical results",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-moderna-melanoma-phase3-pending",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "The Phase 3 KEYNOTE-942 trial is still enrolling and results are not expected until 2026-2027. Regulatory approval requires Phase 3 confirmation.",
        sourceUrl:
          "https://clinicaltrials.gov/study/NCT06077760",
        sourceTitle: "ClinicalTrials.gov: KEYNOTE-942 Phase 3",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "salt-typhoon-telecom-breach-2024",
    title: "Chinese hackers known as Salt Typhoon breached at least 9 major US telecom companies in 2024",
    body:
      "A Chinese state-sponsored hacking group dubbed Salt Typhoon infiltrated the networks of at least 9 major US telecommunications companies, including AT&T, Verizon, and T-Mobile, potentially accessing call records and communications of millions of Americans.",
    domain: "technology",
    claimantName: "US Government / FBI / CISA",
    subjectKind: "government",
    sourceUrl:
      "https://www.cisa.gov/news-events/news/joint-statement-fbi-and-cisa-peoples-republic-china-prc-targeting-commercial-telecommunications",
    sourceTitle: "CISA/FBI Joint Statement on PRC Telecom Targeting",
    sourcePublisher: "CISA",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "The FBI and CISA issued a joint statement confirming the campaign. Multiple affected companies have also acknowledged the breaches.",
    veracityScore: 80,
    veracityLabel: "Strongly supported",
    veracityExplanation:
      "Multiple government agencies and affected companies confirm the breaches. The exact scope and data accessed remains partially classified.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-salt-typhoon-cisa",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "CISA and FBI jointly confirmed the PRC-affiliated cyber campaign targeting US commercial telecommunications infrastructure.",
        sourceUrl:
          "https://www.cisa.gov/news-events/news/joint-statement-fbi-and-cisa-peoples-republic-china-prc-targeting-commercial-telecommunications",
        sourceTitle: "CISA/FBI Joint Statement",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-salt-typhoon-china-denies",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "China's government has denied involvement, calling the allegations a 'political fabrication' aimed at justifying increased US cyber spending.",
        sourceUrl:
          "https://www.reuters.com/technology/cybersecurity/china-denies-salt-typhoon-hack/",
        sourceTitle: "Reuters: China denies Salt Typhoon involvement",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-nonprofit-restructure-2025",
    title: "OpenAI announced plans to restructure from a nonprofit to a for-profit public benefit corporation",
    body:
      "OpenAI announced it would convert its unusual capped-profit structure into a Delaware public benefit corporation (PBC), with the original nonprofit retaining a minority stake. The move was part of a broader restructuring tied to raising additional capital.",
    domain: "ai",
    claimantName: "OpenAI / Sam Altman",
    subjectKind: "company",
    sourceUrl:
      "https://openai.com/index/evolving-our-structure/",
    sourceTitle: "OpenAI: Evolving Our Structure",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "OpenAI published the restructuring plans on their official blog. Sam Altman discussed the changes publicly.",
    veracityScore: 75,
    veracityLabel: "Mostly supported",
    veracityExplanation:
      "The restructuring announcement is confirmed. However, the plan faces legal challenges and regulatory scrutiny, and the final structure may differ from what was announced.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-openai-structure-blog",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "OpenAI's official blog post details the planned transition to a public benefit corporation structure.",
        sourceUrl: "https://openai.com/index/evolving-our-structure/",
        sourceTitle: "OpenAI: Evolving Our Structure",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-openai-structure-ag-lawsuit",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "California's Attorney General and Elon Musk have filed legal challenges to the restructuring, arguing it violates the nonprofit's original charitable mission and donor intent.",
        sourceUrl:
          "https://www.nytimes.com/2025/01/openai-nonprofit-lawsuit",
        sourceTitle: "NYT: OpenAI faces legal challenges to restructuring",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "neuralink-first-human-implant-2024",
    title: "Neuralink implanted its first brain-computer interface in a human patient in January 2024",
    body:
      "Neuralink announced that it successfully implanted its N1 brain-computer interface chip in a human patient for the first time on January 28, 2024, as part of its PRIME Study. Elon Musk reported the patient was recovering well and initial results showed neuron spike detection.",
    domain: "technology",
    claimantName: "Neuralink / Elon Musk",
    subjectKind: "company",
    sourceUrl:
      "https://twitter.com/elonmusk/status/1752098683024220632",
    sourceTitle: "Elon Musk announcement of first Neuralink human implant",
    sourcePublisher: "X (Twitter)",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Elon Musk announced the implant on X. Neuralink later published follow-up details and the patient (Noland Arbaugh) went public with his experience.",
    veracityScore: 85,
    veracityLabel: "Strongly supported",
    veracityExplanation:
      "The implant is confirmed by multiple sources including the patient himself. Post-implant thread retraction issues were later acknowledged and addressed by Neuralink.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-neuralink-patient-public",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Patient Noland Arbaugh publicly demonstrated using the Neuralink implant to control a cursor and play chess on a computer, confirming the device's basic functionality.",
        sourceUrl:
          "https://neuralink.com/blog/prime-study-progress-update/",
        sourceTitle: "Neuralink: PRIME Study progress update",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-neuralink-thread-retraction",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "Neuralink disclosed that some electrode threads retracted from the brain tissue after implantation, reducing the number of effective channels, though workarounds maintained device functionality.",
        sourceUrl:
          "https://www.wsj.com/tech/biotech/neuralink-brain-implant-threads-problem/",
        sourceTitle: "WSJ: Neuralink thread retraction issue",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "us-chips-act-tsmc-arizona-delay",
    title: "TSMC's Arizona chip factory faced significant delays and cost overruns despite $6.6B in CHIPS Act funding",
    body:
      "Despite receiving $6.6 billion in CHIPS Act subsidies, TSMC's Arizona fabrication facility experienced construction delays and cost increases, with the most advanced chip production pushed back from the original 2024 target.",
    domain: "technology",
    claimantName: "Multiple sources / TSMC",
    subjectKind: "company",
    sourceUrl:
      "https://www.reuters.com/technology/tsmc-arizona-chip-plant-delays-2024/",
    sourceTitle: "Reuters: TSMC Arizona chip plant construction update",
    sourcePublisher: "Reuters",
    sourceQuality: "reputable secondary",
    attributionScore: 75,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "The delays are reported by multiple credible outlets. TSMC has acknowledged adjusted timelines in earnings calls, though they characterize them as minor schedule modifications.",
    veracityScore: 75,
    veracityLabel: "Mostly supported",
    veracityExplanation:
      "Construction delays are independently verified. The $6.6B CHIPS Act award is confirmed by the Commerce Department. TSMC disputes the characterization of 'significant' delays.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-chips-act-award",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "The US Department of Commerce confirmed a preliminary agreement for up to $6.6 billion in CHIPS Act funding for TSMC's Arizona operations.",
        sourceUrl:
          "https://www.commerce.gov/news/press-releases/2024/04/biden-harris-administration-announces-chips-act-tsmc",
        sourceTitle: "Commerce Dept: TSMC CHIPS Act announcement",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-tsmc-arizona-progress",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "TSMC CEO C.C. Wei stated in a 2024 earnings call that the Arizona fab is progressing and that first production from Fab 21 is on track, pushing back on media narratives of major delays.",
        sourceUrl:
          "https://investor.tsmc.com/english/quarterly-results",
        sourceTitle: "TSMC Investor Relations: Quarterly Results",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "sam-altman-worldcoin-iris-scanning",
    title: "Sam Altman's Worldcoin project scanned over 6 million irises globally by mid-2024",
    body:
      "Tools for Humanity, the company behind Worldcoin (now rebranded as World), reported that its iris-scanning Orb devices had verified over 6 million unique individuals globally by mid-2024, with operations in dozens of countries.",
    domain: "technology",
    claimantName: "Tools for Humanity / Sam Altman",
    subjectKind: "company",
    sourceUrl:
      "https://world.org/blog",
    sourceTitle: "World (Worldcoin) official blog",
    sourcePublisher: "Tools for Humanity",
    sourceQuality: "primary",
    attributionScore: 85,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Tools for Humanity publishes regular updates on verification counts. Sam Altman is a co-founder and has discussed the project publicly.",
    veracityScore: 55,
    veracityLabel: "Partially supported",
    veracityExplanation:
      "The company's self-reported numbers are unaudited. Several countries (Spain, Kenya, Portugal) have suspended or investigated Worldcoin operations over privacy concerns, raising questions about data practices.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-worldcoin-adoption",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Tools for Humanity's public dashboard and blog posts report growing user verification counts and expansion into new markets.",
        sourceUrl: "https://world.org/blog",
        sourceTitle: "World official blog and metrics",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-worldcoin-privacy-bans",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Kenya, Spain, Portugal, and other countries have suspended or investigated Worldcoin operations over biometric data privacy violations, undermining the project's global expansion claims.",
        sourceUrl:
          "https://www.bbc.com/news/technology-worldcoin-privacy",
        sourceTitle: "BBC: Worldcoin faces privacy challenges worldwide",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-responsible-scaling-policy",
    title: "Anthropic published the first Responsible Scaling Policy committing to capability evaluations before training more powerful AI",
    body:
      "Anthropic published its Responsible Scaling Policy (RSP) in September 2023, committing to evaluate AI systems for dangerous capabilities (CBRN, cybersecurity, autonomous replication) before training more powerful models, creating a tiered AI Safety Level (ASL) framework.",
    domain: "ai",
    claimantName: "Anthropic / Dario Amodei",
    subjectKind: "company",
    sourceUrl:
      "https://www.anthropic.com/news/anthropics-responsible-scaling-policy",
    sourceTitle: "Anthropic: Responsible Scaling Policy",
    sourcePublisher: "Anthropic",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Confirmed",
    attributionExplanation:
      "Anthropic's official publication clearly describes the RSP framework. Dario Amodei discussed it extensively in subsequent public communications.",
    veracityScore: 65,
    veracityLabel: "Partially supported",
    veracityExplanation:
      "The policy is published and real. However, critics argue the commitments are self-assessed and lack independent verification or enforcement mechanisms.",
    createdAt: "2026-05-26T01:40:00+04:00",
    submittedBy: "claimer-team",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-anthropic-rsp-official",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Anthropic's blog post details the full RSP framework, including the ASL-1 through ASL-4 classification system and the commitments to pre-deployment evaluations.",
        sourceUrl:
          "https://www.anthropic.com/news/anthropics-responsible-scaling-policy",
        sourceTitle: "Anthropic: RSP announcement",
        sourceQuality: "primary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-rsp-enforcement-critique",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "AI safety researchers note that RSPs are voluntary, self-assessed, and lack external enforcement — raising questions about whether they would constrain behavior when significant commercial interests are at stake.",
        sourceUrl:
          "https://www.alignmentforum.org/posts/responsible-scaling-policies",
        sourceTitle: "Alignment Forum: RSP analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "claimer-team",
        createdAt: "2026-05-26T01:40:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "pope-leo-xiv-ai-encyclical-disarm",
    title: "Pope Leo XIV called to 'disarm' artificial intelligence in a formal encyclical",
    body:
      "The papal encyclical 'Magnifica Humanitas' explicitly calls for AI to be freed from logics of economic and military dominance, and warns against transhumanist visions.",
    domain: "technology",
    claimantName: "Pope Leo XIV",
    subjectKind: "individual",
    sourceUrl: "https://www.ncronline.org/vatican/vatican-news/pope-leo-xiv-releases-ai-encyclical-magnifica-humanitas",
    sourceTitle: "Pope Leo XIV releases AI encyclical 'Magnifica Humanitas'",
    sourcePublisher: "National Catholic Reporter",
    sourceQuality: "reputable secondary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Multiple credible news sources attribute the encyclical to Pope Leo XIV. The Vatican's own communications confirm the release.",
    veracityScore: 58,
    veracityLabel: "Evidence suggests disputed",
    veracityExplanation:
      "The encyclical exists and makes these calls. However, whether 'disarming' AI is practical, desirable, or even clearly defined is vigorously debated by technologists, ethicists, and policymakers.",
    createdAt: "2026-05-26T05:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-pope-encyclical-ncr",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "National Catholic Reporter confirms the release of the encyclical and its core message about disarming AI from military and economic dominance logics.",
        sourceUrl: "https://www.ncronline.org/vatican/vatican-news/pope-leo-xiv-releases-ai-encyclical-magnifica-humanitas",
        sourceTitle: "Pope Leo XIV releases AI encyclical",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:01:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-pope-encyclical-tech-response",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Tech industry leaders argue that 'disarming' AI would cede strategic advantage to nations that don't comply, and that the encyclical conflates narrow military AI with beneficial general-purpose AI research.",
        sourceUrl: "https://time.com/7295105/pope-ai-encyclical-reaction/",
        sourceTitle: "Tech leaders react to Pope's AI encyclical",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:02:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-models-getting-worse-may-2026",
    title: "Major AI models from OpenAI, Anthropic, and Google are becoming less capable while prices increase",
    body:
      "Users report that ChatGPT, Claude, and Gemini have become more restrictive, less creative, and more expensive compared to earlier versions, suggesting a pattern of silent capability degradation.",
    domain: "ai",
    claimantName: "User community",
    subjectKind: "community",
    sourceUrl: "https://www.rollingout.com/2026/05/ai-getting-worse-user-complaints/",
    sourceTitle: "AI getting worse: wave of user complaints in May 2026",
    sourcePublisher: "Rolling Out",
    sourceQuality: "reputable secondary",
    attributionScore: 68,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "The claim aggregates user sentiment from multiple platforms. No single authoritative source makes this claim — it emerges from distributed user reports.",
    veracityScore: 45,
    veracityLabel: "Evidence inconclusive",
    veracityExplanation:
      "User perception of degradation is real and widespread, but AI companies dispute it, citing benchmark improvements. The gap may reflect changes in safety filtering, not raw capability loss.",
    createdAt: "2026-05-26T05:03:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-ai-worse-user-reports",
        stance: "support",
        summary:
          "A wave of user complaints across Reddit, X, and tech forums report that ChatGPT, Claude, and Gemini produce more refusals, shorter responses, and less creative output than 6 months ago.",
        sourceUrl: "https://www.rollingout.com/2026/05/ai-getting-worse-user-complaints/",
        sourceTitle: "AI getting worse: user complaints",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:04:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-ai-worse-benchmarks-counter",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "OpenAI and Anthropic point to benchmark score improvements across successive model releases. They argue that increased safety filtering is not the same as capability degradation, and that user perception is influenced by rising expectations.",
        sourceUrl: "https://openai.com/index/introducing-gpt-5-4/",
        sourceTitle: "OpenAI GPT-5.4 benchmark results",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:05:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "us-federal-preemption-state-ai-laws",
    title: "The US federal government should preempt state-level AI regulation to prevent a patchwork of conflicting laws",
    body:
      "Tech companies argue that differing state AI laws in California, Colorado, and Illinois create compliance chaos that hampers innovation. Critics say federal preemption would eliminate the strongest consumer protections.",
    domain: "technology",
    claimantName: "Tech industry coalition",
    subjectKind: "organization",
    sourceUrl: "https://www.broadbandbreakfast.com/ai-regulation-federal-preemption-state-laws-2026/",
    sourceTitle: "Federal preemption debate over state AI laws heats up",
    sourcePublisher: "Broadband Breakfast",
    sourceQuality: "reputable secondary",
    attributionScore: 78,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "The preemption push is documented across legislative records and trade group statements, though specific legislative proposals are still evolving.",
    veracityScore: 50,
    veracityLabel: "Evidence suggests disputed",
    veracityExplanation:
      "This is fundamentally a policy debate. Supporters cite innovation efficiency; opponents cite that California's laws set important precedents. No consensus exists among legal scholars or policymakers.",
    createdAt: "2026-05-26T05:06:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-federal-preemption-industry",
        stance: "support",
        summary:
          "Major tech trade groups including TechNet and NetChoice argue that 50 different state AI regulatory frameworks would create impossible compliance burdens and slow US AI competitiveness.",
        sourceUrl: "https://www.broadbandbreakfast.com/ai-regulation-federal-preemption-state-laws-2026/",
        sourceTitle: "Tech groups push for federal AI preemption",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:07:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-federal-preemption-critics",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Consumer advocacy groups and state attorneys general argue that federal preemption would eliminate the most protective AI laws, noting that historically state regulations (like California's CCPA) have set important national benchmarks that weak federal laws would undermine.",
        sourceUrl: "https://www.techjusticelaw.org/ai-federal-preemption-risks/",
        sourceTitle: "Risks of federal AI preemption",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:08:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-academic-integrity-crisis-2026",
    title: "Roughly 9% of university students submit AI-generated work as their own, but the real number may be much higher",
    body:
      "A May 2026 study estimates that 9% of students knowingly submit prohibited AI-generated work, with the rate significantly higher among daily AI users. Universities are struggling to detect and enforce policies.",
    domain: "technology",
    claimantName: "Research community",
    subjectKind: "community",
    sourceUrl: "https://www.forbes.com/sites/education/2026/05/ai-academic-integrity-study/",
    sourceTitle: "AI academic integrity: 9% of students submit AI work",
    sourcePublisher: "Forbes",
    sourceQuality: "reputable secondary",
    attributionScore: 82,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The 9% figure comes from peer-reviewed research published in a recognized journal. Attribution to the research team is clear.",
    veracityScore: 62,
    veracityLabel: "Evidence suggests disputed",
    veracityExplanation:
      "The 9% figure is from self-reported surveys which tend to undercount. Multiple educators argue the real rate is 30-50%. AI detection tools have high false positive rates, making verification difficult.",
    createdAt: "2026-05-26T05:09:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-ai-academic-study",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Published research using survey methodology across multiple universities estimates a 9% rate of prohibited AI submission, with the rate approximately 3x higher among students who use AI tools daily.",
        sourceUrl: "https://www.forbes.com/sites/education/2026/05/ai-academic-integrity-study/",
        sourceTitle: "AI academic integrity study",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:10:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-ai-academic-undercount",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Educators and AI detection tool developers argue the 9% figure dramatically undercounts because it relies on self-reporting. Turnitin data suggests AI-assisted content appears in 30-40% of submissions, though not all of this represents intentional academic dishonesty.",
        sourceUrl: "https://www.turnitin.com/blog/ai-writing-detection-data-2026",
        sourceTitle: "Turnitin AI detection data 2026",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:11:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-worker-displacement-structural-force",
    title: "Central banks are treating AI as a structural economic force comparable to the industrial revolution that will displace millions of workers",
    body:
      "Multiple central banks and economic bodies have begun modeling AI as a once-in-a-century structural shift, comparable to electrification, that requires fundamental changes to monetary policy and workforce planning.",
    domain: "technology",
    claimantName: "Central banking community",
    subjectKind: "organization",
    sourceUrl: "https://www.pbs.org/newshour/economy/central-banks-ai-structural-force",
    sourceTitle: "Central banks model AI as structural economic force",
    sourcePublisher: "PBS",
    sourceQuality: "reputable secondary",
    attributionScore: 85,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Published speeches and working papers from the Fed, ECB, and Bank of England are directly cited. Attribution is clear and verifiable.",
    veracityScore: 55,
    veracityLabel: "Evidence suggests disputed",
    veracityExplanation:
      "Central banks are indeed modeling AI displacement scenarios, but economists are sharply divided on whether AI will cause net job losses or net job creation. Historical analogies to the industrial revolution are contested.",
    createdAt: "2026-05-26T05:12:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ev-central-banks-ai-modeling",
        stance: "support",
        summary:
          "PBS reports that the Federal Reserve, European Central Bank, and Bank of England have published working papers modeling AI as a structural force requiring revised monetary policy frameworks, similar to how they modeled globalization.",
        sourceUrl: "https://www.pbs.org/newshour/economy/central-banks-ai-structural-force",
        sourceTitle: "Central banks model AI as structural force",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:13:00+04:00",
        aiAssisted: true
      },
      {
        id: "ev-ai-displacement-skeptics",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Economists like David Autor argue that historically, technology has created more jobs than it destroys, and that AI is more likely to augment human work than replace it. Previous 'automation apocalypse' predictions have consistently overestimated displacement timelines.",
        sourceUrl: "https://economics.mit.edu/people/faculty/david-autor",
        sourceTitle: "David Autor: AI and labor markets",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T05:14:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-erdos-conjecture-disproof",
    title: "OpenAI claims its AI model autonomously disproved the 80-year-old Erdős unit distance conjecture",
    body:
      "OpenAI announced that one of its reasoning models independently produced a proof disproving the Erdős unit distance conjecture, a long-standing open problem in combinatorial geometry. The proof reportedly involves complex algebraic number theory.",
    domain: "ai",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/",
    sourceTitle: "OpenAI – AI reasoning breakthrough announcement",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "OpenAI is the direct source of this claim about its own model's capabilities.",
    veracityScore: 55,
    veracityLabel: "Under review",
    veracityExplanation:
      "The mathematical proof requires independent peer review. Mathematicians have acknowledged the result but formal verification is ongoing.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "erdos-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Multiple mathematicians have reviewed the proof and acknowledged it as a significant milestone, though formal peer review is still in progress.",
        sourceUrl: "https://openai.com/",
        sourceTitle: "OpenAI reasoning breakthrough",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "meta-tribe-v2-brain-model",
    title: "Meta AI released TRIBE v2, a predictive foundation model that acts as a 'digital twin' of human neural activity",
    body:
      "Meta AI's TRIBE v2 model can reportedly predict brain responses to various stimuli with significantly higher resolution than previous models, offering potential applications in neuroscience research and biologically inspired AI design.",
    domain: "ai",
    claimantName: "Meta AI",
    subjectKind: "company",
    sourceUrl: "https://ai.meta.com/",
    sourceTitle: "Meta AI – TRIBE v2 announcement",
    sourcePublisher: "Meta",
    sourceQuality: "primary",
    attributionScore: 85,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Meta AI is the developer and direct announcer of the TRIBE v2 model.",
    veracityScore: 60,
    veracityLabel: "Mixed evidence",
    veracityExplanation:
      "The predictive accuracy claims need independent validation against established neuroscience benchmarks.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "tribe-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Meta published technical details showing improved resolution in neural activity prediction compared to TRIBE v1 and competing models.",
        sourceUrl: "https://ai.meta.com/",
        sourceTitle: "Meta AI research blog",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-gemini-3-5-flash-launch",
    title: "Google launched Gemini 3.5 Flash and integrated it across its product ecosystem at I/O 2026",
    body:
      "Google announced Gemini 3.5 Flash as its latest efficient AI model, integrating it across Search, Workspace, Android, and other products during Google I/O 2026.",
    domain: "ai",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl: "https://blog.google/technology/ai/",
    sourceTitle: "Google AI Blog – Gemini 3.5 Flash",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Google is the direct creator and announcer of the Gemini 3.5 Flash model.",
    veracityScore: 85,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "Model launch is confirmed through official Google channels. Performance claims require independent benchmarking.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "gemini-flash-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Google I/O 2026 keynote livestream demonstrated Gemini 3.5 Flash integration across multiple Google products.",
        sourceUrl: "https://io.google/2026/",
        sourceTitle: "Google I/O 2026",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-ai-mode-1b-users",
    title: "Google AI Mode in Search has surpassed 1 billion monthly active users",
    body:
      "Google disclosed that AI Mode in Search, its conversational AI-powered search experience, now serves over 1 billion monthly active users, representing a fundamental shift in how people interact with search.",
    domain: "technology",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl: "https://blog.google/products/search/",
    sourceTitle: "Google Search – AI Mode milestone",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Google directly reported its own usage metrics for AI Mode.",
    veracityScore: 70,
    veracityLabel: "Plausible but unverified",
    veracityExplanation:
      "Self-reported usage numbers from a major corporation. Independent verification of the 1B MAU figure is not available.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ai-mode-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Google's CEO mentioned the 1 billion figure during the I/O 2026 keynote presentation.",
        sourceUrl: "https://io.google/2026/",
        sourceTitle: "Google I/O 2026 keynote",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "ai-mode-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Analysts note that Google's definition of 'AI Mode users' may include passive exposure rather than deliberate opt-in usage, which could inflate the reported number.",
        sourceUrl: "https://www.theverge.com/",
        sourceTitle: "The Verge – Google I/O analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "google-gemini-spark-agent",
    title: "Google introduced Gemini Spark, a 24/7 personal AI agent with third-party app integrations",
    body:
      "Google announced Gemini Spark at I/O 2026, positioning it as a persistent personal AI agent that can autonomously manage tasks across third-party services including Canva and OpenTable via MCP (Model Context Protocol) support.",
    domain: "ai",
    claimantName: "Google",
    subjectKind: "company",
    sourceUrl: "https://blog.google/technology/ai/",
    sourceTitle: "Google AI – Gemini Spark announcement",
    sourcePublisher: "Google",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Google directly announced this product feature at their official developer conference.",
    veracityScore: 65,
    veracityLabel: "Mixed evidence",
    veracityExplanation:
      "Product was announced and demonstrated but real-world autonomy, reliability, and scope of third-party integrations remain to be independently verified.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "spark-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Live demos at Google I/O showed Gemini Spark booking restaurant reservations and editing designs through MCP-connected third-party apps.",
        sourceUrl: "https://io.google/2026/",
        sourceTitle: "Google I/O 2026 demo",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "microsoft-agentic-ai-timeline",
    title: "Microsoft's AI chief predicted human-level performance on professional computer tasks within 12–18 months",
    body:
      "A senior Microsoft AI executive stated that agentic AI systems could achieve human-level performance on many professional computer-based tasks within 12 to 18 months, positioning the company's push toward autonomous software-operating agents.",
    domain: "ai",
    claimantName: "Microsoft",
    subjectKind: "company",
    sourceUrl: "https://www.microsoft.com/en-us/ai",
    sourceTitle: "Microsoft AI leadership statements",
    sourcePublisher: "Microsoft",
    sourceQuality: "primary",
    attributionScore: 82,
    attributionLabel: "Attributed to executive",
    attributionExplanation:
      "The claim is attributed to a named Microsoft executive in public statements.",
    veracityScore: 40,
    veracityLabel: "Speculative",
    veracityExplanation:
      "Forward-looking prediction from an interested party. Historical AI capability timeline predictions have frequently overestimated the pace of progress.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "msft-agentic-evidence-1",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Independent AI researchers note that similar 'AGI timelines' have been repeatedly pushed back, and current agentic systems still struggle with multi-step tasks requiring common sense.",
        sourceUrl: "https://arxiv.org/",
        sourceTitle: "AI capability forecasting meta-analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "msft-agentic-evidence-2",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Recent benchmarks show agentic AI systems achieving significantly higher task completion rates on software engineering tasks compared to 12 months ago.",
        sourceUrl: "https://www.swebench.com/",
        sourceTitle: "SWE-bench leaderboard",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-spacex-compute-deal",
    title: "Anthropic secured access to SpaceX's Colossus 1 data center with over 220,000 Nvidia GPUs",
    body:
      "A reported compute partnership between Anthropic and SpaceX provides Anthropic access to the Colossus 1 data center infrastructure featuring over 220,000 Nvidia GPUs, representing one of the largest AI compute deals in the industry.",
    domain: "technology",
    claimantName: "Industry reports",
    subjectKind: "company",
    sourceUrl: "https://www.reuters.com/technology/",
    sourceTitle: "Reuters – Anthropic compute partnership",
    sourcePublisher: "Reuters",
    sourceQuality: "reputable secondary",
    attributionScore: 70,
    attributionLabel: "Attributed to industry reports",
    attributionExplanation:
      "The partnership details come from industry reporting; neither Anthropic nor SpaceX has fully confirmed all specifics.",
    veracityScore: 62,
    veracityLabel: "Plausible",
    veracityExplanation:
      "Multiple credible outlets reported the deal, but exact GPU counts and terms have not been officially confirmed by either party.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "anthropic-compute-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Multiple major tech outlets including Reuters and Bloomberg reported on the deal with consistent details about scale and GPU counts.",
        sourceUrl: "https://www.reuters.com/technology/",
        sourceTitle: "Reuters tech reporting",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-chatgpt-ads-platform",
    title: "OpenAI launched a self-serve advertising platform within ChatGPT",
    body:
      "OpenAI introduced a self-serve advertising platform allowing businesses to place ads within ChatGPT conversations, marking a significant commercialization milestone and a potential shift in the company's revenue model.",
    domain: "technology",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/",
    sourceTitle: "OpenAI – ChatGPT ads announcement",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 88,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "OpenAI is the direct announcer and operator of this advertising platform.",
    veracityScore: 78,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The ad platform launch has been confirmed by multiple sources. Advertiser adoption and revenue impact remain to be measured.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "chatgpt-ads-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "OpenAI's official blog confirmed the launch of the self-serve ad platform with details about targeting and pricing.",
        sourceUrl: "https://openai.com/",
        sourceTitle: "OpenAI blog",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "chatgpt-ads-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Privacy advocates and some users have raised concerns about advertising within AI conversations, questioning whether ad placement could subtly influence AI responses.",
        sourceUrl: "https://www.eff.org/",
        sourceTitle: "EFF – AI advertising concerns",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "penn-photonic-chip-breakthrough",
    title: "University of Pennsylvania developed hybrid light-matter particles for photonic AI chips",
    body:
      "Researchers at the University of Pennsylvania announced a breakthrough in hybrid light-matter particle technology that could enable photonic chips processing information using light instead of electricity, potentially offering dramatic energy efficiency improvements for AI workloads.",
    domain: "technology",
    claimantName: "University of Pennsylvania",
    subjectKind: "institution",
    sourceUrl: "https://penntoday.upenn.edu/",
    sourceTitle: "Penn Today – Photonic chip research",
    sourcePublisher: "University of Pennsylvania",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The research team at UPenn is the direct source of the technological claims.",
    veracityScore: 58,
    veracityLabel: "Promising but early",
    veracityExplanation:
      "Lab-stage research with peer-reviewed results. Commercial viability and scalability for AI workloads are unproven.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "photonic-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "The research was published in a peer-reviewed journal with experimental results demonstrating the hybrid particle behavior.",
        sourceUrl: "https://penntoday.upenn.edu/",
        sourceTitle: "UPenn research publication",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "meta-employee-tracking-ai-training",
    title: "Reports indicate Meta tracked internal employee activity through its 'Model Capability Initiative' to train AI models",
    body:
      "Multiple reports surfaced alleging that Meta's 'Model Capability Initiative' monitored and collected data on internal employee workflows and activities to train AI models, coinciding with significant layoffs across the company.",
    domain: "technology",
    claimantName: "Industry journalists",
    subjectKind: "company",
    sourceUrl: "https://www.theverge.com/",
    sourceTitle: "The Verge – Meta employee tracking reports",
    sourcePublisher: "The Verge",
    sourceQuality: "reputable secondary",
    attributionScore: 68,
    attributionLabel: "Attributed to anonymous sources",
    attributionExplanation:
      "Reports rely on anonymous internal sources and leaked documents. Meta has not fully confirmed or denied the specifics.",
    veracityScore: 52,
    veracityLabel: "Disputed",
    veracityExplanation:
      "Multiple credible outlets reported similar details from different sources, but without official confirmation the specifics remain contested.",
    createdAt: "2026-05-26T06:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "meta-tracking-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Several current and former Meta employees corroborated the existence of internal monitoring programs through anonymous interviews with major tech publications.",
        sourceUrl: "https://www.theverge.com/",
        sourceTitle: "The Verge investigation",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "meta-tracking-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Meta's official response characterized employee monitoring as standard productivity tooling used across the tech industry, denying that it was specifically designed for AI training data collection.",
        sourceUrl: "https://about.meta.com/",
        sourceTitle: "Meta corporate statement",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T06:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-900b-valuation-may-2026",
    title: "Anthropic's valuation could surpass $900 billion, making it the world's most valuable private startup",
    body:
      "Multiple reports indicate Anthropic is closing a funding round exceeding $30 billion at a pre-money valuation above $900 billion, which would surpass OpenAI's $852 billion valuation. The round is co-led by Sequoia Capital, Dragoneer, Altimeter Capital, and Greenoaks. This follows a February 2026 Series G that also raised $30B at a $380B valuation — meaning the valuation has more than doubled in approximately three months.",
    domain: "ai",
    claimantName: "Multiple financial reports",
    subjectKind: "company",
    sourceUrl: "https://seekingalpha.com/",
    sourceTitle: "Anthropic Valuation Analysis",
    sourcePublisher: "Seeking Alpha",
    sourceQuality: "reputable secondary",
    attributionScore: 78,
    attributionLabel: "Well-attributed from multiple outlets",
    attributionExplanation:
      "The valuation figure is reported by multiple financial outlets including Seeking Alpha, TechTimes, and Forbes, though Anthropic has not officially confirmed the exact number.",
    veracityScore: 55,
    veracityLabel: "Partially supported — round reportedly still being finalized",
    veracityExplanation:
      "The revenue figures are self-reported during fundraising discussions, creating an inherent incentive for optimistic projections. A valuation of $900B for ~$50B ARR implies an ~18x revenue multiple, which some analysts consider stretched.",
    createdAt: "2026-05-26T07:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "anthropic-900b-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Anthropic's annualized revenue run rate is reportedly on track to surpass $50 billion by end of June 2026, up from ~$9B at end of 2025. The company projects its first-ever operating profit of $559M in Q2 2026.",
        sourceUrl: "https://www.forbes.com/",
        sourceTitle: "Forbes reporting on Anthropic financials",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "anthropic-900b-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "These revenue and valuation figures are unaudited and self-reported during fundraising discussions, creating an inherent incentive to present optimistic projections. A valuation of $900B implies a ~18x revenue multiple, which some analysts consider stretched even for AI.",
        sourceUrl: "https://seekingalpha.com/",
        sourceTitle: "Seeking Alpha analyst commentary",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "trump-ai-safety-eo-cancelled-may-2026",
    title: "Trump cancelled an AI safety executive order after last-minute lobbying by Musk, Zuckerberg, and Sacks",
    body:
      "Hours before a scheduled White House signing ceremony on May 21, 2026, President Trump cancelled a planned executive order that would have established a voluntary 90-day pre-launch review of frontier AI models for national security risks. The decision reportedly followed last-minute phone calls from Elon Musk, Mark Zuckerberg, and former AI advisor David Sacks, who argued it would slow U.S. competitiveness against China.",
    domain: "technology",
    claimantName: "Washington Post / LA Times",
    subjectKind: "government",
    sourceUrl: "https://www.washingtonpost.com/",
    sourceTitle: "Trump cancels AI safety executive order",
    sourcePublisher: "Washington Post",
    sourceQuality: "reputable secondary",
    attributionScore: 82,
    attributionLabel: "Well-attributed by multiple major outlets",
    attributionExplanation:
      "The cancellation is confirmed by Washington Post, LA Times, NPR, and The Guardian. Trump himself stated he 'didn't like certain aspects' of the order.",
    veracityScore: 62,
    veracityLabel: "Disputed — cancellation confirmed but influence extent debated",
    veracityExplanation:
      "The cancellation is confirmed, but the extent of tech billionaire influence is debated. Musk claims he spoke with Trump only after the president had already decided to cancel.",
    createdAt: "2026-05-26T07:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "trump-ai-eo-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Multiple outlets (Washington Post, The Guardian, LA Times, NPR) confirmed the lobbying calls and Trump's statement that he 'didn't like certain aspects' of the order. AI safety advocates labeled it a win for the 'accelerationist' camp.",
        sourceUrl: "https://www.npr.org/",
        sourceTitle: "NPR reporting on AI executive order cancellation",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "trump-ai-eo-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Elon Musk posted on X claiming he spoke with Trump only after the president had already decided to cancel, disputing that he influenced the decision. The order was described as 'postponed' not 'canceled,' leaving open the possibility of a revised version.",
        sourceUrl: "https://www.theguardian.com/",
        sourceTitle: "Guardian reporting on Musk response",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-gpt55-hallucination-reduction-may-2026",
    title: "OpenAI claims GPT-5.5 Instant reduces hallucinations by 52.5% on high-stakes prompts",
    body:
      "OpenAI released GPT-5.5 Instant as the new default ChatGPT model, claiming internal benchmarks show it produces 52.5% fewer hallucinated claims than its predecessor GPT-5.3 Instant on high-stakes prompts in medicine, law, and finance. It also claims a 37.3% reduction in inaccurate claims on user-flagged factual error conversations.",
    domain: "ai",
    claimantName: "OpenAI",
    subjectKind: "company",
    sourceUrl: "https://openai.com/",
    sourceTitle: "GPT-5.5 Instant announcement",
    sourcePublisher: "OpenAI",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution — official company claim",
    attributionExplanation:
      "The claim comes directly from OpenAI's official blog post and is well-attributed as a company assertion.",
    veracityScore: 45,
    veracityLabel: "Unverified — based on internal benchmarks only",
    veracityExplanation:
      "The 52.5% hallucination reduction figure is based on OpenAI's own internal evaluation set, not independent third-party testing. Previous hallucination reduction claims by AI companies have often not held up under broader real-world testing.",
    createdAt: "2026-05-26T07:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "gpt55-hallucination-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "OpenAI published detailed evaluation methodology on their blog. The model also showed improvements on mathematical benchmarks (AIME 2025 scores). Duke University researchers noted the improvements in a review.",
        sourceUrl: "https://openai.com/",
        sourceTitle: "OpenAI GPT-5.5 evaluation methodology",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "gpt55-hallucination-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Hallucination reduction benchmarks are notoriously sensitive to prompt selection and evaluation methodology. The 52.5% figure is based on OpenAI's own internal evaluation set, not independent third-party testing. Previous hallucination claims by AI companies have often not held up under broader real-world testing.",
        sourceUrl: "https://mashable.com/",
        sourceTitle: "Mashable analysis of AI hallucination claims",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "pope-leo-xiv-ai-encyclical-may-2026",
    title: "Pope Leo XIV issued a major encyclical warning against AI dehumanization, with Anthropic's co-founder present",
    body:
      "Pope Leo XIV presented his first encyclical 'Magnifica Humanitas' at the Vatican on May 25, 2026, calling for robust AI regulation and warning against autonomous weapons, AI mimicking human relationships, and the concentration of power among tech companies. Anthropic co-founder Christopher Olah was invited to co-present.",
    domain: "technology",
    claimantName: "Pope Leo XIV / Vatican",
    subjectKind: "institution",
    sourceUrl: "https://time.com/",
    sourceTitle: "Time Magazine coverage of papal AI encyclical",
    sourcePublisher: "Time Magazine",
    sourceQuality: "reputable secondary",
    attributionScore: 94,
    attributionLabel: "Strong attribution — official Vatican event",
    attributionExplanation:
      "The encyclical was signed May 15, 2026 and presented May 25. Extensively covered by Vatican, PBS, Washington Post, Time, Forbes, and Wikipedia.",
    veracityScore: 85,
    veracityLabel: "Evidence suggests supported — well-documented public event",
    veracityExplanation:
      "The event and encyclical are thoroughly documented through official Vatican channels and major media. The factual occurrence is well-established; debate centers on impact and sincerity.",
    createdAt: "2026-05-26T07:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "pope-ai-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "The encyclical was signed May 15, 2026, timed to the 135th anniversary of Leo XIII's 'Rerum Novarum.' Olah's full remarks were published directly on anthropic.com.",
        sourceUrl: "https://anthropic.com/",
        sourceTitle: "Christopher Olah's Vatican remarks",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "pope-ai-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Critics note the Vatican's moral authority on technology is aspirational rather than enforceable. Tech industry reaction has been muted, with some viewing Olah's participation as a PR move rather than a genuine commitment to external oversight.",
        sourceUrl: "https://www.forbes.com/",
        sourceTitle: "Forbes analysis of Vatican AI event",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-olah-labor-displacement-warning-may-2026",
    title: "Anthropic co-founder warns AI could displace human labor on a 'very large scale' — while pursuing $900B valuation",
    body:
      "At the Vatican presentation on May 25, 2026, Anthropic co-founder Christopher Olah stated there is a 'real possibility' AI could displace human labor on a 'very large scale' and that supporting displaced workers would be a 'moral imperative of historic proportions.' He also argued AI development should not be left solely to tech companies. This comes as Anthropic simultaneously pursues a $900B valuation.",
    domain: "ai",
    claimantName: "Christopher Olah (Anthropic co-founder)",
    subjectKind: "person",
    sourceUrl: "https://anthropic.com/",
    sourceTitle: "Christopher Olah's Vatican remarks on AI and labor",
    sourcePublisher: "Anthropic",
    sourceQuality: "primary",
    attributionScore: 95,
    attributionLabel: "Strong attribution — direct from source",
    attributionExplanation:
      "Olah's full remarks were published on anthropic.com and covered by Forbes, Washington Post, and NCR Online. The statements are well-documented.",
    veracityScore: 50,
    veracityLabel: "Debatable — statements are factual but sincerity questioned",
    veracityExplanation:
      "The statements were made as reported, but the juxtaposition with Anthropic's simultaneous pursuit of a $900B valuation and aggressive scaling raises questions about sincerity. Critics view it as PR positioning.",
    createdAt: "2026-05-26T07:00:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "olah-labor-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Olah's full remarks were published on anthropic.com and covered by Forbes, Washington Post, and NCR Online. His call for external oversight was noted as unusually candid for a tech executive.",
        sourceUrl: "https://anthropic.com/",
        sourceTitle: "Anthropic official publication of Olah's Vatican remarks",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      },
      {
        id: "olah-labor-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Critics point out the tension between warning about AI's dangers while aggressively scaling the company building that AI. Anthropic is simultaneously raising at a $900B valuation and projecting $50B+ ARR, suggesting the company is racing to be dominant in the very market Olah warns about.",
        sourceUrl: "https://www.forbes.com/",
        sourceTitle: "Forbes analysis of Anthropic's dual messaging",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T07:00:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "chinese-academy-aeye-1-ai-microscope",
    title: "Chinese Academy of Sciences unveils Aeye-1, the world's first AI-driven transmission electron microscope",
    body:
      "Scientists at the Dalian Institute of Chemical Physics (Chinese Academy of Sciences) announced Aeye-1, an AI-TEM system enabling fully autonomous operation — covering sample transfer, imaging, and analysis — with an efficiency over 300 times higher than manual processing.",
    domain: "technology",
    claimantName: "Chinese Academy of Sciences (Dalian Institute)",
    subjectKind: "institution",
    sourceUrl: "https://english.cas.cn/",
    sourceTitle: "CAS announcement of Aeye-1 AI-TEM system",
    sourcePublisher: "Chinese Academy of Sciences",
    sourceQuality: "primary",
    attributionScore: 90,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim originates from the Chinese Academy of Sciences' own publication channels. CAS is the institution behind the research.",
    veracityScore: 65,
    veracityLabel: "Evidence suggests plausible",
    veracityExplanation:
      "The 300x efficiency claim is made by the researchers themselves and has not yet been independently verified by third-party labs. The underlying technology (AI-guided TEM) is plausible but the magnitude of improvement requires peer review.",
    createdAt: "2026-05-26T09:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "aeye1-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "CAS official English-language publication describes the Aeye-1 system and its autonomous microscopy capabilities.",
        sourceUrl: "https://english.cas.cn/",
        sourceTitle: "CAS Aeye-1 announcement",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      },
      {
        id: "aeye1-evidence-2",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "The 300x efficiency claim is based on the researchers' own benchmarks comparing AI-automated vs. manual TEM operation. Independent replication has not yet been published.",
        sourceUrl: "https://english.cas.cn/",
        sourceTitle: "CAS Aeye-1 benchmarks",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "flinders-ai-semiconductor-discovery",
    title: "AI platform discovers new gallium-based semiconductor materials, bypassing years of lab experiments",
    body:
      "An international research team led by Flinders University and Khalifa University developed a machine-learning platform — a 'smart materials discovery engine' — that predicts new gallium-based semiconductor compositions, potentially accelerating next-gen chip development.",
    domain: "technology",
    claimantName: "Flinders University / Khalifa University",
    subjectKind: "institution",
    sourceUrl: "https://news.flinders.edu.au/",
    sourceTitle: "Flinders University research announcement",
    sourcePublisher: "Flinders University",
    sourceQuality: "primary",
    attributionScore: 88,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The claim comes from official university press releases from both Flinders and Khalifa University, attributing the work to their joint research team.",
    veracityScore: 62,
    veracityLabel: "Evidence suggests plausible",
    veracityExplanation:
      "The ML platform exists and has produced candidate materials, but whether these gallium-based compounds will actually perform as semiconductor materials in real-world chip manufacturing remains to be validated through synthesis and testing.",
    createdAt: "2026-05-26T09:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "flinders-semi-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Flinders University press release describes the ML platform and its gallium-based semiconductor predictions with peer-reviewed publication details.",
        sourceUrl: "https://news.flinders.edu.au/",
        sourceTitle: "Flinders University AI semiconductor discovery",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "agentic-ai-banking-oversight-crisis",
    title: "Experts warn agentic AI in banking is outpacing governance — traditional testing frameworks are failing",
    body:
      "Financial industry experts warn that as banks deploy autonomous 'agentic' AI systems that can freeze accounts, transfer funds, and make decisions independently, traditional software testing and governance frameworks are insufficient to prevent liability events.",
    domain: "ai",
    claimantName: "QA Financial / Industry Experts",
    subjectKind: "industry",
    sourceUrl: "https://www.qa-financial.com/",
    sourceTitle: "QA Financial report on agentic AI oversight in banking",
    sourcePublisher: "QA Financial",
    sourceQuality: "reputable secondary",
    attributionScore: 78,
    attributionLabel: "Moderate attribution",
    attributionExplanation:
      "The claim aggregates views from multiple unnamed industry experts and financial technology specialists cited in QA Financial's reporting. No single attributable source.",
    veracityScore: 72,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The gap between AI deployment speed and governance frameworks is well-documented across multiple financial regulators and industry bodies. The specific examples of account freezing and fund transfers by autonomous AI are still emerging.",
    createdAt: "2026-05-26T09:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "agentic-banking-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "QA Financial's in-depth report documents the growing gap between agentic AI deployment in banking and existing governance/testing frameworks.",
        sourceUrl: "https://www.qa-financial.com/",
        sourceTitle: "QA Financial agentic AI oversight report",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      },
      {
        id: "agentic-banking-evidence-2",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Multiple financial regulators including the OCC and ECB have published guidance noting the challenges of governing autonomous AI systems in banking, supporting the claim that traditional frameworks are insufficient.",
        sourceUrl: "https://www.occ.gov/",
        sourceTitle: "OCC guidance on AI risk management",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "nebius-gigawatt-ai-factory-missouri",
    title: "Nebius Group breaks ground on gigawatt-scale AI factory campus in Missouri",
    body:
      "Nebius Group has begun construction of a gigawatt-scale AI factory campus in Independence, Missouri — the company's first major US digital infrastructure build, incorporating sustainability measures and community benefit programs.",
    domain: "technology",
    claimantName: "Nebius Group",
    subjectKind: "company",
    sourceUrl: "https://nebius.com/",
    sourceTitle: "Nebius Group AI factory announcement",
    sourcePublisher: "Nebius Group",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "Nebius Group officially announced the groundbreaking. The company made the claim about its own infrastructure project.",
    veracityScore: 75,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The groundbreaking ceremony is a public event. 'Gigawatt-scale' is an aspiration — the final operational capacity may differ. Construction has begun but completion timeline and actual power capacity are forward-looking statements.",
    createdAt: "2026-05-26T09:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "nebius-evidence-1",
        stance: "support",
        assessmentTarget: "attribution",
        summary:
          "Nebius Group's own press materials confirm the Independence, Missouri groundbreaking and describe the project as gigawatt-scale.",
        sourceUrl: "https://nebius.com/",
        sourceTitle: "Nebius AI factory announcement",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      },
      {
        id: "nebius-evidence-2",
        stance: "context",
        assessmentTarget: "veracity",
        summary:
          "SimplyWallSt financial coverage notes that the project is Nebius's first major US build. Analysts highlight the project's scale relative to Nebius's current revenue, raising questions about financing and completion timeline.",
        sourceUrl: "https://simplywall.st/",
        sourceTitle: "SimplyWallSt Nebius Group analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "ai-consumer-backlash-misunderstood-2026",
    title: "Analysis: Tech industry is fundamentally misunderstanding why consumers resist AI adoption",
    body:
      "AI Weekly analysis argues that consumer AI resistance is not technophobia but stems from psychological loss of agency, fears of economic displacement, and deep-seated platform trust deficits — factors that current PR campaigns and UX improvements have failed to address.",
    domain: "ai",
    claimantName: "AI Weekly",
    subjectKind: "publication",
    sourceUrl: "https://aiweekly.co/",
    sourceTitle: "AI Weekly analysis of consumer AI backlash",
    sourcePublisher: "AI Weekly",
    sourceQuality: "reputable secondary",
    attributionScore: 82,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The analysis is published under AI Weekly's editorial voice with specific cited research and data points about consumer sentiment.",
    veracityScore: 68,
    veracityLabel: "Evidence suggests plausible",
    veracityExplanation:
      "The claim that tech companies misunderstand consumer resistance is an editorial interpretation supported by consumer survey data, but alternative explanations (product quality, privacy concerns, cost) are also valid and not fully addressed.",
    createdAt: "2026-05-26T09:30:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "ai-backlash-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "AI Weekly's analysis cites multiple consumer surveys showing that AI resistance correlates more strongly with loss-of-agency concerns than with technical illiteracy or general technophobia.",
        sourceUrl: "https://aiweekly.co/",
        sourceTitle: "AI Weekly consumer AI resistance analysis",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      },
      {
        id: "ai-backlash-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Counter-evidence suggests that AI adoption rates are actually growing rapidly in many demographics, with ChatGPT, Gemini, and Claude all reporting record user numbers in Q1 2026 — complicating the 'backlash' narrative.",
        sourceUrl: "https://www.reuters.com/",
        sourceTitle: "Reuters AI adoption trends Q1 2026",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T09:30:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "pope-leo-xiv-ai-encyclical-2026",
    title:
      "Pope Leo XIV issues first papal encyclical on AI, calling for 'disarming' of artificial intelligence",
    body:
      "The encyclical 'Magnifica Humanitas' warns against the 'culture of power' driving the AI race, calls for independent external regulation, and demands a ban on delegating lethal decisions to AI systems.",
    domain: "ai",
    claimantName: "Pope Leo XIV / The Vatican",
    subjectKind: "institution",
    sourceUrl:
      "https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html",
    sourceTitle: "Encyclical Letter Magnifica Humanitas",
    sourcePublisher: "Vatican",
    sourceQuality: "primary",
    attributionScore: 92,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The encyclical is a formal Vatican document, publicly signed and released. Multiple major outlets covered the Vatican presentation where Anthropic co-founder Christopher Olah participated.",
    veracityScore: 78,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The document's existence and content are verified through multiple independent sources and the Vatican's own channels. The policy recommendations are opinions rather than factual claims, so veracity measures whether the characterization of the document is accurate.",
    createdAt: "2026-05-26T10:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "pope-encyclical-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "The Vatican published the full encyclical text and identifies it as Pope Leo XIV's first encyclical on safeguarding the human person in the time of artificial intelligence.",
        sourceUrl:
          "https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html",
        sourceTitle: "Encyclical Letter Magnifica Humanitas",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "pope-encyclical-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "AP coverage frames the document as a manifesto calling for robust AI regulation, which supports the attribution while showing the regulatory interpretation comes from coverage of a normative document.",
        sourceUrl: "https://apnews.com/article/d92d0108730d146baa46da041b8523da",
        sourceTitle:
          "Pope calls for robust regulation of AI in manifesto that ponders the future of humanity",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "openai-confidential-ipo-filing-2026",
    title:
      "OpenAI is reportedly preparing a confidential IPO filing, targeting a late-2026 public debut",
    body:
      "Axios reported that OpenAI is working on a confidential IPO prospectus with major Wall Street banks, while OpenAI said it regularly evaluates strategic options and remains focused on execution.",
    domain: "ai",
    claimantName: "Axios / person familiar with the situation",
    subjectKind: "company",
    sourceUrl: "https://www.axios.com/2026/05/20/openai-ipo-spacex-musk",
    sourceTitle: "OpenAI Prepares Confidential IPO Filing",
    sourcePublisher: "Axios",
    sourceQuality: "reputable secondary",
    attributionScore: 85,
    attributionLabel: "Well-attributed",
    attributionExplanation:
      "Axios reports the filing preparation based on a person familiar with the situation, while OpenAI's quoted response stops short of confirming a filing.",
    veracityScore: 65,
    veracityLabel: "Moderately supported",
    veracityExplanation:
      "The IPO preparation is credibly reported but relies on unnamed sourcing. The timing and valuation remain uncertain until a public S-1 or company confirmation appears.",
    createdAt: "2026-05-26T10:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "openai-ipo-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Axios reports OpenAI is working on a confidential IPO prospectus and that banks including Goldman Sachs, Morgan Stanley, and JPMorgan Chase are involved.",
        sourceUrl: "https://www.axios.com/2026/05/20/openai-ipo-spacex-musk",
        sourceTitle: "OpenAI Prepares Confidential IPO Filing",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "openai-ipo-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "Forbes reports Elon Musk vowed to appeal after losing his OpenAI lawsuit, a reminder that legal and governance questions may still affect IPO timing.",
        sourceUrl:
          "https://www.forbes.com/sites/the-prompt/2026/05/19/musk-vows-appeal-after-losing-150-billion-openai-lawsuit/",
        sourceTitle: "Musk Vows Appeal After Losing $150 Billion OpenAI Lawsuit",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "anthropic-first-quarterly-profit-2026",
    title:
      "Anthropic projects first-ever quarterly operating profit of $559M on $10.9B revenue in Q2 2026",
    body:
      "Internal projections shared with investors show Anthropic expects a massive revenue jump from $4.8B in Q1 to $10.9B in Q2 2026, driven by enterprise adoption including a 30,000-person PwC deployment.",
    domain: "ai",
    claimantName: "Anthropic",
    subjectKind: "company",
    sourceUrl:
      "https://www.investing.com/news/economy-news/anthropic-revenue-set-to-more-than-double-to-109-billion-in-q2-4702486",
    sourceTitle: "Anthropic revenue set to more than double to $10.9 billion in Q2",
    sourcePublisher: "Investing.com",
    sourceQuality: "reputable secondary",
    attributionScore: 72,
    attributionLabel: "Moderately attributed",
    attributionExplanation:
      "The projections were reportedly shared with investors during fundraising. No official public announcement from Anthropic. Attribution relies on investor communications reported by secondary tech outlets.",
    veracityScore: 52,
    veracityLabel: "Uncertain",
    veracityExplanation:
      "These are unaudited internal projections shared during fundraising — historically, companies present optimistic figures in such contexts. The revenue doubling in one quarter is extraordinary and unverified.",
    createdAt: "2026-05-26T10:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "anthropic-profit-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Investing.com, citing Wall Street Journal reporting, says Anthropic projects $10.9B in Q2 revenue and $559M in operating profit during its June quarter.",
        sourceUrl:
          "https://www.investing.com/news/economy-news/anthropic-revenue-set-to-more-than-double-to-109-billion-in-q2-4702486",
        sourceTitle: "Anthropic revenue set to more than double to $10.9 billion in Q2",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "anthropic-profit-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "A critical analysis notes the figures are projections for a quarter that has not closed and may depend on temporary compute cost assumptions, so the profit claim should not be treated as audited results.",
        sourceUrl:
          "https://chatforest.com/reviews/anthropic-first-operating-profit-q2-2026-milestone-or-accounting/",
        sourceTitle: "Anthropic's First Operating Profit: Milestone or Accounting Trick?",
        sourceQuality: "indirect secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "stability-ai-audio-3-launch-2026",
    title:
      "Stability AI releases Stable Audio 3.0 with professional-grade AI music generation over 6 minutes long",
    body:
      "Stability AI launched a family of four AI audio models, with the Medium model generating tracks up to 6 minutes 20 seconds. Three models are released as open-weights on Hugging Face with free commercial use under $1M revenue.",
    domain: "technology",
    claimantName: "Stability AI",
    subjectKind: "company",
    sourceUrl:
      "https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models",
    sourceTitle:
      "Meet Stable Audio 3.0, the model family built for artistic experimentation with open-weight models",
    sourcePublisher: "Stability AI",
    sourceQuality: "primary",
    attributionScore: 96,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "The source is Stability AI's official announcement and product page. The models are publicly available on Hugging Face for independent verification.",
    veracityScore: 82,
    veracityLabel: "Evidence suggests supported",
    veracityExplanation:
      "The models are publicly available for testing. Track duration and feature claims can be verified independently. The open-weights release is confirmed on Hugging Face.",
    createdAt: "2026-05-26T10:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "stability-audio-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Stability AI says Stable Audio 3.0 Medium supports track lengths up to 6:20 and that Small SFX, Small, and Medium are available as open weights on Hugging Face.",
        sourceUrl:
          "https://stability.ai/news-updates/meet-stable-audio-3-the-model-family-built-for-artistic-experimentation-with-open-weight-models",
        sourceTitle:
          "Meet Stable Audio 3.0, the model family built for artistic experimentation with open-weight models",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "stability-audio-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "TechCrunch independently covered the release and described the six-minute generation capability, but the broader 'professional-grade' quality claim still needs user-side assessment.",
        sourceUrl:
          "https://techcrunch.com/2026/05/20/stability-ai-release-a-new-audio-model-that-can-create-six-minute-songs/",
        sourceTitle:
          "Stability AI releases a new audio model that can create six-minute songs",
        sourceQuality: "reputable secondary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      }
    ]
  },
  {
    id: "pwc-anthropic-30k-professionals-2026",
    title:
      "PwC commits to training 30,000 professionals on Claude, reporting up to 70% faster software delivery",
    body:
      "PwC and Anthropic announce a major expansion deploying Claude across M&A advisory, finance, and software delivery. Client-reported metrics show up to 70% faster delivery with AI-native workflows.",
    domain: "ai",
    claimantName: "PwC",
    subjectKind: "company",
    sourceUrl: "https://www.anthropic.com/news/pwc-expanded-partnership?stream=top",
    sourceTitle:
      "PwC is deploying Claude to build technology, execute deals, and reinvent enterprise functions for clients",
    sourcePublisher: "Anthropic",
    sourceQuality: "primary",
    attributionScore: 94,
    attributionLabel: "Strong attribution",
    attributionExplanation:
      "PwC's official announcement confirms the partnership expansion, training commitment, and deployment areas. Anthropic is named as the AI partner.",
    veracityScore: 62,
    veracityLabel: "Moderately supported",
    veracityExplanation:
      "The partnership and training scale are confirmed by PwC. However, the 70% faster delivery claim is client-reported and not independently verified. Impact on actual business outcomes vs. cost reduction is debated.",
    createdAt: "2026-05-26T10:20:00+04:00",
    submittedBy: "Smith",
    aiAssisted: true,
    evidence: [
      {
        id: "pwc-anthropic-evidence-1",
        stance: "support",
        assessmentTarget: "veracity",
        summary:
          "Anthropic's announcement says PwC will train and certify 30,000 professionals on Claude and establish a joint Center of Excellence.",
        sourceUrl: "https://www.anthropic.com/news/pwc-expanded-partnership?stream=top",
        sourceTitle:
          "PwC is deploying Claude to build technology, execute deals, and reinvent enterprise functions for clients",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
        aiAssisted: true
      },
      {
        id: "pwc-anthropic-evidence-2",
        stance: "challenge",
        assessmentTarget: "veracity",
        summary:
          "The same announcement attributes the up-to-70% delivery improvement to client reports, so the outcome metric should be treated as reported deployment performance rather than independently audited proof.",
        sourceUrl: "https://www.anthropic.com/news/pwc-expanded-partnership?stream=top",
        sourceTitle:
          "PwC is deploying Claude to build technology, execute deals, and reinvent enterprise functions for clients",
        sourceQuality: "primary",
        submittedBy: "Smith",
        createdAt: "2026-05-26T10:20:00+04:00",
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
