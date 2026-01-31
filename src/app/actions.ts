'use server';

type SuccessResponse = {
  success: true;
  content: string;
  title: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export async function getWikiContent(url: string): Promise<SuccessResponse | ErrorResponse> {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('fandom.com')) {
      return { success: false, error: 'Invalid URL. Hostname must be a fandom.com domain.' };
    }
  } catch (error) {
    return { success: false, error: 'Invalid URL format. Please enter a full URL including https://' };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      // Disable cache to get fresh content
      cache: 'no-store',
    });

    if (!response.ok) {
      return { success: false, error: `Failed to fetch page. Server responded with status: ${response.status}` };
    }

    const html = await response.text();

    // Extract page title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const pageTitle = titleMatch ? titleMatch[1].split(' | ')[0] : 'Content';

    const contentStartMarker = 'class="mw-parser-output">';
    const startIndex = html.indexOf(contentStartMarker);
    
    if (startIndex === -1) {
      return { success: false, error: 'Could not find main content area in the page. The page structure might be unsupported.' };
    }

    let content = html.substring(startIndex + contentStartMarker.length);
    
    const contentEndMarker = '<!-- NewPP limit report';
    const endIndex = content.indexOf(contentEndMarker);

    if (endIndex !== -1) {
      content = content.substring(0, endIndex);
    } else {
        // Fallback for different structures, e.g. finding the end of the parent div.
        // This is very brittle and might not work on all pages.
        let openDivs = 1;
        let currentIndex = 0;
        let searchContent = content;

        while(openDivs > 0 && currentIndex < searchContent.length) {
            const nextOpen = searchContent.indexOf('<div', currentIndex);
            const nextClose = searchContent.indexOf('</div>', currentIndex);

            if (nextClose === -1) break; // No more closing divs

            if (nextOpen !== -1 && nextOpen < nextClose) {
                openDivs++;
                currentIndex = nextOpen + 1;
            } else {
                openDivs--;
                currentIndex = nextClose + 1;
            }

            if (openDivs === 0) {
              content = content.substring(0, currentIndex + 5);
            }
        }
    }
    
    // Handle lazy-loaded images from Fandom
    content = content.replace(/<img[^>]*data-src="([^"]+)"[^>]*>/g, (match, dataSrc) => {
        let newImgTag = match;
        // Replace src with data-src
        newImgTag = newImgTag.replace(/src="[^"]*"/, `src="${dataSrc}"`);
        // Remove lazyload class
        newImgTag = newImgTag.replace(/\s*class="[^"]*lazyload[^"]*"/i, (classMatch) => {
            const newClass = classMatch.replace(/lazyload/i, '').replace(/\s{2,}/, ' ').trim();
            return newClass === 'class=""' ? '' : ` ${newClass}`;
        });
        // Remove data attributes
        newImgTag = newImgTag.replace(/data-src="[^"]*"/, '');
        newImgTag = newImgTag.replace(/data-image-name="[^"]*"/, '');
        newImgTag = newImgTag.replace(/data-image-key="[^"]*"/, '');
        return newImgTag;
    });

    // Make relative links absolute
    const baseUrl = new URL(url).origin;
    content = content.replace(/(href|src)="\/(?!\/)/g, `$1="${baseUrl}/`);

    return { success: true, content, title: pageTitle };

  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        return { success: false, error: `An unexpected error occurred: ${e.message}` };
    }
    return { success: false, error: 'An unknown error occurred while processing the page.' };
  }
}
