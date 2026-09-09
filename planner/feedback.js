export const feedbackRules = [
  "工具回傳 error 時，不得把它當成正常資料。",
  "認證、參數與缺少設定屬於永久錯誤，不應盲目重試。",
  "暫時性錯誤最多重試一次，避免無限迴圈。",
  "失敗後要保留錯誤與 fallback，讓使用者知道限制。",
];

const PERMANENT_ERROR_PATTERNS = [
  /\b40[0134]\b/u,
  /api[ _-]?key/iu,
  /認證|授權|參數|不存在|未允許/u,
  /invalid|unauthorized|forbidden|not found/i,
];

export async function executeWithFeedback({
  step,
  args,
  handler,
  maxRetries = 1,
  onFeedback = () => {},
}) {
  const retryLimit = Math.max(0, Math.min(maxRetries, 1));

  for (let attempt = 1; attempt <= retryLimit + 1; attempt += 1) {
    try {
      const output = await handler(args);
      assertUsableResult(output);
      return { status: "completed", output, attempts: attempt };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable = isRetryableError(message);
      const willRetry = retryable && attempt <= retryLimit;

      onFeedback({ step, attempt, error: message, willRetry });
      if (!willRetry) {
        return { status: "failed", error: message, attempts: attempt };
      }
    }
  }

  throw new Error("不可達的 feedback 狀態");
}

export function assertUsableResult(output) {
  if (output && typeof output === "object" && output.error) {
    throw new Error(String(output.error));
  }
  return output;
}

export function isRetryableError(message) {
  return !PERMANENT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}
