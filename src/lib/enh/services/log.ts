export const GetLog = async (): Promise<Array<{ version: string; date: string; contents: string[] }>> => {
  const response = await fetch(
    'https://raw.githubusercontent.com/1zilc/fishing-funds/master/CHANGELOG.md'
  );
  const text = await response.text();
  
  const logs: Array<{ version: string; date: string; contents: string[] }> = [];
  const lines = text.split('\n');
  
  let currentLog: { version: string; date: string; contents: string[] } | null = null;
  
  for (const line of lines) {
    if (line.startsWith('## [')) {
      if (currentLog) {
        logs.push(currentLog);
      }
      const match = line.match(/## \[(.*?)\].*?(\d{4}-\d{2}-\d{2})/);
      if (match) {
        currentLog = {
          version: match[1],
          date: match[2],
          contents: [],
        };
      }
    } else if (currentLog && line.startsWith('- ')) {
      currentLog.contents.push(line.substring(2));
    }
  }
  
  if (currentLog) {
    logs.push(currentLog);
  }
  
  return logs;
};