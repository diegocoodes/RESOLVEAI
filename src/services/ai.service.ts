import type { AIProvider, AIProviderName, AIRequest, AIResult } from "@/lib/ai/provider";

export class AIService {
  private readonly providers = new Map<AIProviderName, AIProvider>();

  register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
    return this;
  }

  async generate<TFacts, TResult>(providerName: AIProviderName, request: AIRequest<TFacts>): Promise<AIResult<TResult>> {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Provedor ${providerName} não registrado.`);
    return provider.generate<TFacts, TResult>(request);
  }
}
