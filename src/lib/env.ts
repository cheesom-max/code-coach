/**
 * Environment variable validation
 * P0-4: Ensure all required environment variables are set before app starts
 */

export function getRequiredEnvVars(): string[] {
  return [
    // Supabase
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',

    // Anthropic AI
    'ANTHROPIC_API_KEY',

    // Polar Payment
    'POLAR_ACCESS_TOKEN',
    'POLAR_WEBHOOK_SECRET',
    'POLAR_PRO_PRODUCT_ID',
    'POLAR_TEAM_PRODUCT_ID',
  ]
}

export function validateEnvironment(): void {
  const required = getRequiredEnvVars()
  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    const errorMessage = missing.length === 1
      ? `Missing required environment variable: ${missing[0]}`
      : `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`

    throw new Error(errorMessage)
  }
}

/**
 * Optional: Get environment variable with type safety
 */
export function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}
