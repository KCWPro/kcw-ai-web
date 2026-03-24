# KCW AI Platform – Phase 29 Step 2 Implementation Design

Date: 2026-03-24  
Branch: `work`  
Mainline: `controlled_internal_lead_detail_mutation_mainline`  
Stage: Step 2 / Implementation Design (No coding)

---

## 1. Step 2 title

**Step 2 Title:**  
**Controlled Internal Lead Detail Mutation Mainline – Minimal Intent-Scoped Implementation Design**

本文件仅定义实现设计与边界，不包含任何代码实现。

---

## 2. Inherited scope lock

本 Step 2 严格承接 `docs/phase29-step1-scope-lock.md` 已锁定边界：

- single-object only
- detail-page only
- operator-manual only
- bounded intent only
- no downstream trigger
- no generalized write authority
- no controller-capable semantics
- still controlled internal Beta
- not fully operational production release

承接结论：Step 2 只能对单条 lead detail 页上的三类 intent 进行最小实现设计，不得扩线。

---

## 3. Intent model

本主线 intent taxonomy 在 Step 2 固化为以下三类（最终命名）：

1. `manual_reanalyze`
2. `status_update`
3. `notes_update`

### 3.1 `manual_reanalyze`

- 触发主体：operator 手动点击。  
- 输入：`lead_id`（path id），`intent="manual_reanalyze"`。  
- 输出：当前 lead 的最新 AI Intake Analysis 结果（用于 detail 展示）。  
- 失败条件：lead 不存在；analysis runtime 异常；intent 非法；鉴权失败；参数缺失。  
- 特殊约束：仅运行 analysis，不派生任何 status/workflow/follow-up/estimate/handoff/checkpoint/continuity 动作。

### 3.2 `status_update`

- 触发主体：operator 手动点击 Save。  
- 输入：`lead_id`，`intent="status_update"`，`status`（受限枚举）。  
- 输出：保存后的 status（仅当前 lead）。  
- 失败条件：lead 不存在；status 非法；鉴权失败；intent 非法；写入失败。  
- 特殊约束：写入仅 status 字段，不触发任何 downstream。

### 3.3 `notes_update`

- 触发主体：operator 手动点击 Save notes。  
- 输入：`lead_id`，`intent="notes_update"`，`internal_notes`（长度受限文本）。  
- 输出：保存后的 internal_notes（仅当前 lead）。  
- 失败条件：lead 不存在；notes 超限或类型非法；鉴权失败；intent 非法；写入失败。  
- 特殊约束：写入仅 internal_notes 字段，不触发任何 downstream。

### 3.4 类型化区分建议

采用显式 discriminated union（语义层，不是代码提交）：

- `intent: "manual_reanalyze" | "status_update" | "notes_update"`
- 服务端必须先按 intent 路由分支，再做该分支专属参数校验。
- 未在白名单中的 intent 一律 `400/422` 拒绝。

---

## 4. UI mutation surface design

### 4.1 Detail 页可用按钮（仅此）

- 恢复 `Lead Status` 的 Save 按钮（对应 `status_update`）。
- 恢复 `Internal Notes` 的 Save notes 按钮（对应 `notes_update`）。
- 在 `AI Intake Analysis` 区块新增/恢复 `Re-analyze` 按钮（对应 `manual_reanalyze`）。

### 4.2 仍保持禁用/不开放的交互

- 任何 list-level、batch-level、queue-level mutation 入口。
- 任何自动 re-analyze 开关。
- 任何“保存后自动执行 follow-up/quote/checkpoint/handoff/continuity”的开关或按钮。

### 4.3 反馈文案与状态提示设计

每类 intent 统一四态反馈：

- **success**：显示“Manual update saved (internal beta)”类提示。
- **failed**：显示具体错误（validation / runtime / network）。
- **blocked**：显示“Blocked by scope lock policy”并提示不支持自动联动。
- **preview notice**：常驻文案强调“manual-only, single-lead, no automation”。

### 4.4 防误解设计

- 在三个 mutation 入口旁明确说明：
  - “仅作用当前 lead”；
  - “不会自动触发后续动作”；
  - “仍为 controlled internal Beta”。
- 禁止使用“Run workflow / Auto progress / Complete pipeline”等词汇。

---

## 5. API contract design

### 5.1 路由推荐

推荐继续使用单对象路由：`/api/internal/leads/[id]`，但将 mutation contract 收敛为 **intent-gated PATCH**。  
不新增 generalized mutation route，不新增 list/batch route。

### 5.2 PATCH request contract（建议）

通用外层：

```json
{
  "intent": "manual_reanalyze | status_update | notes_update",
  "payload": { ... }
}
```

intent-specific payload：

