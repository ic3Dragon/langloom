const fs = require('fs');

async function processLocalData(localFilePath) {
    try {
        const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
        return localData;
    } catch (error) {
        console.error(`Error processing local data: ${error.message}`);
        return { error: error.message };
    }
}

async function processLocalKeys(localFilePath) {
    try {
        const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
        const localKeys = [];
        await traverse(localData, [], localKeys);
        return { keys: localKeys };
    } catch (error) {
        console.error(`Error processing local keys: ${error.message}`);
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