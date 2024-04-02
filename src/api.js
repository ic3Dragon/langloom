const axios = require('axios');
const fetch = require('node-fetch');
const colors = require('colors');

const { traverse } = require('./file');

const path = 'https://api.i18nexus.com/project_resources';

async function importKeys(namespace, language, fileData, apiKey, token) {
  console.info(colors.yellow('Importing local json file to i18nexus project...'));

  const body = {
    namespace: namespace,
    overwrite: true,
    languages: {
      [language]: fileData
    }
  };

  try {
    await axios.post(`${path}/import.json?api_key=${apiKey}`, body, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.info(colors.green('Import successful 🎉 \n'));
  } catch (error) {
    console.error(colors.red(`Error importing local file: ${error.message}`));
  }
}

async function fetchRemoteKeys(namespace, language, apiKey) {
  console.info(colors.yellow('Fetching project keys...'));
  try {
    const keys = [];
    const response = await fetch(`${path}/translations/${language}/${namespace}.json?api_key=${apiKey}`);
    const data = await response.json();
    await traverse(data, [], keys);
    return keys;
  } catch (error) {
    console.error(colors.red(`Error fetching remote keys: ${error.message}`));
    return [];
  }
}

async function removeUnusedKeys(namespace, localKeys, language, apiKey, token) {
  const remoteKeys = await fetchRemoteKeys(namespace, language, apiKey);
  // check if any remote key does not exist locally
  if (!remoteKeys.some((key) => !localKeys.includes(key))) {
    console.error(colors.green('Already up to date! No project keys to delete.'));
    process.exit(1);
  }

  console.info(colors.yellow('Removing removed local keys from i18nexus project...'));

  remoteKeys.forEach(async (key) => {
    if (!localKeys.includes(key)) {
      const id = {
        key: key,
        namespace: namespace
      };
      try {
        const response = await fetch(`${path}/base_strings.json?api_key=${apiKey}`, {
          method: 'DELETE',
          body: JSON.stringify({
            id: id
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status !== 204) {
          console.error(colors.red(`Failed to remove key "${key}" `, { error: error.message }))
        } else {
          console.info(colors.green(`Deleted key "${key}"`))
        }
      } catch (error) {
        console.error(colors.red(`Failed to remove key "${key}" `, { error: error.message }))
      }
    }
  })
}

const getProject = async (apiKey) => {
  const url = `${path}/project.json?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error(colors.red(`Error fetching project data: ${error.message}`));
    process.exit(1);
  }
};

async function fetchLatest(apiKey, confirmed) {
  console.info(colors.yellow('Fetching project translations...'));
  try {
    const res = await fetch(`${path}/translations.json?api_key=${apiKey}&confirmed=${confirmed}`);
    const translations = await res.json();
    return translations;
  } catch (error) {
    console.error(colors.red(`Error fetching translations: ${error.message}`));
    process.exit(1);
  }

}

module.exports = { importKeys, removeUnusedKeys, fetchRemoteKeys, fetchLatest, getProject };