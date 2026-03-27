export type ScriptTemplate = {
  id: string;
  name: string;
  structure: string[];
  best_for: string[];
};

export const scriptTemplates: ScriptTemplate[] = [
  { id: "template_a", name: "3秒警告型", structure: ["直接警告", "问题画面", "原因", "正确做法", "CTA"], best_for: ["mistakes_to_avoid", "common_issues"] },
  { id: "template_b", name: "homeowner避坑型", structure: ["屋主常错", "错误做法", "后果", "正确建议", "收藏提醒"], best_for: ["mistakes_to_avoid"] },
  { id: "template_c", name: "before/after", structure: ["before", "过程", "after", "总结", "soft CTA"], best_for: ["real_case"] },
  { id: "template_d", name: "FAQ快答型", structure: ["提问", "直接回答", "补充解释", "注意事项", "CTA"], best_for: ["common_issues", "trust_knowledge"] },
  { id: "template_e", name: "真实案例型", structure: ["客户以为", "实际问题", "判断", "处理", "提醒"], best_for: ["real_case"] },
  { id: "template_f", name: "报价教育型", structure: ["便宜迷思", "价差原因", "便宜风险", "比较逻辑", "CTA"], best_for: ["quote_education"] },
  { id: "template_g", name: "myth-busting", structure: ["误区", "为什么错", "正确理解", "判断方法", "CTA"], best_for: ["mistakes_to_avoid", "trust_knowledge"] },
  { id: "template_h", name: "local trust", structure: ["现场感", "屋主问题", "经验判断", "温和提醒", "品牌信任收尾"], best_for: ["brand_trust", "local_reminder"] },
  { id: "template_i", name: "Top3 tips", structure: ["场景", "Tip1", "Tip2", "Tip3", "执行提醒"], best_for: ["maintenance"] },
  { id: "template_j", name: "Problem-Cause-Fix", structure: ["问题", "根因", "解决步骤", "结果", "CTA"], best_for: ["common_issues", "real_case"] },
  { id: "template_k", name: "Day on Job", structure: ["今日任务", "现场片段", "判断逻辑", "收尾", "互动提问"], best_for: ["brand_trust"] },
  { id: "template_l", name: "Quote red flags", structure: ["常见误判", "关键条目", "风险", "怎么问", "CTA"], best_for: ["quote_education"] },
  { id: "template_m", name: "Safety first", structure: ["风险提示", "立即动作", "不要做", "何时转人工", "CTA"], best_for: ["mistakes_to_avoid", "local_reminder"] },
  { id: "template_n", name: "Tool explainer", structure: ["工具展示", "能解决什么", "不能解决什么", "现场示例", "CTA"], best_for: ["trust_knowledge"] },
  { id: "template_o", name: "Seasonal reminder", structure: ["季节背景", "风险点", "3步检查", "常见误区", "CTA"], best_for: ["maintenance", "local_reminder"] },
  { id: "template_p", name: "Material compare", structure: ["材料A/B", "耐久", "成本", "适配场景", "CTA"], best_for: ["trust_knowledge"] },
  { id: "template_q", name: "DM bridge", structure: ["问题识别", "快速建议", "收集信息", "是否紧急", "DM引导"], best_for: ["common_issues"] },
  { id: "template_r", name: "Comment response clip", structure: ["读评论", "直接答", "补充", "边界提醒", "CTA"], best_for: ["brand_trust", "common_issues"] },
  { id: "template_s", name: "My home too", structure: ["共鸣开头", "怎么判断", "先做什么", "何时叫专业", "CTA"], best_for: ["common_issues", "maintenance"] },
  { id: "template_t", name: "No scare tactic", structure: ["真实风险级别", "检查方法", "时间窗口", "处理方案", "CTA"], best_for: ["brand_trust"] },
  { id: "template_u", name: "First-screen clarity", structure: ["第一屏直接问题", "后果", "判断", "处理", "CTA"], best_for: ["all"] },
  { id: "template_v", name: "Bilingual caption", structure: ["EN hook", "ZH key point", "现场片段", "EN/ZH CTA"], best_for: ["all"] },
  { id: "template_w", name: "Compliance caution", structure: ["不要断言法规", "建议确认", "常见误区", "安全建议", "CTA"], best_for: ["gas_line", "water_heater"] },
  { id: "template_x", name: "Emergency triage", structure: ["症状", "紧急级别", "立刻动作", "禁止动作", "联系建议"], best_for: ["plumbing_emergency"] },
  { id: "template_y", name: "Price expectation", structure: ["影响价格因素", "典型范围", "变高原因", "如何降低返工", "CTA"], best_for: ["quote_education"] },
  { id: "template_z", name: "Lead qualification", structure: ["确认地区", "确认症状", "确认紧急", "请求照片", "预约下一步"], best_for: ["interaction"] },
  { id: "template_aa", name: "Before you buy", structure: ["购买前", "必须确认", "常见踩坑", "替代选择", "CTA"], best_for: ["water_heater", "maintenance"] },
  { id: "template_ab", name: "Service boundary", structure: ["能远程说什么", "不能承诺什么", "安全边界", "转人工", "CTA"], best_for: ["interaction"] },
  { id: "template_ac", name: "Root cause lens", structure: ["表象", "根因", "验证方法", "修复路径", "CTA"], best_for: ["real_case", "trust_knowledge"] },
  { id: "template_ad", name: "Call-to-action soft", structure: ["先帮助", "可选下一步1", "可选下一步2", "服务范围", "结尾"], best_for: ["all"] },
];
