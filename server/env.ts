export function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/(?:\\n)+$/g, '').trim();
  return cleaned || undefined;
}

export function getEnvValue(name: string): string | undefined {
  return cleanEnvValue(process.env[name]);
}
