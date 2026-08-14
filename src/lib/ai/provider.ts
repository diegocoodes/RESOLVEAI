export type AIProviderName = "deterministic" | "openai" | "anthropic" | "gemini";

export type AIRequest<TFacts> = {
  system: string;
  prompt: string;
  facts: TFacts;
};

export type AIResult<TResult> = {
  provider: AIProviderName;
  model?: string;
  data: TResult;
  sourceFacts: unknown;
};

export interface AIProvider {
  readonly name: AIProviderName;
  generate<TFacts, TResult>(request: AIRequest<TFacts>): Promise<AIResult<TResult>>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: AIProviderName) {
    super(`O provedor ${provider} ainda não foi configurado.`);
  }
}
