import assert from "node:assert/strict";
import { buildBoundedWriteImplementationReadinessContract } from "../lib/boundedWriteImplementationReadinessContract";

function run() {
  const contract = buildBoundedWriteImplementationReadinessContract();

  assert.equal(contract.contract_version, "phase9-step3-readiness-hardening-v1");
  assert.equal(contract.mode, "design_time_non_executing_contract");

  assert.ok(contract.guardrails.includes("readiness_defined != implementation_permitted"));
  assert.ok(contract.guardrails.includes("commit_eligible != commit_executed"));
  assert.ok(contract.guardrails.includes("audit_minimum_defined != audit_persisted"));

  assert.equal(contract.non_execution_boundary.implementation_permitted, false);
  assert.equal(contract.non_execution_boundary.mutation_committed, false);
  assert.equal(contract.non_execution_boundary.persistence_performed, false);
  assert.equal(contract.non_execution_boundary.external_write_performed, false);
  assert.equal(contract.non_execution_boundary.execution_control_available, false);
  assert.equal(contract.non_execution_boundary.external_side_effects, false);

  const minimalWriteRule = contract.terminology_rules.find((item) => item.term === "minimal_write_object");
  assert.ok(minimalWriteRule);
  assert.match(minimalWriteRule!.preferred_wording, /readiness-defined/i);

  const sourceOfTruthRule = contract.terminology_rules.find((item) => item.term === "source_of_truth");
  assert.ok(sourceOfTruthRule);
  assert.match(sourceOfTruthRule!.freeze_compatibility_note, /distinct from record update/i);

  const serialized = JSON.stringify(contract);
  assert.doesNotMatch(serialized, /mutation committed successfully|write executed successfully|record updated successfully/i);

  console.log("boundedWriteImplementationReadinessContract tests passed");
}

run();
