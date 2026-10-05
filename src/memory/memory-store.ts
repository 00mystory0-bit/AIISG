import { randomUUID } from "node:crypto";

export interface Memory {
  id: string;
  text: string;
  tags: string[];
  createdAt: string;
}

const SECRET_PATTERN = /(api[_-]?key|token|password|secret|private[_-]?key|seed phrase|mnemonic)/i;

export class MemoryStore {
  private readonly memories: Memory[] = [];

  add(text: string, tags: string[] = []) {
    if (!text.trim()) throw new Error("Memory text is required");
    if (SECRET_PATTERN.test(text)) {
      throw new Error("Potential secret detected; memory was not stored");
    }
    const memory: Memory = {
      id: randomUUID(),
      text: text.trim(),
      tags,
      createdAt: new Date().toISOString()
    };
    this.memories.unshift(memory);
    return memory;
  }

  search(query: string) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.memories.filter(memory => {
      const haystack = (memory.text + " " + memory.tags.join(" ")).toLowerCase();
      return terms.every(term => haystack.includes(term));
    });
  }

  list() {
    return this.memories;
  }
}
