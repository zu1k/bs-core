export const white_pic =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const zlib_cover_prefix = 'zlib://';

export function getCoverImageUrl(cover: string | undefined) {
  if (cover == undefined || cover.length == 0) {
    return white_pic;
  } else if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover;
  } else {
    if (cover.startsWith(zlib_cover_prefix)) {
      return cover.replace(zlib_cover_prefix, import.meta.env.VITE_COVER_ZLIBRARY_URL);
    }
    return import.meta.env.VITE_COVER_LIBGEN_URL + cover;
  }
}

export function getMd5CoverImageUrl(md5: string | undefined) {
  if (md5 == undefined || md5.length != 32) {
    return white_pic;
  } else {
    md5 = md5.toLowerCase();
    let path = '/covers/books/';
    for (let i = 0; i < 3; i++) {
      path += md5.substring(i * 2, i * 2 + 2) + '/';
    }
    path += md5 + '.jpg';
    return import.meta.env.VITE_COVER_ZLIBRARY_URL + path;
  }
}
