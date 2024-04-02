const fs = require('fs');
const colors = require('colors');

const validateFile = (filePath) => {
  if (!filePath.match(/.json$/i)) {
    console.log(colors.red(`Can only import json: ${filePath}`));
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.log(colors.red(`File was not found: ${filePath}`));
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
      console.error(colors.red(`Error processing local data: ${error.message}`));
        return { error: error.message };
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
      console.error(colors.red(`Error processing local keys: ${error.message}`));
        return { error: error.message };
    }
}

async function traverse(data, tempKeys, resultKeys) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const currentKeys = [...tempKeys, key];
            if (typeof data[key] === 'object') {
                await traverse(data[key], currentKeys, resultKeys);
            } else {
                resultKeys.push(currentKeys.join('.'));
            }
        }
    }
}
module.exports = { processLocalData, processLocalKeys, traverse };