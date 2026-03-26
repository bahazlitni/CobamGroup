import { describe, expect, it } from "vitest";
import {
  canAssignRole,
  canSetAdminPowerType,
  isTargetBelowActor,
  type RoleSummary,
} from "@/features/rbac/roles";

function makeRole(
  name: string,
  priorityIndex: number,
  overrides: Partial<RoleSummary> = {},
): RoleSummary {
  return {
    id: name.toLowerCase(),
    key: name.toUpperCase(),
    name,
    color: "#000000",
    priorityIndex,
    description: null,
    isActive: true,
    ...overrides,
  };
}

describe("rbac roles", () => {
  const manager = makeRole("Manager", 10);
  const editor = makeRole("Editor", 20);
  const junior = makeRole("Junior", 30);

  it("allows ROOT to affect non-root users", () => {
    const result = isTargetBelowActor(
      { id: "root-1", powerType: "ROOT", effectiveRole: null },
      { id: "staff-1", powerType: "STAFF", effectiveRole: junior },
    );

    expect(result).toBe(true);
  });

  it("does not allow ADMIN to affect ROOT", () => {
    const result = isTargetBelowActor(
      { id: "admin-1", powerType: "ADMIN", effectiveRole: null },
      { id: "root-1", powerType: "ROOT", effectiveRole: null },
    );

    expect(result).toBe(false);
  });

  it("allows STAFF to affect only lower-priority staff roles", () => {
    expect(
      isTargetBelowActor(
        { id: "s1", powerType: "STAFF", effectiveRole: manager },
        { id: "s2", powerType: "STAFF", effectiveRole: junior },
      ),
    ).toBe(true);

    expect(
      isTargetBelowActor(
        { id: "s1", powerType: "STAFF", effectiveRole: editor },
        { id: "s2", powerType: "STAFF", effectiveRole: manager },
      ),
    ).toBe(false);
  });

  it("blocks banned actors", () => {
    const result = isTargetBelowActor(
      { id: "s1", powerType: "STAFF", effectiveRole: manager, status: "BANNED" },
      { id: "s2", powerType: "STAFF", effectiveRole: junior },
    );

    expect(result).toBe(false);
  });

  it("only lets staff assign lower roles", () => {
    expect(
      canAssignRole(
        { powerType: "STAFF", effectiveRole: manager },
        junior,
      ),
    ).toBe(true);

    expect(
      canAssignRole(
        { powerType: "STAFF", effectiveRole: editor },
        manager,
      ),
    ).toBe(false);
  });

  it("only lets ROOT grant admin power type", () => {
    expect(canSetAdminPowerType("ROOT")).toBe(true);
    expect(canSetAdminPowerType("ADMIN")).toBe(false);
    expect(canSetAdminPowerType("STAFF")).toBe(false);
  });
});