- `manual_reanalyze`：`payload` 可为空对象 `{}`。  
- `status_update`：`payload = { "status": "new|follow_up|quoted|scheduled|completed|archived" }`。  
- `notes_update`：`payload = { "internal_notes": "string" }`（建议最大长度限制）。

### 5.3 PATCH response contract（建议）

统一返回：

```json
{
  "success": true|false,
  "intent": "...",
  "lead_id": "...",
  "result": { ... },
  "blocked": false,
  "error": ""
}
```

blocked 场景（策略拒绝）建议显式：`blocked=true`，避免误判为系统故障。

### 5.4 参数校验与非法 intent 拒绝

- 先校验 `intent` 是否在白名单。
- 再按 intent 校验 payload schema。
- schema 不匹配或多余字段：`422`。
- intent 不存在：`400`。
- 非授权：`401/403`（沿用 Beta gate）。

---

## 6. Server-side guard design

服务端必须具备以下 hard guards（设计约束）：

1. **Intent whitelist guard**
   - 仅受理 `manual_reanalyze` / `status_update` / `notes_update`。
   - 任意其他 intent 直接拒绝。

2. **Single-lead mutation guard**
   - path id 仅允许单 lead；请求体中禁止 ids 数组与批量对象。
   - 检测到 multi-object payload 直接拒绝。

3. **No-downstream-trigger guard**
   - 三类 intent 执行完成后，不调用 follow-up / estimate / quote / handoff / checkpoint / continuity mutation 路径。
   - 代码层（后续实现）需显式保持“零 downstream invocation”。

4. **Field-level write guard**
   - `status_update` 仅可写 status。
   - `notes_update` 仅可写 internal_notes。
   - `manual_reanalyze` 禁止写 status/internal_notes/其他业务字段。

5. **No-controller semantics guard**
   - 禁止基于 intent 触发任何 orchestrated action plan。
   - 禁止引入自动补偿、自动重试队列、自动状态机推进。

---

## 7. Persistence design

### 7.1 `status_update` persistence

**建议持久化：yes**。  
原因：status 本质为 lead 业务字段，人工保存后应成为后续人工判断依据。

### 7.2 `notes_update` persistence

**建议持久化：yes**。  
原因：internal notes 属于内部协作信息，必须可留存并在 detail 中可复现。

### 7.3 `manual_reanalyze` persistence

**建议持久化：no（默认）**。  
推荐方案：先以“重新计算并即时返回展示层”的非持久化路径落地。

理由：

1. 最符合最小变更原则，避免引入 analysis version 历史存储复杂度。  
2. 避免滑向 generalized audit/orchestration/pipeline semantics。  
3. 能满足 operator 手动重看 analysis 的核心需求。

补充：若后续确需持久化 analysis snapshot，必须新开审计与 scope lock，不在本 Step 2 范围内。

---

## 8. Minimal audit / traceability recommendation

建议引入 **最小 mutation trace**（非 generalized audit system）：

- 记录粒度：仅字段级最小记录（intent、lead_id、operator、timestamp、result）。
- 存放方式：优先轻量日志/最小附加记录，不引入跨实体审计总线。
- 记录目标：可追踪“谁在何时对哪条 lead 执行了哪种 manual intent 及结果”。
- 明确不做：
  - 不做 generalized audit dashboard；
  - 不做 orchestration replay；
  - 不做跨流程自动补偿。

该建议用于“最小可追踪性”，不是能力扩线。

---

## 9. Safety analysis

为什么该 Step 2 设计仍安全且不越界：

1. **边界封装完整**：intent、入口、对象、动作均被硬限制。  
2. **无自动链路**：没有自动 re-analyze、自动推进、自动提交。  
3. **无下游联动**：明确 no downstream trigger，阻断 execution/completion 延展。  
4. **无泛化写权限**：无 list/batch/generalized mutation API。  
5. **无 controller 语义**：无 orchestration/engine/action planner。  
6. **阶段语义不变**：仍是 controlled internal Beta，不是 fully operational production release。

因此该设计属于“narrow mutation capability in controlled internal Beta”，不等于 generalized execution/completion。

---

## 10. Step 2 final design conclusion

Step 2 结论：**DESIGN LOCKED (narrow, intent-gated, single-lead manual mutation only)**。

- 唯一主线：`controlled_internal_lead_detail_mutation_mainline`。
- 三个 intent：`manual_reanalyze` / `status_update` / `notes_update`。
- 推荐 API：沿用 `/api/internal/leads/[id]` 的 intent-gated PATCH。
- 持久化建议：status/notes 持久化；manual_reanalyze 默认不持久化（仅刷新展示层结果）。
- 硬边界：single-object + manual-only + no downstream trigger。

在以上设计不变前提下，可进入下一步最小实现；若要扩线，必须重新审计与重锁范围。
