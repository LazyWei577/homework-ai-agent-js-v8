import { PlanSchema } from "./schema.js";

export async function runPlan(
  plan,
  { handlers, maxSteps = 6, onStep = () => {} } = {},
) {
  const validated = PlanSchema.parse(plan);
  const actionHandlers = handlers ?? (await loadDefaultActionHandlers());
  if (validated.steps.length > maxSteps) {
    throw new Error(`計畫超過 ${maxSteps} 步，拒絕執行`);
  }

  const observations = [];

  for (const step of validated.steps) {
    const handler = actionHandlers[step.action];
    if (!handler) {
      observations.push({
        ...step,
        status: "failed",
        error: `未允許的 action：${step.action}`,
      });
      break;
    }

    try {
      const args = parseArguments(step.arguments);
      onStep({ phase: "act", step, args });
      const output = await handler(args);
      if (output && typeof output === "object" && output.error) {
        throw new Error(String(output.error));
      }

      const observation = { ...step, status: "completed", output };
      observations.push(observation);
      onStep({ phase: "observe", observation });
    } catch (error) {
      const observation = {
        ...step,
        status: "failed",
        error: error.message,
      };
      observations.push(observation);
      onStep({ phase: "observe", observation });
      break;
    }
  }

  return {
    goal: validated.goal,
    status: observations.every((item) => item.status === "completed")
      ? "completed"
      : "failed",
    observations,
    fallback: validated.fallback,
  };
}

export async function loadDefaultActionHandlers() {
  const allTools = await import("../tools/index.js");
  return Object.fromEntries(
    Object.values(allTools).map((tool) => [tool.name, tool.fn]),
  );
}

function parseArguments(value) {
  const parsed = JSON.parse(value);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new TypeError("step.arguments 必須是 JSON object");
  }
  return parsed;
}
