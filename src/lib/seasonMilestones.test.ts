import { describe, expect, it } from "vitest";
import {
  getSeasonMilestoneLabel,
  SEASON_TIMELINE_STEPS,
} from "./seasonMilestones";

describe("season milestone compatibility labels", () => {
  it("keeps legacy timeline keys while exposing Season labels", () => {
    expect(SEASON_TIMELINE_STEPS).toEqual(["m0", "m4", "m8", "m12"]);
    expect(getSeasonMilestoneLabel("m0")).toBe("Punto de partida");
    expect(getSeasonMilestoneLabel("m4")).toBe("Season 1");
    expect(getSeasonMilestoneLabel("m8")).toBe("Season 2");
    expect(getSeasonMilestoneLabel("m12")).toBe("Season 3");
  });
});

