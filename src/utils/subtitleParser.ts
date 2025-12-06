export interface SubtitleItem {
    id: number;
    start: number; // saniye cinsinden
    end: number;
    text: string;
}

export const parseSRT = (srtContent: string): SubtitleItem[] => {
    const items: SubtitleItem[] = [];

    // Normalize line endings
    const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.trim().split('\n\n');

    blocks.forEach((block, index) => {
        const lines = block.split('\n');
        if (lines.length >= 3) {
            // Line 1: ID (ignored, we use index)
            // Line 2: Timecode
            const timecodeLine = lines[1];
            // Line 3+: Text
            const text = lines.slice(2).join('\n');

            const timeMatch = timecodeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);

            if (timeMatch) {
                const startSeconds =
                    parseInt(timeMatch[1]) * 3600 +
                    parseInt(timeMatch[2]) * 60 +
                    parseInt(timeMatch[3]) +
                    parseInt(timeMatch[4]) / 1000;

                const endSeconds =
                    parseInt(timeMatch[5]) * 3600 +
                    parseInt(timeMatch[6]) * 60 +
                    parseInt(timeMatch[7]) +
                    parseInt(timeMatch[8]) / 1000;

                items.push({
                    id: index,
                    start: startSeconds,
                    end: endSeconds,
                    text: text
                });
            }
        }
    });

    return items;
};
