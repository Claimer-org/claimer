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
