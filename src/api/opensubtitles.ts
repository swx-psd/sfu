import pako from 'pako';
import JSZip from 'jszip';
import jschardet from 'jschardet';
import iconv from 'iconv-lite';
import { tmdbClient } from './client';
import { Buffer } from 'buffer';

const USER_AGENT = 'VLSub 0.10.2';

const decodeBuffer = (input: Buffer | Uint8Array | string): string => {
    try {
        let buf: Buffer;

        if (Buffer.isBuffer(input)) {
            buf = input;
        } else if (typeof input === 'string') {
            buf = Buffer.from(input, 'binary');
        } else {
            // Uint8Array or ArrayBuffer
            buf = Buffer.from(input);
        }

        const detected = jschardet.detect(buf);
        let encoding = detected.encoding || 'utf-8';

        console.log(`[OpenSubtitles] Detected encoding: ${encoding} (confidence: ${detected.confidence})`);

        if (encoding.toLowerCase() === 'ascii') {
            encoding = 'utf-8';
        }

        // Mapping for common Turkish misinterpretations
        // If confidence is low and it looks like latin1/windows-1252, it might be 1254 (Turkish)
        if (encoding.toLowerCase() === 'windows-1252' && detected.confidence < 0.9) {
            // We can log this potential mismatch
            console.log('[OpenSubtitles] Low confidence Windows-1252 detected, might be Turkish (Windows-1254).');
        }

        return iconv.decode(buf, encoding);
    } catch (error) {
        console.error('[OpenSubtitles] Decoding error:', error);
        // Last resort fallback
        if (typeof input === 'string') return input;
        return new TextDecoder('utf-8').decode(input as Uint8Array);
    }
};

export const getImdbIdFromTmdb = async (tmdbId: number, mediaType: 'movie' | 'tv'): Promise<string | null> => {
    try {
        const response = await tmdbClient.get(`/${mediaType}/${tmdbId}/external_ids`);
        return response.data.imdb_id;
    } catch (error) {
        console.error('[OpenSubtitles] Failed to get IMDB ID:', error);
        return null;
    }
};

export interface SubtitleTrack {
    id: string;
    language: string;
    languageCode: string;
    url: string; // ZipDownloadLink
    filename: string;
}

const LANGUAGES = [
    { name: 'Turkish', id: 'tur' },
    { name: 'English', id: 'eng' },
];

export const searchSubtitles = async (imdbId: string, season?: number, episode?: number): Promise<SubtitleTrack[]> => {
    try {
        const cleanImdbId = imdbId.replace('tt', '');
        const results: SubtitleTrack[] = [];

        for (const lang of LANGUAGES) {
            const url = `https://rest.opensubtitles.org/search/imdbid-${cleanImdbId}/sublanguageid-${lang.id}`;
            console.log(`[OpenSubtitles] Searching: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'x-user-agent': USER_AGENT
                }
            });

            if (!response.ok) continue;

            const data = await response.json();

            for (const item of data) {
                // Filter TV Shows
                if (season && episode) {
                    if (Number(item.SeriesSeason) !== season || Number(item.SeriesEpisode) !== episode) {
                        continue;
                    }
                }

                if (item.ZipDownloadLink) {
                    results.push({
                        id: item.IDSubtitle,
                        language: lang.name,
                        languageCode: lang.id,
                        url: item.ZipDownloadLink,
                        filename: item.SubFileName
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error('[OpenSubtitles] Search error:', error);
        return [];
    }
};

export const downloadSubtitle = async (url: string): Promise<string | null> => {
    try {
        console.log(`[OpenSubtitles] Downloading: ${url}`);
        const response = await fetch(url, {
            headers: {
                'x-user-agent': USER_AGENT
            }
        });

        if (!response.ok) {
            console.error(`[OpenSubtitles] Download failed with status: ${response.status}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Check for GZIP magic bytes (0x1f, 0x8b)
        if (uint8Array.length > 2 && uint8Array[0] === 0x1f && uint8Array[1] === 0x8b) {
            try {
                // pako returns Uint8Array (default) or string. We want Uint8Array for decoding.
                const decompressed = pako.inflate(uint8Array);
                return decodeBuffer(decompressed);
            } catch (e) {
                console.error('[OpenSubtitles] Gzip detected but decompression failed:', e);
            }
        }

        // Check for ZIP magic bytes (PK - 0x50 0x4B)
        if (uint8Array.length > 2 && uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
            try {
                console.log('[OpenSubtitles] ZIP file detected. Extracting...');
                const zip = await JSZip.loadAsync(arrayBuffer);

                // Find first .srt file
                const srtFile = Object.keys(zip.files).find(filename => filename.endsWith('.srt'));

                if (srtFile) {
                    console.log(`[OpenSubtitles] Found SRT in zip: ${srtFile}`);
                    // Use 'uint8array' to get raw bytes
                    const contentValues = await zip.files[srtFile].async('uint8array');
                    return decodeBuffer(contentValues);
                } else {
                    console.warn('[OpenSubtitles] No SRT file found inside ZIP.');
                    const firstFile = Object.keys(zip.files)[0];
                    if (firstFile) {
                        console.log(`[OpenSubtitles] Trying first file: ${firstFile}`);
                        const contentValues = await zip.files[firstFile].async('uint8array');
                        return decodeBuffer(contentValues);
                    }
                }
            } catch (e) {
                console.error('[OpenSubtitles] ZIP extraction failed:', e);
            }
        }

        // Try as plain text (detected encoding)
        return decodeBuffer(uint8Array);

    } catch (error) {
        console.error('[OpenSubtitles] Download error:', error);
        return null;
    }
};
