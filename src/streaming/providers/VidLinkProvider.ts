import { IStreamingProvider, MovieInfo, StreamingLink, SearchResult } from '../types';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

/**
 * VidLink Provider Implementation
 * Based on vidlink.pro implementation from hula project
 */
export class VidLinkProvider implements IStreamingProvider {
  name = 'vidlink';
  domain = 'https://vidlink.pro';
  priority = 4;

  /**
   * Decrypt function from hula project
   */
  private decryptjs(encryptedData: string, password: string): any {
    try {
      const n = JSON.parse(encryptedData);

      const a = CryptoJS.enc.Hex.parse(n.s);
      const i = CryptoJS.enc.Hex.parse(n.iv);

      const s = CryptoJS.PBKDF2(password, a, {
        keySize: 8,
        iterations: 1000
      });

      const c = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(n.ct)
      });

      const decrypted = CryptoJS.AES.decrypt(c, s, {
        iv: i,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      }).toString(CryptoJS.enc.Utf8);

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[VidLink] Decryption failed:', error);
      return null;
    }
  }

  /**
   * Parse M3U8 content to extract quality levels
   */
  private parseM3U8(content: string): Array<{ file: string; quality: number }> {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const result: Array<{ file: string; quality: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
        const resolutionMatch = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
        if (resolutionMatch && lines[i + 1]) {
          const quality = parseInt(resolutionMatch[2]);
          let file = lines[i + 1];

          if (!file) continue;

          if (!file.includes('.m3u8')) {
            file += '.m3u8';
          }

          if (!file.includes('https://')) {
            continue;
          }

          result.push({
            file,
            quality
          });
        }
        i++; // Skip next line as it's the URL
      }
    }

    return result;
  }

  /**
   * Build embed URL based on movie info
   */
  private buildEmbedUrl(movieInfo: MovieInfo): string {
    if (movieInfo.type === 'tv') {
      return `${this.domain}/tv/${movieInfo.tmdb_id}/${movieInfo.season}/${movieInfo.episode}`;
    } else {
      return `${this.domain}/movie/${movieInfo.tmdb_id}`;
    }
  }

  /**
   * Search for content - VidLink uses direct TMDB ID approach
   */
  async search(movieInfo: MovieInfo): Promise<SearchResult[]> {
    return [{
      title: movieInfo.title,
      year: movieInfo.year,
      type: movieInfo.type,
      url: this.buildEmbedUrl(movieInfo),
      poster: ''
    }];
  }

  /**
   * Extract streaming links from VidLink
   */
  async extractLinks(movieInfo: MovieInfo, searchResult: SearchResult): Promise<StreamingLink[]> {
    try {
      // console.log(`[VidLink] Extracting links for: ${movieInfo.title}`);

      const embedUrl = this.buildEmbedUrl(movieInfo);
      // console.log(`[VidLink] Embed URL: ${embedUrl}`);

      // Use Desktop User-Agent for all platforms to ensure consistent behavior
      // The Android UA was getting different content or being blocked
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

      const headers = {
        'User-Agent': userAgent,
        'Referer': 'https://vidlink.pro/',
        'Origin': this.domain,
      };

      const headerDirect = {
        'User-Agent': userAgent,
        'Referer': 'https://vidlink.pro/',
        'Origin': 'https://vidlink.pro',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      // Step 1: Get embed page
      // Add cache buster to prevent getting cached mobile version
      const embedUrlWithCache = `${embedUrl}?t=${Date.now()}`;
      const embedResponse = await fetch(embedUrlWithCache, { headers });
      // console.log(`[VidLink] Embed response status: ${embedResponse.status}`);

      if (!embedResponse.ok) {
        throw new Error(`Failed to load embed page: ${embedResponse.status}`);
      }

      const embedHtml = await embedResponse.text();
      // console.log(`[VidLink] Embed HTML length: ${embedHtml.length}`);

      // Step 2: Extract script sources to find API endpoint
      // Match all script tags with src attribute
      const scriptMatches = embedHtml.match(/<script[^>]+src="([^"]+)"/g);
      if (!scriptMatches) {
        console.error('[VidLink] No scripts found');
        return [];
      }

      let keyEndpoint = '';

      // Step 3: Find API key endpoint from scripts
      // console.log(`[VidLink] Found ${scriptMatches.length} scripts to check`);

      for (const scriptMatch of scriptMatches) {
        const scriptSrc = scriptMatch.match(/src="([^"]+)"/)?.[1];
        if (scriptSrc) {
          // Handle relative URLs
          const fullScriptUrl = scriptSrc.startsWith('http')
            ? scriptSrc
            : scriptSrc.startsWith('//')
              ? `https:${scriptSrc}`
              : `${this.domain}${scriptSrc.startsWith('/') ? '' : '/'}${scriptSrc}`;

          try {
            // Skip non-js files or common 3rd party scripts to save time
            if (!fullScriptUrl.includes('.js') ||
              fullScriptUrl.includes('google') ||
              fullScriptUrl.includes('facebook') ||
              fullScriptUrl.includes('analytics')) {
              continue;
            }

            // Add cache buster to script URL
            const scriptUrlWithCache = fullScriptUrl.includes('?')
              ? `${fullScriptUrl}&t=${Date.now()}`
              : `${fullScriptUrl}?t=${Date.now()}`;

            // console.log(`[VidLink] Checking script: ${fullScriptUrl}`);
            const scriptResponse = await fetch(scriptUrlWithCache);
            // console.log(`[VidLink] Script response status: ${scriptResponse.status}`);
            const scriptText = await scriptResponse.text();

            const endpointMatch = scriptText.match(/\/api\/([A-z0-9]+)\/[A-z]+\//i);
            if (endpointMatch?.[1]) {
              keyEndpoint = endpointMatch[1];
              // console.log(`[VidLink] Found endpoint "${keyEndpoint}" in ${fullScriptUrl}`);
              break;
            }
          } catch (error) {
            // console.warn(`[VidLink] Failed to fetch script ${fullScriptUrl}:`, error);
          }
        }
      }

      if (!keyEndpoint) {
        console.warn('[VidLink] No API endpoint found via regex, falling back to "b"');
        keyEndpoint = 'b';
      }

      // console.log(`[VidLink] Found API endpoint: ${keyEndpoint}`);

      // Step 4: Get hash from aquariumtv service
      const hashResponse = await fetch(`https://aquariumtv.app/vlinktoken?id=${movieInfo.tmdb_id}`);
      const textHash = await hashResponse.text();

      if (!textHash) {
        console.error('[VidLink] No hash received');
        return [];
      }

      // console.log(`[VidLink] Got hash: ${textHash}`);

      // Step 5: Build API URL
      let apiUrl: string;
      if (movieInfo.type === 'tv') {
        apiUrl = `${this.domain}/api/${keyEndpoint}/tv/${textHash}/${movieInfo.season}/${movieInfo.episode}?multiLang=0`;
      } else {
        apiUrl = `${this.domain}/api/${keyEndpoint}/movie/${textHash}?multiLang=0`;
      }

      // console.log(`[VidLink] API URL: ${apiUrl}`);

      // Step 6: Get stream data
      const apiResponse = await fetch(apiUrl, { headers });
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const streamData = await apiResponse.json();
      // console.log(`[VidLink] Stream data received`);

      // Step 7: Extract streaming URLs
      let directUrl = streamData.stream?.playlist;
      let finalHeaders = { ...headerDirect };

      // Handle different response formats
      if (!directUrl && streamData.stream?.qualities) {
        const qualities = streamData.stream.qualities;
        const qualityArray: Array<{ file: string; quality: number }> = [];

        for (const [qualityKey, qualityData] of Object.entries(qualities)) {
          const q = Number(qualityKey);
          const data = qualityData as any;

          if (data?.url) {
            qualityArray.push({
              file: data.url,
              quality: q,
            });
          }
        }

        if (qualityArray.length > 0) {
          // Sort by quality descending
          qualityArray.sort((a, b) => b.quality - a.quality);

          return qualityArray.map(q => ({
            url: q.file,
            quality: `${q.quality}p`,
            provider: this.name,
            type: 'm3u8' as const,
            headers: finalHeaders
          }));
        }
      }

      if (!directUrl) {
        console.error('[VidLink] No direct URL found in response');
        return [];
      }

      // Step 8: Process special URL formats
      if (directUrl.includes('m3u8/{')) {
        const parts = directUrl.split('m3u8/{');
        if (parts.length > 1) {
          directUrl = parts[0] + 'm3u8';
          try {
            const headersPart = '{' + parts[1];
            const additionalHeaders = JSON.parse(headersPart);
            finalHeaders = {
              ...additionalHeaders,
              'User-Agent': finalHeaders['User-Agent']
            } as any;
          } catch (error) {
            console.warn('[VidLink] Failed to parse additional headers:', error);
          }
        }
      }

      // Handle proxy URLs
      if (directUrl.includes('/proxy/')) {
        try {
          const encodedPart = directUrl.split('/proxy/')[1];
          const [encodedUrl, queryParams] = encodedPart.split('?');

          const decodedUrl = decodeURIComponent(encodedUrl);
          let headersObj = {};
          let host = '';

          if (queryParams) {
            const params = queryParams.split('&');
            for (const param of params) {
              if (param.startsWith('headers=')) {
                const headersStr = param.substring('headers='.length);
                headersObj = JSON.parse(headersStr);
              } else if (param.startsWith('host=')) {
                host = decodeURIComponent(param.substring('host='.length));
              }
            }
          }

          if (host && Object.keys(headersObj).length > 0) {
            directUrl = host + '/' + decodedUrl;
            finalHeaders = {
              ...headersObj,
              'User-Agent': finalHeaders['User-Agent']
            } as any;
          }
        } catch (error) {
          console.warn('[VidLink] Failed to parse proxy URL:', error);
        }
      }

      // console.log(`[VidLink] Final URL: ${directUrl}`);

      // Step 9: Try to get M3U8 playlist for quality options
      try {
        const m3u8Response = await fetch(directUrl, { headers: finalHeaders });
        const m3u8Content = await m3u8Response.text();

        const m3u8Data = this.parseM3U8(m3u8Content);

        if (m3u8Data.length > 0) {
          // Sort by quality descending
          m3u8Data.sort((a, b) => b.quality - a.quality);

          return m3u8Data.map(q => ({
            url: q.file,
            quality: `${q.quality}p`,
            provider: this.name,
            type: 'm3u8' as const,
            headers: finalHeaders
          }));
        }
      } catch (error) {
        // console.warn('[VidLink] Failed to parse M3U8:', error);
      }

      // Return direct URL as fallback
      return [{
        url: directUrl,
        quality: '1080p',
        provider: this.name,
        type: 'm3u8' as const,
        headers: finalHeaders
      }];

    } catch (error) {
      console.error('[VidLink] Link extraction failed:', error);
      return [];
    }
  }

  /**
   * Validate if search result matches the requested content
   */
  validateContent(movieInfo: MovieInfo, searchResult: SearchResult): boolean {
    if (searchResult.type !== movieInfo.type) {
      return false;
    }

    const similarity = this.calculateSimilarity(
      movieInfo.title.toLowerCase(),
      searchResult.title.toLowerCase()
    );

    const yearDiff = Math.abs(searchResult.year - movieInfo.year);

    return similarity > 0.8 && yearDiff <= 1;
  }

  /**
   * Calculate string similarity
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

// Default export for provider registry
export default VidLinkProvider;