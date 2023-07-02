export default function getCoverImageUrl(cover: string | undefined) {
  if (cover == undefined || cover.length == 0) {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  } else if (cover.startsWith('http://') || cover.startsWith('https://')) {
    return cover;
  } else {
    return import.meta.env.COVER_BASE_URL + cover;
  }
}
