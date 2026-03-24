# KCW AI Platform – Phase 29 Step 1 Scope Lock

Date: 2026-03-24  
Branch: `work`  
Mainline: `controlled_internal_lead_detail_mutation_mainline`  
Stage: Step 1 / Scope Lock (No implementation)

---

## 1. Scope lock title

**Scope Lock Title:**  
**Controlled Internal Lead Detail Mutation Mainline – Narrow Single-Object Manual Mutation Package Lock**

该 Scope Lock 仅用于锁定边界与可执行范围，不构成实现、不触发任何自动执行路径。

---

## 2. Baseline inherited

本 Step 1 继承并锁定以下已确认基线（as-is）：

1. 首页与 internal workspace 仍是 controlled internal Beta / preview / suggestion-first 口径。  
2. `/internal` 与 `/api/internal/*` 仍在 Beta gate 下。  
3. lead detail 当前整体仍是 preview/read-only 主叙事。  
4. `/api/internal/leads/[id]` 的 PATCH 当前为阻断（403）。  
5. Lead Status 目前 Save disabled。  
6. Internal Notes 目前 Save notes disabled。  
7. AI Intake Analysis 目前 read-only 展示。  
8. Dashboard 与 `/internal/leads` 已同源 Google Sheets 真实读。  
9. Dashboard drill-down 与 follow-up suggestion 的 preview 口径已修复并保持非自动执行语义。

基线继承结论：本主线是在 **controlled internal Beta** 内做窄范围人工 mutation 解锁，不改变整体平台阶段判定。

---

## 3. Why this mainline is being opened

开启该主线的唯一原因是修复 detail 页能力割裂，并形成最小、可控、单对象人工闭环：

- 当前 detail 页面已具备 status/notes 可编辑外观与 analysis 展示，但写入与手动重分析都被封禁，导致 operator 执行路径断裂。
- 用户已明确倾向将三项能力打包开启（manual re-analyze + status save + notes save），以避免“只开一项”造成新的割裂。
- 在不突破冻结链与 Beta 定位的前提下，三项能力可被定义为 **single-object only + detail-page only + operator-manual only + bounded intent only** 的窄能力包。

---

## 4. Allowed scope

本主线允许范围 **仅且必须** 为以下三项，且作为同一能力包整体锁定：

### 4.1 Manual Re-analyze（Allowed）

- 仅限 operator 在 lead detail 页手动点击触发。  
- 仅限当前单个 lead。  
- 仅重跑 AI Intake Analysis。  
- 不自动触发。  
- 不自动联动任何其他模块。

### 4.2 Lead Status Save（Allowed）

- 仅限当前单个 lead。  
- 仅允许人工保存 `status`。  
- 不自动推进 workflow。  
- 不触发 follow-up / estimate / quote / checkpoint / continuity mutation。

### 4.3 Internal Notes Save（Allowed）

- 仅限当前单个 lead。  
- 仅允许人工保存 `internal_notes`。  
- 不触发 follow-up / estimate / handoff / checkpoint / continuity mutation。

---

## 5. Explicit out-of-scope items

以下能力在本主线中全部 **显式排除（out-of-scope）**：

1. 自动 re-analyze。  
2. 字段变化后自动再分析。  
3. 自动状态推进。  
4. 保存 notes 或 status 后自动触发其他模块。  
5. generalized write rollout。  
6. multi-object mutation。  
7. list-level batch mutation。  
8. orchestration / controller behavior。  
9. external side effects（客户触达、外部系统自动写入、异步自动动作）。  
10. automatic execution / completion。  
11. quote / handoff / checkpoint / follow-up / continuity 的自动再计算并自动提交。

---

## 6. Hard boundary clauses

以下条款为 Step 1 硬边界，后续设计与实现不得越过：

