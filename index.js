'use strict';

const fs = require('fs');

const async = require('async');
const id3 = require('node-id3');
const args = require('yargs').argv;

if (!args.dir) {
  console.log('Usage: node index.js --dir <dirname>');
  process.exit();
}

const baseDirectoryPath = args.dir;
const properties = ['title', 'artist', 'albumArtist', 'genre', 'year', 'album', 'albumArt', 'trackNumber', 'diskNumber']

fs.readdir(baseDirectoryPath, (err, albums) => {
  if (err) {
    console.log(err);
    process.exit();
  }

  async.eachSeries(albums, (album, callback) => {
    const albumDirectoryPath = `${baseDirectoryPath}/${album}`;

    if (!fs.lstatSync(albumDirectoryPath).isDirectory()) {
      return callback(null);
    }

    console.log('___', albumDirectoryPath);
    const files = fs.readdirSync(albumDirectoryPath);
    const tracks = [];

    files.forEach((file) => {
      var testExp = /\d.*\.mp3$/;
      if (testExp.test(file)) {
        tracks.push(file);
      }
    });

    if (tracks.length === 0) {
      console.log('No tracks');
      return callback(null);
    }

    const firstTrackTags = id3.read(`${albumDirectoryPath}/${tracks[0]}`);

    validateTags(properties, tracks[0], firstTrackTags, null);

    if (tracks.length === 1) {
      return callback(null);
    }

    for (let i = 0; i < tracks.length; i++) {
      const currentTrackTags = id3.read(`${albumDirectoryPath}/${tracks[i]}`);
      validateTags(properties, tracks[i], firstTrackTags, currentTrackTags);
    }

    return callback(null);
  }, (err) => {
    if (err) {
      console.log(err);
      process.exit();
    }

    console.log('Done');
    process.exit();
  });
});

const validateTags = (properties, currentFileName, firstTrackTags, currentTrackTags) => {
  properties.forEach((property) => {

    try {
      switch (property) {

      case 'title':
        checkTitle(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'artist':
        checkArtist(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'albumArtist':
        checkAlbumArtist(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'genre':
        checkGenre(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'year':
        checkYear(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'album':
        checkAlbum(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'albumArt':
        checkAlbumArt(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'trackNumber':
        checkTrackNumber(currentFileName, firstTrackTags, currentTrackTags);
        break;

      case 'diskNumber':
        checkDiskNumber(currentFileName, firstTrackTags, currentTrackTags);
        break;

      default:
        console.log('Unknown property');
        break;
      }
    } catch (e) {
      console.log(e);
    }
  });
};

const isCorrectCase = (title) => {
  let result = true;
  const words = title.split(' ');

  const testExp = /[a-zA-Z]/;

  words.forEach((word) => {
    if (testExp.test(word[0]) && word[0] !== word[0].toUpperCase()) {
      result = false;
    }
  });

  return result;
};

const checkTitle = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.title) {
    console.log('###');
    console.log('Missing: ', 'title');
    console.log(checkTags.title, currentFileName);
    console.log('###');
  }

  if (!isCorrectCase(checkTags.title)) {
    console.log('###');
    console.log('Incorrect case: ', 'title');
    console.log(checkTags.title, currentFileName);
    console.log('###');
  }

  return;
};

const checkArtist = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.artist) {
    console.log('###');
    console.log('Missing: ', 'artist');
    console.log(checkTags.artist, currentFileName);
    console.log('###');
  }

  if (!isCorrectCase(checkTags.artist)) {
    console.log('###');
    console.log('Incorrect case: ', 'artist');
    console.log(checkTags.artist, currentFileName);
    console.log('###');
  }

  if (checkTags.artist.indexOf(',') >= 0) {
    console.log('###');
    console.log('Multiple values: ', 'artist');
    console.log(checkTags.artist, currentFileName);
    console.log('###');
  }

  return;
};

const checkAlbumArtist = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.raw['TPE2']) {
    console.log('###');
    console.log('Missing: ', 'album artist');
    console.log(checkTags.raw['TPE2'], currentFileName);
    console.log('###');
  }

  if (!isCorrectCase(checkTags.raw['TPE2'])) {
    console.log('###');
    console.log('Incorrect case: ', 'album artist');
    console.log(checkTags.raw['TPE2'], currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.raw['TPE2'] !== firstTrackTags.raw['TPE2']) {
      console.log('###');
      console.log('Mismatch: ', 'album artist');
      console.log(checkTags.raw['TPE2'], currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkGenre = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.genre) {
    console.log('###');
    console.log('Missing: ', 'genre');
    console.log(checkTags.genre, currentFileName);
    console.log('###');
  }

  if (!isCorrectCase(checkTags.genre)) {
    console.log('###');
    console.log('Incorrect case: ', 'genre');
    console.log(checkTags.genre, currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.genre !== firstTrackTags.genre) {
      console.log('###');
      console.log('Mismatch: ', 'genre');
      console.log(checkTags.genre, currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkYear = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.year) {
    console.log('###');
    console.log('Missing: ', 'year');
    console.log(checkTags.year, currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.year !== firstTrackTags.year) {
      console.log('###');
      console.log('Mismatch: ', 'year');
      console.log(checkTags.year, currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkAlbum = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.album) {
    console.log('###');
    console.log('Missing: ', 'album');
    console.log(checkTags.album, currentFileName);
    console.log('###');
  }

  if (!isCorrectCase(checkTags.album)) {
    console.log('###');
    console.log('Incorrect case: ', 'album');
    console.log(checkTags.album, currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.album !== firstTrackTags.album) {
      console.log('###');
      console.log('Mismatch: ', 'album');
      console.log(checkTags.album, currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkAlbumArt = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.image.imageBuffer.toString()) {
    console.log('###');
    console.log('Missing: ', 'album art');
    console.log(checkTags.image, currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.image.imageBuffer.toString() !== firstTrackTags.image.imageBuffer.toString()) {
      console.log('###');
      console.log('Mismatch: ', 'album art');
      console.log(checkTags.image, currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkTrackNumber = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.raw['TRCK'] || checkTags.raw['TRCK'].split('/').length < 2) {
    console.log('###');
    console.log('Missing: ', 'track number');
    console.log(checkTags.raw['TRCK'], currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.raw['TRCK'].split('/')[1] !== firstTrackTags.raw['TRCK'].split('/')[1]) {
      console.log('###');
      console.log('Mismatch: ', 'track number');
      console.log(checkTags.raw['TRCK'], currentFileName);
      console.log('###');
    }
  }

  return;
};

const checkDiskNumber = (currentFileName, firstTrackTags, currentTrackTags) => {
  if (!firstTrackTags) {
    console.log('First track tags not found, can not complete comparison!');
    return;
  }

  const checkTags = currentTrackTags ? currentTrackTags : firstTrackTags;

  if (!checkTags.raw['TPOS'] || checkTags.raw['TPOS'].split('/').length < 2) {
    console.log('###');
    console.log('Missing: ', 'disk number');
    console.log(checkTags.raw['TPOS'], currentFileName);
    console.log('###');
  }

  if (checkTags !== firstTrackTags) {
    if (checkTags.raw['TPOS'].split('/')[1] !== firstTrackTags.raw['TPOS'].split('/')[1]) {
      console.log('###');
      console.log('Mismatch: ', 'disk number');
      console.log(checkTags.raw['TPOS'], currentFileName);
      console.log('###');
    }
  }

  return;
};