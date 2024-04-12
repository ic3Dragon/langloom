const fetch = require('node-fetch');
const colors = require('colors');

const { traverse } = require('./file');

const path = 'https://api.i18nexus.com/project_resources';

async function importStrings(namespace, language, fileData, apiKey, token) {
  console.info(colors.yellow('Importing local json file to i18nexus project...'));

  const body = {
    namespace: namespace,
    overwrite: true,
    languages: {
      [language]: fileData
    }
  };

  const response = await fetch(`${path}/import.json?api_key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    console.error(colors.red(`Couldn't upload local file.\nError: ${response.status} (${response.statusText})\n`));
    process.exit(1);
  }
  console.info(colors.green('Import successful 🎉 \n'));
}

async function fetchRemoteKeys(namespace, language, apiKey) {
  console.info(colors.yellow('Fetching project keys...'));

  const keys = [];
  const response = await fetch(`${path}/translations/${language}/${namespace}.json?api_key=${apiKey}`);

  if (response.status !== 200) {
    console.error(colors.red(`Couldn't fetch project keys.\nError: ${response.status} (${response.statusText})\n`));
    process.exit(1);
  }

  const data = await response.json();
  await traverse(data, [], keys);
  return keys;
}

async function removeUnusedKeys(namespace, localKeys, language, apiKey, token) {
  const remoteKeys = await fetchRemoteKeys(namespace, language, apiKey);
  // check if any remote key does not exist locally
  if (!remoteKeys.some((key) => !localKeys.includes(key))) {
    console.error(colors.green('Already up to date! No project keys to delete.\n'));
    process.exit(1);
  }

  console.info(colors.yellow('Removing removed local keys from i18nexus project...'));

  remoteKeys.forEach(async (key) => {
    if (!localKeys.includes(key)) {
      const id = {
        key: key,
        namespace: namespace
      };

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
    }
  })
}

const getProject = async (apiKey) => {
  const response = await fetch(`${path}/project.json?api_key=${apiKey}`);

  if (response.status !== 200) {
    console.error(colors.red(`Couldn't fetch project data.\nError: ${response.status} (${response.statusText})\n`));
    process.exit(1);
  }
  return response.json();
};

async function fetchLatest(apiKey, confirmed, namespaces) {
  console.info(colors.yellow('Fetching project translations...'));
  const response = await fetch(`${path}/translations.json?api_key=${apiKey}&confirmed=${confirmed}`);
  if (response.status !== 200) {
    console.error(colors.red(`Couldn't fetch translations.\nError: ${response.status} (${response.statusText})\n`));
    process.exit(1);
  }
  const translations = await response.json();

  let filteredByNamespaces = {}

  if (namespaces.length > 0) {
    for (let language in translations) {
      filteredByNamespaces[language] = {};

      namespaces.forEach((ns) => {
        if (translations[language][ns] === undefined) {
          console.error(colors.red(`Sorry, the namespace ${ns} does not exist.`));
          process.exit(1);
        }
      });

      for (let namespace in translations[language]) {
        namespaces.forEach(chosenNS => {
          if (chosenNS.toLowerCase() === namespace) {
            filteredByNamespaces[language][namespace] = translations[language][namespace];
          }
        })
      }
    }
  } else {
    filteredByNamespaces = { ...translations };
  }

  return filteredByNamespaces;
}

async function updateString(stringToUpdate, apiKey, token) {
  const response = await fetch(`${path}/base_strings.json?api_key=${apiKey}`, {
    method: 'PATCH',
    body: JSON.stringify(stringToUpdate),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status !== 200) {
    console.error(colors.red(`Couldn't update string "${stringToUpdate.id.key}".\nError: ${response.status} (${response.statusText})`));
    process.exit(1);
  }
  console.log(colors.green(`Updated string "${stringToUpdate.id.key}" 🎉`));
}

module.exports = { importStrings, removeUnusedKeys, fetchRemoteKeys, fetchLatest, getProject, updateString };