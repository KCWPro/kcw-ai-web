import type { DailyExecution, ExecutionStatus, PostPlan } from "@/lib/contentOps/types";
import type { ExecutionTask } from "@/lib/contentOps/contentOpsStore";

const executionOrder: ExecutionStatus[] = ["planned", "filmed", "edited", "posted", "reviewed"];

export const seedPostPlans: PostPlan[] = [
  {
    id: "post_plan_01",
    planned_date: "2026-03-27",
    topic_id: "topic_real_case_1",
    script_id: "script_sample_5",
    target_platform: "tiktok",
    format: "before_after",
    status: "editing",
    review_status: "reviewed",
    reviewer_notes: "文案可用，发布前补充现场画面时间戳。",
    version_history: [
      {
        version_id: "post_plan_01_v1",
        created_at: "2026-03-26T10:10:00.000Z",
        updated_by: "ops_planner",
        status: "draft",
        notes: "排入今日执行池。",
        summary: "初始排期，等待审核。",
      },
      {
        version_id: "post_plan_01_v2",
        created_at: "2026-03-27T02:30:00.000Z",
        updated_by: "reviewer_kcw",
        status: "reviewed",
        notes: "结构通过，补充真实性细节。",
        summary: "可拍摄执行。",
      },
    ],
    publish_notes: "优先午间发布，评论区引导到 DM。",
    cycle_id: "cycle_2026_w13",
    target_metrics: { views: 3000, leads: 4 },
    actual_metrics: {},
    underperform_flag: false,
    underperform_reason_summary: "",
    next_test_plan: "同主题测试不同 hook",
  },
  {
    id: "post_plan_02",
    planned_date: "2026-03-27",
    topic_id: "topic_quote_education_2",
    script_id: "script_sample_9",
    target_platform: "instagram_reels",
    format: "quote_education",
    status: "planned",
    review_status: "draft",
    reviewer_notes: "等待审核，暂不允许跳过。",
    version_history: [
      {
        version_id: "post_plan_02_v1",
        created_at: "2026-03-27T00:20:00.000Z",
        updated_by: "ops_planner",
        status: "draft",
        notes: "待 reviewer 审核。",
        summary: "未审核不可执行。",
      },
    ],
    publish_notes: "需审核后安排拍摄。",
    cycle_id: "cycle_2026_w13",
    target_metrics: { views: 2200, leads: 3 },
    actual_metrics: {},
    underperform_flag: false,
    underperform_reason_summary: "",
    next_test_plan: "补充报价对比图",
  },
];

export function buildDailyExecutionBoard(postPlans: PostPlan[]): DailyExecution[] {
  return postPlans.map((plan) => {
    const status: ExecutionStatus =
      plan.status === "published"
        ? "posted"
        : plan.status === "editing"
          ? "edited"
          : plan.status === "filming"
            ? "filmed"
            : "planned";

    return {
      date: plan.planned_date,
      status: plan.review_status === "approved" && status === "posted" ? "reviewed" : status,
      comment_replied: plan.review_status !== "draft",
      dm_processed: plan.review_status === "approved" || plan.review_status === "reviewed",
      high_intent_lead_handoff: plan.review_status === "approved",
    };
  });
}

export function summarizeExecutionProgress(items: DailyExecution[]) {
  const stageCount = executionOrder.reduce(
    (acc, stage) => {
      acc[stage] = 0;
      return acc;
    },
    {} as Record<ExecutionStatus, number>,
  );

  items.forEach((item) => {
    stageCount[item.status] += 1;
  });

  const incomplete = items.filter((item) => item.status !== "reviewed").length;
  const stageRank = Object.entries(stageCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "planned";

  return {
    total: items.length,
    completed: items.filter((item) => item.status === "reviewed").length,
    incomplete,
    bottleneckStage: stageRank as ExecutionStatus,
    stageCount,
    commentReplied: items.filter((item) => item.comment_replied).length,
    dmProcessed: items.filter((item) => item.dm_processed).length,
    leadHandoff: items.filter((item) => item.high_intent_lead_handoff).length,
    todayPriorityAction:
      stageRank === "planned"
        ? "Complete filming for planned items first."
        : stageRank === "edited"
          ? "Clear editing queue and prepare publish package."
          : "Close review and interaction follow-ups.",
  };
}

export function buildExecutionBoardFromTasks(tasks: ExecutionTask[]): DailyExecution[] {
  return tasks.map((task) => ({
    date: task.date,
    status: task.status,
    comment_replied: task.comments_replied,
    dm_processed: task.dms_handled,
    high_intent_lead_handoff: task.hot_lead_escalated,
  }));
}
