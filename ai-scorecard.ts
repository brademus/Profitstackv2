// ============================================================
// VENTURESTACK - AI SCORECARD
// ============================================================
// Uses OpenAI to analyze venture performance and recommend
// scale, maintain, or kill decisions.
// ============================================================

import { VenturePnL, VentureScore } from '../types';
import { ENV } from '../env';

export async function generateScorecard(
  ventures: VenturePnL[]
): Promise<VentureScore[]> {
  if (ventures.length === 0) return [];

  const ventureData = ventures.map((v) => ({
    name: v.venture.name,
    type: v.venture.type,
    netProfit: v.netProfit,
    profitMargin: v.profitMargin,
    totalHours: v.totalHours,
    dollarPerHour: v.dollarPerHour,
    trend: v.trend,
    totalIncome: v.totalIncome,
    totalExpenses: v.totalExpenses,
  }));

  const prompt = `You are a business analyst for a multi-venture entrepreneur. Analyze these ventures and rate each as "scale" (double down), "maintain" (keep steady), or "kill" (wind down).

Consider: profit margin, $/hour efficiency, growth trend, and total income potential.

Ventures:
${JSON.stringify(ventureData, null, 2)}

Respond ONLY with valid JSON array, no markdown, no explanation outside the JSON:
[
  {
    "venture_name": "Name",
    "rating": "scale" | "maintain" | "kill",
    "profitMarginScore": 1-10,
    "dollarPerHourScore": 1-10,
    "growthScore": 1-10,
    "reasoning": "2-3 sentence explanation"
  }
]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const cleaned = content.replace(/```json|```/g, '').trim();
    const scores: VentureScore[] = JSON.parse(cleaned);

    // Map venture_ids from names
    return scores.map((score) => {
      const matchedVenture = ventures.find(
        (v) => v.venture.name === score.venture_name
      );
      return {
        ...score,
        venture_id: matchedVenture?.venture.id || '',
      };
    });
  } catch (error) {
    console.error('Scorecard generation failed:', error);
    // Fallback: generate basic scores from data
    return ventures.map((v) => ({
      venture_id: v.venture.id,
      venture_name: v.venture.name,
      rating:
        v.profitMargin > 0.3
          ? ('scale' as const)
          : v.profitMargin > 0
            ? ('maintain' as const)
            : ('kill' as const),
      profitMarginScore: Math.min(10, Math.max(1, Math.round(v.profitMargin * 10))),
      dollarPerHourScore: v.dollarPerHour
        ? Math.min(10, Math.max(1, Math.round(v.dollarPerHour / 10)))
        : 5,
      growthScore: Math.min(10, Math.max(1, 5 + Math.round(v.trend / 10))),
      reasoning: 'AI unavailable — score based on raw metrics.',
    }));
  }
}
