const axios = require('axios');
const { traverse } = require('./file');

const path = 'https://api.i18nexus.com/project_resources';
const I18NEXUS_API_KEY = process.env.I18NEXUS_API_KEY;
const I18NEXUS_API_BEARER = process.env.I18NEXUS_API_BEARER; // OBS: node is not running so there is no process going, move these to be asked for at start?

async function fetchRemoteKeys(namespace, language) {
  try {
    const keys = [];
    const { data } = await axios.get(`${path}/translations/${language}/${namespace}.json?api_key=${I18NEXUS_API_KEY}`);
    await traverse(data, [], keys)
    return keys;
  } catch (error) {
    console.error(`Error fetching remote keys: ${error.message}`);
    return [];
  }
}

async function importKeys(namespace, language, fileData) {
  const body = {
    namespace: namespace,
    overwrite: true,
    languages: {
      [language]: fileData
    }
  };

  try {
    await axios.post(`${path}/import.json?api_key=${I18NEXUS_API_KEY}`, body, {
      headers: {
        'Authorization': `Bearer ${I18NEXUS_API_BEARER}`
      }
    });
    console.log('Import successful 🎉 \n');
  } catch (error) {
    console.error(`Error importing local file: ${error.message}`);
  }
}

async function removeUnusedKeys(namespace, localKeys, language) {
  const result = { removed: 0, failed: 0 };

  const remoteKeys = await fetchRemoteKeys(namespace, language);

  if (remoteKeys.length < 1) {
    return;
  }

  for (const key of remoteKeys) {
    if (!localKeys.includes(key)) {
      const data = {
        id: {
          key: key,
          namespace: namespace
        }
      };

      try {
        await axios.delete(`${path}/base_strings.json?api_key=${I18NEXUS_API_KEY}`, { data }, {
          headers: {
            'Authorization': `Bearer ${I18NEXUS_API_BEARER}`
          }
        });

        result.removed++;
      } catch (error) {
        console.log('Failed to remove: ', { key, reason: error.message })
        result.failed++;
      }
    }
  }
  return result;
}
module.exports = { importKeys, removeUnusedKeys, fetchRemoteKeys };