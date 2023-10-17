const colorSchemes = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
  'gray'
];

const extensionColorSchemes: { [key: string]: string } = {
  epub: 'orange',
  azw3: 'purple',
  mobi: 'gray',
  pdf: 'yellow',
  txt: 'green',
  djvu: 'pink',
  htm: 'teal'
};

const languageColorSchemes: { [key: string]: string } = {
  english: 'blue',
  chinese: 'red',
  french: 'blue',
  italian: 'green'
};

export default function getColorScheme(key: string) {
  key = key.toLowerCase();
  if (key in extensionColorSchemes) {
    return extensionColorSchemes[key];
  } else if (key in languageColorSchemes) {
    return languageColorSchemes[key];
  } else {
    return colorSchemes[key.length % colorSchemes.length];
  }
}
