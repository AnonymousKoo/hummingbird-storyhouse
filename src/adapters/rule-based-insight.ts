import type { PerformanceObservation } from '../domain/analytics.js';
import type { GeneratedInsight, InsightGenerator } from '../domain/learning.js';

export class RuleBasedInsightGenerator implements InsightGenerator {
  generate(observations: readonly PerformanceObservation[]): Promise<GeneratedInsight> {
    const metrics = observations.flatMap((observation) => observation.metrics);
    const views = metrics.filter((metric) => metric.name === 'views').reduce((sum, metric) => sum + metric.value, 0);
    const completions = metrics.filter((metric) => metric.name === 'completion_rate');
    const completionRate = completions.length === 0 ? undefined : completions.reduce((sum, metric) => sum + metric.value, 0) / completions.length;
    const finding = completionRate === undefined
      ? `${observations.length} observation${observations.length === 1 ? '' : 's'} recorded ${Math.round(views).toLocaleString('en-US')} views.`
      : `Completion averaged ${Math.round(completionRate * 100)}% across ${observations.length} observation${observations.length === 1 ? '' : 's'}, with ${Math.round(views).toLocaleString('en-US')} views.`;
    const recommendation = completionRate !== undefined && completionRate >= 0.5
      ? 'Repeat the strongest format and test a new opening hook.'
      : 'Tighten the opening and test a shorter edit before expanding distribution.';
    return Promise.resolve({ finding, recommendation, confidence: Math.min(0.9, 0.58 + observations.length * 0.08) });
  }
}
