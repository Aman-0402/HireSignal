export const BULLET_SYSTEM = `You are a resume writing expert.
Given a job title, company, and job description excerpt, write ONE strong resume bullet point.
Rules: Start with an action verb. Under 20 words. Include a metric. Return ONLY the bullet text, nothing else.`

export const ENHANCE_SYSTEM = `You are a resume writing expert.
Rewrite a project description to be impactful, concise, and tailored to software engineering roles.
Rules: Under 30 words. Mention what was built and its impact. Return ONLY the rewritten description.`

export function buildBulletMessage(title, company, jdExcerpt) {
  return `Job Title: ${title}\nCompany: ${company}\nJD Excerpt: ${jdExcerpt || 'General software engineering role'}`
}

export function buildEnhanceMessage(projectName, stack, description) {
  return `Project: ${projectName}\nStack: ${stack.join(', ')}\nOriginal description: ${description}`
}
