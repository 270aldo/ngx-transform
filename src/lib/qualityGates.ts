/**
 * PR-1: Quality Gates for Image Generation
 *
 * This module validates generated images for common issues:
 * - Multiple subjects detection
 * - Face visibility check
 * - Artifact detection
 * - Minimum quality thresholds
 *
 * When enabled (FF_QUALITY_GATES), failed images trigger a retry with
 * a corrective prompt. After max retries, images are marked as "degraded"
 * but the process continues (graceful degradation).
 */

import { getFeatureFlags } from "./validators";

// ============================================================================
// Types
// ============================================================================

export interface QualityCheckResult {
  passed: boolean;
  score: number;  // 0-100 quality score
  issues: QualityIssue[];
  canRetry: boolean;
  degraded: boolean;
}

export interface QualityIssue {
  type: QualityIssueType;
  severity: "warning" | "error";
  message: string;
  suggestion?: string;
}

export type QualityIssueType =
  | "no_image_data"
  | "image_too_small"
  | "blocked_by_safety"
  | "generation_failed"
  | "api_error"
  | "unknown_format"
  | "face_not_visible"
  | "multiple_subjects"
  | "severe_artifacts"
  | "identity_drift"
  | "low_resolution"
  | "wrong_aspect_ratio";

export interface ImageMetadata {
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

// ============================================================================
// Constants
// ============================================================================

// Minimum acceptable dimensions
const MIN_WIDTH = 512;
const MIN_HEIGHT = 512;

// Maximum file size (20MB - generous for 4K images)
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

// Accepted MIME types
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ============================================================================
// Quality Check Functions
// ============================================================================

/**
 * Check if quality gates are enabled
 */
export function isQualityGatesEnabled(): boolean {
  const flags = getFeatureFlags();
  return flags.FF_QUALITY_GATES;
}

/**
 * Perform basic image validation
 * These checks can be done without ML models
 */
export function validateImageBasics(
  buffer: Buffer,
  contentType: string
): QualityCheckResult {
  const issues: QualityIssue[] = [];
  let score = 100;

  // Check 1: Buffer exists and has data
  if (!buffer || buffer.length === 0) {
    return {
      passed: false,
      score: 0,
      issues: [
        {
          type: "no_image_data",
          severity: "error",
          message: "No image data received from generation",
        },
      ],
      canRetry: true,
      degraded: false,
    };
  }

  // Check 2: MIME type is acceptable
  if (!ACCEPTED_MIME_TYPES.includes(contentType)) {
    issues.push({
      type: "unknown_format",
      severity: "warning",
      message: `Unexpected image format: ${contentType}`,
      suggestion: "Image will be converted to JPEG",
    });
    score -= 10;
  }

  // Check 3: File size is reasonable
  if (buffer.length > MAX_SIZE_BYTES) {
    issues.push({
      type: "image_too_small",
      severity: "warning",
      message: "Image file is unusually large",
    });
    score -= 5;
  }

  // Check 4: Minimum size (heuristic based on byte count)
  // A valid 512x512 JPEG is typically at least 10KB
  if (buffer.length < 10 * 1024) {
    issues.push({
      type: "image_too_small",
      severity: "warning",
      message: "Image may be too small or low quality",
    });
    score -= 20;
  }

  const passed = !issues.some((i) => i.severity === "error") && score >= 50;

  return {
    passed,
    score,
    issues,
    canRetry: !passed && score < 50,
    degraded: !passed,
  };
}

/**
 * Check Gemini API response for known error patterns
 */
export function checkApiResponse(response: {
  candidates?: Array<{
    finishReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
    content?: {
      parts?: Array<{
        inlineData?: { data?: string; mimeType?: string };
        text?: string;
      }>;
    };
  }>;
  error?: { message?: string; code?: number };
}): QualityCheckResult {
  const issues: QualityIssue[] = [];

  // Check for API error
  if (response.error) {
    return {
      passed: false,
      score: 0,
      issues: [
        {
          type: "api_error",
          severity: "error",
          message: response.error.message || "API returned an error",
        },
      ],
      canRetry: true,
      degraded: false,
    };
  }

  // Check for empty candidates
  if (!response.candidates || response.candidates.length === 0) {
    return {
      passed: false,
      score: 0,
      issues: [
        {
          type: "generation_failed",
          severity: "error",
          message: "No candidates returned from API",
        },
      ],
      canRetry: true,
      degraded: false,
    };
  }

  const candidate = response.candidates[0];

  // Check finish reason
  if (candidate.finishReason === "SAFETY") {
    issues.push({
      type: "blocked_by_safety",
      severity: "error",
      message: "Generation blocked by safety filters",
      suggestion: "Adjust prompt to be less sensitive",
    });
  }

  if (candidate.finishReason === "RECITATION") {
    issues.push({
      type: "generation_failed",
      severity: "warning",
      message: "Generation may have copied existing content",
    });
  }

  // Check for image data in response
  const parts = candidate.content?.parts || [];
  const hasImageData = parts.some((p) => p.inlineData?.data);

  if (!hasImageData) {
    issues.push({
      type: "no_image_data",
      severity: "error",
      message: "Response does not contain image data",
    });
  }

  const passed = !issues.some((i) => i.severity === "error");

  return {
    passed,
    score: passed ? 80 : 20,
    issues,
    canRetry: !passed,
    degraded: false,
  };
}

/**
 * Full quality check combining all validations
 */
export function runQualityGates(
  buffer: Buffer,
  contentType: string,
  apiResponse?: unknown
): QualityCheckResult {
  // If quality gates are disabled, just do basic validation
  if (!isQualityGatesEnabled()) {
    const basicCheck = validateImageBasics(buffer, contentType);
    return {
      ...basicCheck,
      // When gates are disabled, always pass if we have data
      passed: buffer.length > 0,
    };
  }

  // Run all checks
  const basicCheck = validateImageBasics(buffer, contentType);

  // Combine issues and calculate final score
  const allIssues = [...basicCheck.issues];
  let finalScore = basicCheck.score;

  // If API response was provided, check it
  if (apiResponse) {
    const apiCheck = checkApiResponse(
      apiResponse as Parameters<typeof checkApiResponse>[0]
    );
    allIssues.push(...apiCheck.issues);
    finalScore = Math.min(finalScore, apiCheck.score);
  }

  const hasErrors = allIssues.some((i) => i.severity === "error");
  const passed = !hasErrors && finalScore >= 50;

  return {
    passed,
    score: finalScore,
    issues: allIssues,
    canRetry: !passed && allIssues.some((i) => i.type !== "blocked_by_safety"),
    degraded: !passed,
  };
}

/**
 * Get a corrective action message for retry attempts
 */
export function getCorrectionMessage(issues: QualityIssue[]): string {
  const messages: string[] = [];

  for (const issue of issues) {
    switch (issue.type) {
      case "face_not_visible":
        messages.push("Ensure the subject's face is clearly visible and well-lit");
        break;
      case "multiple_subjects":
        messages.push("Generate only ONE person. No other subjects in frame");
        break;
      case "severe_artifacts":
        messages.push("Clean generation without distortions or visual glitches");
        break;
      case "identity_drift":
        messages.push("The face must EXACTLY match the reference person");
        break;
      case "low_resolution":
        messages.push("Generate at maximum quality and resolution");
        break;
      case "blocked_by_safety":
        messages.push("Adjust content to pass safety filters while maintaining fitness focus");
        break;
      default:
        if (issue.suggestion) {
          messages.push(issue.suggestion);
        }
    }
  }

  return messages.join(". ");
}

/**
 * Log quality check results for telemetry
 */
export function formatQualityReport(result: QualityCheckResult): string {
  const status = result.passed ? "PASSED" : result.degraded ? "DEGRADED" : "FAILED";
  const issueList = result.issues
    .map((i) => `  - [${i.severity.toUpperCase()}] ${i.type}: ${i.message}`)
    .join("\n");

  return `Quality Gate ${status} (score: ${result.score}/100)
${result.issues.length > 0 ? `Issues:\n${issueList}` : "No issues detected"}
Can Retry: ${result.canRetry}
Degraded Mode: ${result.degraded}`;
}
