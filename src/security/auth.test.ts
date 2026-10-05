import {describe,expect,it,beforeEach} from "vitest";
import {authenticateToken} from "./auth.js";

describe("authentication",()=>{
  beforeEach(()=>{
    process.env.AIISG_OWNER_API_KEY="owner-test-key";
    process.env.AIISG_OPERATOR_API_KEY="operator-test-key";
    process.env.AIISG_OBSERVER_API_KEY="observer-test-key";
  });
  it("maps configured keys to server-side roles",()=>{
    expect(authenticateToken("owner-test-key")?.role).toBe("owner");
    expect(authenticateToken("operator-test-key")?.role).toBe("operator");
    expect(authenticateToken("observer-test-key")?.role).toBe("observer");
  });
  it("rejects missing and unknown credentials",()=>{
    expect(authenticateToken(undefined)).toBeNull();
    expect(authenticateToken("owner")).toBeNull();
  });
});
