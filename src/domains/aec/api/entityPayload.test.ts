import { describe, expect, it } from "vitest";
import { normalizeEntityRequestBody, resolveEntityCode } from "./entityPayload";

const entities = [
  { id: "db85b864-21e3-4ad8-9648-7ce1435b95b1", code: "ME", name: "Marvelous Engineering", currency: "GBP" },
  { id: "org-ma", code: "MA", name: "Meridian Architecture", currency: "GBP" },
];

describe("entityPayload", () => {
  it("resolves entity codes case-insensitively", () => {
    expect(resolveEntityCode("me", entities)).toBe("ME");
    expect(resolveEntityCode("MA", entities)).toBe("MA");
  });

  it("maps legacy entityId UUID to entity code and removes entityId", () => {
    const body = normalizeEntityRequestBody(
      {
        name: "Alex Chen",
        type: "IN-HOUSE",
        entityId: "db85b864-21e3-4ad8-9648-7ce1435b95b1",
      },
      entities,
    );
    expect(body.entity).toBe("ME");
    expect(body.entityId).toBeUndefined();
  });

  it("maps legacy entityId short code to entity and removes entityId", () => {
    const body = normalizeEntityRequestBody({
      name: "Alex Chen",
      entityId: "MG",
    });
    expect(body.entity).toBe("MG");
    expect(body.entityId).toBeUndefined();
  });

  it("keeps entity when already set on project create payload", () => {
    const body = normalizeEntityRequestBody({
      name: "Kings Cross Tower",
      client: "Holborn Partners",
      entity: "MA",
    });
    expect(body).toEqual({
      name: "Kings Cross Tower",
      client: "Holborn Partners",
      entity: "MA",
    });
  });
});
