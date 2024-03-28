const axios = require('axios');
const fetch = require('node-fetch');

const { traverse } = require('./file');

const { I18NEXUS_API_KEY, I18NEXUS_API_BEARER } = require('../env');

const path = 'https://api.i18nexus.com/project_resources';

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
      const body = {
        id: {
          key: key,
          namespace: namespace
        }
      };

      try {
        await fetch(`${path}/base_strings.json?api_key=${I18NEXUS_API_KEY}`, {
          method: 'delete',
          body: {
            id: {
              key: "good-bye-now",
              namespace: "common"
            }
          },
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${I18NEXUS_API_BEARER}` }
        }).then(res => console.log(res));
        // await axios.delete(`${path}/base_strings.json?api_key=${I18NEXUS_API_KEY}`, {
        //   headers: {
        //     'Authorization': `Bearer ${I18NEXUS_API_BEARER}`
        //   }
        // });

        result.removed++;
        console.info(`Deleted key "${key}"`)
      } catch (error) {
        console.error(`Failed to remove key "${key}" `, { error: error.message })
        result.failed++;
      }
    }
  }
  return result;
}
module.exports = { importKeys, removeUnusedKeys, fetchRemoteKeys };