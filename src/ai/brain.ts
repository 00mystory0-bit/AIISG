import {AIProvider, LocalAIProvider} from "./provider.js";
import {SecurityGuard} from "../security/security-guard.js";

export class JarvisBrain {
  constructor(
    private readonly provider: AIProvider = new LocalAIProvider(),
    private readonly security = new SecurityGuard()
  ) {}

  async think(userInput: string) {
    if (!userInput.trim()) throw new Error("Input is required");

    const risk = this.classifyRisk(userInput);
    const event = this.security.detect({
      source: "jarvis.brain",
      category: "command",
      severity: risk,
      description: `Command evaluated: ${userInput}`
    });

    const response = await this.provider.generate([
      {
        role: "system",
        content: "You are JARVIS for AIISG, a security-first AI assistant. Never claim to have executed an action unless a verified tool execution reports success."
      },
      {role: "user", content: userInput}
    ]);

    return {response, security: event};
  }

  private classifyRisk(input: string) {
    const value = input.toLowerCase();
    if (/(delete|destroy|wipe|format|disable security|exfiltrate|steal)/.test(value)) return "high" as const;
    if (/(install|execute|run|password|credential|network|firewall)/.test(value)) return "medium" as const;
    return "low" as const;
  }
}
