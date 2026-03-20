# Phase 8 – Startup Audit

Date: 2026-03-20
Branch: `work`
Stage: Phase 8 / Startup Audit

## 0. Background

本审计严格承接 Phase 7 Final Freeze，并遵循“先审计、后锁定、再进入 Step 1”的顺序。

本轮目标不是实现功能，而是回答：

- Phase 8 是否继续停留在 non-executing/read-only 层；
- 或是否首次进入 **仅 design/contract 层** 的 bounded execution / bounded persistence 研究。

## A. 当前承接基线确认

### A.1 承接状态

结论：**严格承接 Phase 7 Final Freeze（yes）**。

依据：
- Phase 7 文档链（startup audit / step1-5 / final freeze）完整存在且术语一致。
- 当前核心实现与测试仍围绕 pure contract / pure derivation / read-only surfacing。
- 未发现将 skeleton 升级为 live execution system 的代码路径。

### A.2 Branch / working tree 适配性

结论：**当前分支与工作树适合作为 Phase 8 起点（yes）**。

- branch: `work`
- `git status --short --branch` 显示无未收口改动（本审计启动时）。

### A.3 与 Freeze 冲突项检查

结论：**未发现与 Phase 7 freeze 冲突的未收口内容（none detected）**。

## B. 当前系统状态盘点

### B.1 已实现能力（non-executing/read-only/derived）

1. Phase 6 controlled submission readiness + gate（pure contract / pure gate）
   - `buildControlledSubmissionContract`
   - `evaluateControlledSubmissionGate`
2. Phase 7 approval checkpoint contract skeleton（pure derivation）
3. Phase 7 audit trail skeleton（derived semantic events，non-persistent）
4. Decision Surface read-only surfacing（checkpoint + trail + controlled submission）
5. regression/boundary tests（跨层一致性与反越界）

### B.2 已存在的 controlled submission / checkpoint / trail / surfacing / tests

- controlled submission contract 与 gate：已实现并测试。
- checkpoint contract：已实现并测试。
- audit trail skeleton：已实现并测试。
- UI surfacing：已接入 Decision Surface，仍为 display-only。
- cross-layer regression：已覆盖 `readiness != execution` 等关键边界。

### B.3 当前最接近 execution/persistence 边界的位置

1. `app/internal/leads/[id]/DecisionSurfaceSection.tsx`
   - 已存在 readiness/checkpoint/trail 聚合展示；是最容易“加按钮即越界”的位置。
2. `lib/controlledSubmissionContract.ts` + `lib/controlledSubmissionGate.ts`
   - 已表达 `submission_ready` 与 `allowed` 语义；最容易被误扩展为 submission execution。
3. `lib/approvalCheckpointContract.ts`
   - 已有 approval checkpoint 术语；最容易被误扩展为 approval completion。
4. `lib/auditTrailSkeleton.ts`
   - 已有 audit trail 术语；最容易被误扩展为 persisted system-of-record。

## C. Freeze Boundary Review

本审计确认以下 freeze boundary 继续强制有效：

- readiness != execution
- allowed != executed
- checkpoint != approval completion
- checkpoint availability != approval granted
- audit trail != persisted production audit system
- audit event != external record
- manual confirmation != submission
- no persistence
- no external side effects
- automation_not_implemented remains explicit

结论：当前代码与测试仍然满足以上边界，且边界文案在 UI 与 contract 层均有显式表达。

## D. Phase 8 候选主线

### Candidate A：继续扩展 read-only / semantic / observability layer

- 目标：增强只读解释层（例如 richer derived notes、可视化细化）。
- 承接性：高，完全延续 Phase 7 语义。
- 是否触碰 execution/persistence：否。
- 风险：价值增量趋缓，可能延后对 future write-path 风险的前置收敛。
- 作为唯一主线适配度：中高。

### Candidate B：定义 bounded persistence / controlled write-path contract（design-only）

- 目标：在不实现写入的前提下，先明确 write-path preconditions、state transitions、idempotency/rollback boundary、failure semantics 与 no-side-effect guardrails。
- 承接性：高。直接建立在 Phase 6/7 现有 readiness/checkpoint/trail 语义之上。
- 是否触碰 execution/persistence：**仅触碰 design/contract 层；不触碰实现层**。
- 风险：术语稍有不严谨就会被误读为“准备上线执行”；需强制文档与测试防线。
- 作为唯一主线适配度：**高（推荐）**。

### Candidate C：定义 bounded execution preconditions / approval-to-action architecture（design-only）

- 目标：研究 approval→action 的执行前置架构。
- 承接性：中。与 checkpoint 有关，但靠近 execution 语义更重。
- 是否触碰 execution/persistence：仅 design 层，但 execution 误读风险高于 B。
- 风险：容易引发并行讨论（approval orchestration + dispatch + control surface）。
- 作为唯一主线适配度：中。

## E. 是否首次触碰 execution/persistence 设计层

结论：**建议 yes（仅 design/contract 层）**。

说明：
- 不建议直接实现 live execution 或 persistence；
- 建议 Phase 8 首次进入“受限写路径与持久化边界”的 contract-level 设计，提前锁定不可越界条件；
- 设计产物必须保持：non-executing、non-persistent implementation、no external side effects。

## F. 单主线建议

推荐唯一主线：**Candidate B（bounded persistence / controlled write-path contract，design-only）**。

### 为什么选 B

1. 与现有基线自然衔接：
   - 已有 readiness/gate/checkpoint/trail 的语义输入，可作为 write-path precondition 契约来源。
2. 可控：
   - 可在 contract/doc/test 层完成，不需重构主骨架。
3. 可测试可冻结：
   - 可以通过 contract tests 明确“allowed design != executed behavior”。
4. 风险前置：
   - 比持续只做 read-only 更早收敛未来 write-path 的边界歧义。

### 为什么不选 A

- A 安全但增量有限，无法及时沉淀 future bounded write-path 的前置约束。

### 为什么不选 C

- C 更贴近 execution orchestration，误读与范围蔓延风险高于 B，不适合作为 Phase 8 起始唯一主线。

### 选择 B 后明确不做什么

- 不做真实 DB/persistence 实现。
- 不做 API writeback。
- 不做 approval automation。
- 不做 notification/dispatch/webhook。
- 不做 operator-triggered execution controls。
- 不做 live submission / live approval completion。

## G. Scope Lock Proposal

### G.1 Phase 8 推荐唯一主线

- **Track: Bounded persistence / controlled write-path contract（design-only）**

### G.2 Phase 8 明确排除范围

- 任何真实 execution path
- 任何真实 persistence / migration / external write
- 任何自动化调度与外部副作用
- 任何 workflow control UI action（approve/submit/dispatch）
- 并行推进多主线

### G.3 Phase 8 Step 1 建议目标

Step 1（Scope Lock）建议输出：

1. 写路径设计输入/输出契约（仅类型与语义，不实现）
2. precondition matrix（readiness/gate/checkpoint/trail -> eligibility classes）
3. failure taxonomy（retriable / non-retriable / manual-intervention-required）
4. idempotency/rollback boundary statement（contract-level only）
5. explicit non-goals（no live writes/no execution/no external effects）
6. regression guardrails（防止“design contract”被误当“implemented behavior”）

## Startup Audit Conclusion

- 是否完成本轮任务：**yes**
- 当前阶段：**Phase 8 - Startup Audit**
- 审计结论：当前项目严格承接 Phase 7 Final Freeze，建议 Phase 8 首次进入 **execution/persistence 的 design/contract 层**，但仅限文档/契约/测试防线，不进入任何 live 实现。
- 推荐唯一主线：**Candidate B**。
