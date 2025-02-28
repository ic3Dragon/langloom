const fs = require('fs');
const colors = require('colors');

const validateFile = (filePath) => {
  if (!filePath.match(/.json$/i)) {
    console.error(colors.red(`Can only import json: ${filePath}\n`));
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(colors.red(`File was not found: ${filePath}\n`));
    process.exit(1);
  }
}

async function processLocalData(localFilePath) {
  validateFile(localFilePath);
  console.info(colors.yellow('Processing local json file...'));
  try {
    const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
    return localData;
  } catch (error) {
    console.error(colors.red(`Error processing local data: ${error.message}\n`));
    process.exit(1);
  }
}

async function processLocalKeys(localFilePath) {
  validateFile(localFilePath);
  console.info(colors.yellow('Processing local keys...'));
  try {
    const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
    const localKeys = [];
    await traverse(localData, [], localKeys);
    return { keys: localKeys };
  } catch (error) {
    console.error(colors.red(`Error processing local keys: ${error.message}\n`));
    process.exit(1);
  }
}

const cleanDirectory = path => {
  if (!fs.existsSync(path)) {
    return;
  }
  // as safety precaution, only delete folders that match regex for locale folders
  const regex = /^[a-z]{2}(-[A-Z]{2,4})?$/;

  const contents = fs.readdirSync(path);
  try {
    contents.forEach(name => {
      if (regex.test(name)) {
        fs.rmSync(`${path}/${name}`, { recursive: true });
      }
    });
  } catch (error) {
    console.error(colors.red(`Error clearing destination directory: ${error.message}\n`));
    process.exit(1);
  }
};

async function saveLocales(translations, library, destination, clear) {
  let path;
  if (!destination) {
    if (library === 'i18next') {
      const hasAppDir =
        fs.existsSync(`${process.cwd()}/app`) ||
        fs.existsSync(`${process.cwd()}/src/app`);

      const usingAppRouter =
        hasAppDir &&
        (fs.existsSync(`${process.cwd()}/.next`) ||
          fs.existsSync(`${process.cwd()}/next.config.js`) ||
          fs.existsSync(`${process.cwd()}/next.config.ts`));

      if (usingAppRouter) {
        path = `${process.cwd()}/locales`;
      } else {
        path = `${process.cwd()}/public/locales`;
      }
    } else {
      path = `${process.cwd()}/messages`;
    }
  } else {
    path = destination;
  }

  if (clear) {
    console.info(colors.yellow(`Clearing local directory: ${path}...`))
    cleanDirectory(path);
  }

  console.info(colors.yellow(`Saving transaltions to ${path}...`))

  try {
    for (let language in translations) {
      if (library === 'next-intl') {
        fs.mkdirSync(path, { recursive: true });

        fs.writeFileSync(
          `${path}/${language}.json`,
          JSON.stringify(translations[language])
        );
      } else {
        fs.mkdirSync(`${path}/${language}`, { recursive: true });

        for (let namespace in translations[language]) {
          const hasTranslations = Object.keys(translations[language][namespace]).length;
          if (hasTranslations) {
            fs.writeFileSync(
              `${path}/${language}/${namespace}.json`,
              JSON.stringify(translations[language][namespace])
            );
          }
        }
      }
    };
    console.info(colors.green('Translations downloaded successfully 🎉 \n'));
  } catch (error) {
    console.error(colors.red(`Error saving to file: ${error.message}\n`));
    process.exit(1);
  }
}

async function traverse(data, tempKeys, resultKeys) {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const currentKeys = [...tempKeys, key];
      if (typeof data[key] === 'object') {
        await traverse(data[key], currentKeys, resultKeys);
      } else {
        resultKeys.push(currentKeys.join('.'));
      }
    }
  }
}
module.exports = { processLocalData, processLocalKeys, saveLocales, traverse };