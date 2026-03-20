# KCW AI Platform - Phase 11 Step 4 Terminology Alignment and Hardening

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 11 / Step 4

## 1) 本步目标（收敛，不扩张）

在 Phase 11 Step 2（lifecycle observability）与 Step 3（read-only surfacing）基础上，
对术语和映射文案做最小一致性收敛，并补最小回归测试，降低语义漂移风险。

## 2) 发现的术语分散点

1. transition note 在 write-result 层与 read-model 层存在独立文案来源，可能产生漂移。
2. semantic boundary 与 read-only notice 存在跨层重复定义，未来容易改一处漏一处。
3. 测试层对“跨层术语一致”断言不足，主要验证“存在”而非“一致”。

## 3) 收敛策略（最小必要）

- 统一常量源：
  - lifecycle model version
  - lifecycle transition notes
  - lifecycle semantic boundary
  - read-only notice
- read model 与 UI 复用同一术语来源，不再各自维护近义文案。
- 测试补“跨层一致”断言（非 completion/execution 语义保持不变）。

## 4) 为什么仍属于 Route A

- 仅做 label/wording/mapping 一致性收敛；
- 不新增状态，不新增对象，不新增控制入口；
- 不改变既有 write path 判定逻辑；
- 不引入 completion/execution 能力。

## 5) 明确边界（必须保持）

- terminology alignment != semantic expansion
- label normalization != workflow progression
- surfacing consistency != completion modeling
- regression hardening != generalized engine buildout

## 6) 本步最小交付物

1. 常量统一（跨 write/audit/read-model/UI 层）。
2. 跨层一致性测试加固。
3. Step 4 文档化边界与收敛说明。

## 7) 验收标准

- 同一 stage/outcome 在 write result、audit、read model、UI 命名一致。
- transition note 与 read-only notice 使用统一术语来源。
- UI 不出现 completed/executed/finalized/approved 误导语义。
- 不改变原有写入判定与 non-completion 边界。

## 8) 禁止误读条款

- 本步不是新状态机建设。
- 本步不是 completion surface 增强。
- 本步不是 execution control surface 增强。
- 本步不是 generalized workflow engine 建设。

