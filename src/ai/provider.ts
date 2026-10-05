export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
  provider: string;
}

export interface AIProvider {
  readonly name: string;
  generate(messages: AIMessage[]): Promise<AIResponse>;
}

/**
 * Safe local provider used until an authenticated model provider is configured.
 * It deliberately performs no computer or security action by itself.
 */
export class LocalAIProvider implements AIProvider {
  readonly name = "local";

  async generate(messages: AIMessage[]): Promise<AIResponse> {
    const last = [...messages].reverse().find(m => m.role === "user");
    return {
      text: last ? `JARVIS understood: ${last.content}` : "JARVIS is ready.",
      model: "local-safe-v1",
      provider: this.name
    };
  }
}
