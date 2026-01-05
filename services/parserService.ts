import { Commit } from '../types';

// We encourage users to use: git log --date=short --pretty=format:"%h|%an|%ad|%s"
const DELIMITER = '|';

export const parseGitLog = (rawLog: string): Commit[] => {
  if (!rawLog) return [];

  const lines = rawLog.split('\n');
  const commits: Commit[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(DELIMITER);
    
    // Heuristic: If we have at least 4 parts, it matches our suggested format
    if (parts.length >= 4) {
      commits.push({
        hash: parts[0].trim(),
        author: parts[1].trim(),
        date: parts[2].trim(),
        message: parts.slice(3).join(DELIMITER).trim(), // Join back in case message contained delimiter
      });
    } else {
      // Fallback for standard format or other copy-pastes: treat whole line as message if it looks like text
      // This is "noisy" input tolerance
      const simpleHashMatch = line.match(/^([a-f0-9]{7,40})\s+(.*)/);
      if (simpleHashMatch) {
        commits.push({
          hash: simpleHashMatch[1],
          author: 'Unknown',
          date: 'Unknown',
          message: simpleHashMatch[2].trim(),
        });
      } else {
        // Just treat the line as a message for a generic commit
        commits.push({
          hash: '-----',
          author: 'Unknown',
          date: 'Unknown',
          message: line.trim(),
        });
      }
    }
  }

  return commits;
};