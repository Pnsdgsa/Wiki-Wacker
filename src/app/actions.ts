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
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('fandom.com')) {
      return { success: false, error: 'Invalid URL. Hostname must be a fandom.com domain.' };
    }
  } catch (error) {
    return { success: false, error: 'Invalid URL format. Please enter a full URL including https://' };
  }

  const pageName = url.includes('/wiki/') ? url.substring(url.lastIndexOf('/wiki/') + 6) : null;
  if (!pageName) {
    return { success: false, error: 'Could not determine page name from URL. Make sure it contains "/wiki/".' };
  }

  const apiUrl = `${parsedUrl.origin}/api.php?action=parse&page=${encodeURIComponent(pageName)}&format=json&prop=text&formatversion=2`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        // A User-Agent is required by the MediaWiki API policy.
        'User-Agent': 'WikiWacker/1.0 (https://studio.firebase.google.com) using Next.js fetch'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { success: false, error: `Failed to fetch from API. Server responded with status: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
        return { success: false, error: `API Error: ${data.error.info}. Please check the page URL.` };
    }

    if (!data.parse || !data.parse.text) {
        return { success: false, error: 'Could not find content in the API response.' };
    }

    let content = data.parse.text;
    const pageTitle = data.parse.title;

    // Handle lazy-loaded images from Fandom
    content = content.replace(/<img[^>]*data-src="([^"]+)"[^>]*>/g, (match: string, dataSrc: string) => {
        let newImgTag = match;
        // Replace src with data-src
        newImgTag = newImgTag.replace(/src="[^"]*"/, `src="${dataSrc}"`);
        // Remove lazyload class
        newImgTag = newImgTag.replace(/\s*class="[^"]*lazyload[^"]*"/i, (classMatch: string) => {
            const newClass = classMatch.replace(/lazyload/i, '').replace(/\s{2,}/, ' ').trim();
            return newClass === 'class=""' ? '' : ` class="${newClass}"`;
        });
        // Remove data attributes
        newImgTag = newImgTag.replace(/data-src="[^"]*"/, '');
        newImgTag = newImgTag.replace(/data-image-name="[^"]*"/, '');
        newImgTag = newImgTag.replace(/data-image-key="[^"]*"/, '');
        return newImgTag;
    });

    // Make relative links absolute
    const baseUrl = parsedUrl.origin;
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
