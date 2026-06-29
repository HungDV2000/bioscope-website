let manifestPath = 'generated/locales-manifest.json'

export function getManifestPath(): string {
  return manifestPath
}

export function setManifestPath(filePath: string): void {
  manifestPath = filePath
}
