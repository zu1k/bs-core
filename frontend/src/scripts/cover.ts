const zlib_cover_prefix = 'zlib://';

export default function getCoverImageUrl(cover: string | undefined) {
  if (cover == undefined || cover.length == 0) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  } else if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover;
  } else {
    if (cover.startsWith(zlib_cover_prefix)) {
      return cover.replace(zlib_cover_prefix, import.meta.env.VITE_COVER_ZLIBRARY_URL);
    }
    return import.meta.env.VITE_COVER_BASE_URL + cover;
  }
}
