import assert from "node:assert/strict";
import { canTransitionStatus } from "../lib/directorConsole/status";

assert.equal(canTransitionStatus("new", "media_pending_review"), true);
assert.equal(canTransitionStatus("estimate_pending", "closed_won"), false);
assert.equal(canTransitionStatus("closed_won", "archived"), true);

console.log("directorConsoleStatus.test passed");
