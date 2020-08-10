import semver from "semver";

const releaseTypes: semver.ReleaseType[] = ["patch", "minor", "major"];

export function isValidBump(prevVersion: string, nextVersion: string): boolean {
  for (const type of releaseTypes) {
    if (semver.inc(prevVersion, type) === nextVersion) return true;
  }
  return false;
}
