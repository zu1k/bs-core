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
  English: 'blue',
  Chinese: 'red',
  French: 'blue',
  Italian: 'green'
};

export default function getColorScheme(key: string) {
  if (key in extensionColorSchemes) {
    return extensionColorSchemes[key];
  } else if (key in languageColorSchemes) {
    return languageColorSchemes[key];
  } else {
    return colorSchemes[key.length % colorSchemes.length];
  }
}