1. **single-object only**：任何 mutation 仅能作用于单条 lead，禁止跨 lead、批量、队列级写入。  
2. **detail-page only**：入口仅限 `/internal/leads/[id]` detail surface，禁止列表页与自动化入口引入写操作。  
3. **operator-manual only**：必须由人工显式触发，不得由系统事件、字段变化、定时器、后台任务自动触发。  
4. **bounded intent only**：只允许三类 intent：`manual_reanalyze` / `status_save` / `notes_save`。  
5. **no downstream trigger**：三类 intent 完成后不得触发 follow-up / estimate / quote / handoff / checkpoint / continuity mutation。  
6. **no generalized write authority**：不得扩展为通用写接口、通用 mutation controller、通用编排层。  
7. **no controller-capable semantics**：UI/API 语义不得演化为 orchestration/controller 能力。  
8. **still controlled internal Beta**：口径持续为 controlled internal Beta/preview。  
9. **not fully operational production release**：不得宣称 fully operational/production close。

---

## 7. Mutation intent taxonomy

本主线仅定义三类受限 intent taxonomy：

- `manual_reanalyze`
  - 语义：手动重跑当前 lead 的 AI Intake Analysis。
  - 输入边界：当前 lead id。
  - 输出边界：更新 analysis 展示所需结果（仅本 lead）。
  - 禁止派生动作：不得产生任何后续自动动作。

- `status_save`
  - 语义：人工保存当前 lead 的状态值。
  - 输入边界：当前 lead id + status。
  - 输出边界：仅本 lead 的 status mutation。
  - 禁止派生动作：不得触发 workflow progression/follow-up/quote/checkpoint。

- `notes_save`
  - 语义：人工保存当前 lead 的 internal notes。
  - 输入边界：当前 lead id + internal_notes。
  - 输出边界：仅本 lead 的 internal_notes mutation。
  - 禁止派生动作：不得触发 handoff/follow-up/estimate/continuity mutation。

taxonomy 锁定说明：除以上三类外，不新增第四类 intent。

---

## 8. Safety constraints

为防止边界滑移，Step 1 安全约束如下：

1. 所有 mutation 必须通过 Beta gate 范围内的 internal surface。  
2. 仅允许 deterministic、single-intent、single-object 的受限动作。  
3. 禁止自动链路、禁止事件驱动自动动作、禁止后台 orchestration。  
4. 禁止由 status/notes/re-analysis 产生任何 external side effects。  
5. UI 文案必须持续强调 preview/internal/manual，不得暗示自动执行能力。  
6. API contract 必须可区分 intent，且默认拒绝不在白名单内的 mutation 请求。  
7. 若后续需求请求扩线，必须先经过新一轮 pre-start audit + scope lock，不得在本主线内偷扩。

---

## 9. Why this is not generalized execution/completion

本主线不是 generalized execution/completion，理由如下：

1. **触发方式受限**：仅 operator 手动触发，不存在自动执行入口。  
2. **对象范围受限**：仅单条 lead，不具备 multi-object orchestration 条件。  
3. **intent 范围受限**：仅三类 bounded intent，不提供 generalized mutation authority。  
4. **后续动作受限**：明确 no downstream trigger，阻断 execution/completion 链路。  
5. **系统语义受限**：仍是 controlled internal Beta / preview，不是 production operational close。  
6. **控制语义受限**：不引入 controller-capable semantics，不形成 workflow engine/orchestration。

因此该主线仅是“窄范围人工 mutation 能力包”，不构成 generalized execution/completion 解锁。

---

## 10. Step 1 final lock conclusion

Step 1 Scope Lock 结论：**LOCKED (conditional-allowed, narrow-only)**。

- 锁定主线：`controlled_internal_lead_detail_mutation_mainline`（唯一主线）。
- 锁定能力包：`manual_reanalyze + status_save + notes_save`（三项整体，不拆分）。
- 锁定边界：single-object only / detail-page only / operator-manual only / bounded intent only。
- 锁定禁令：no downstream trigger / no generalized write authority / no controller-capable semantics。
- 阶段语义：仍为 controlled internal Beta；明确 not fully operational production release。

在上述硬边界不被修改前，可进入后续“实现设计”步骤；任何超出范围诉求均需重新审计并重启 Scope Lock。
