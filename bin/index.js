#!/usr/bin/env node

const { Command } = require('commander');
const colors = require('colors');
const pkg = require('../package.json');
const { processLocalData, processLocalKeys, saveLocales } = require('../src/file');
const { importStrings, removeUnusedKeys, fetchLatest, getProject, updateString } = require('../src/api');

const { loadEnvConfig } = require('@next/env');

if (process.env.I18NEXUS_NO_ENV !== 'true') {
  loadEnvConfig(process.cwd());
}

const program = new Command();

program.name('Nexus Bridge CLI')
  .description('A command line interface (CLI) for managig localization keys and values for i18nexus')
  .version(pkg.version)

program.command('pull-latest').alias('p')
  .description('Overwrite local locale files with latest project translations.')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project', process.env.I18NEXUS_API_KEY)
  .option('-c, --confirmed', 'Only download confirmed translations', false)
  .option('--clear', 'Removes and rebuilds the destination folder before download', false)
  .option('-p, --path <path>', 'Path to the destination folder where to place downloaded translations if other than framework defaults')
  .option('-ns, --namespaces [namespaces...]', 'Name/names of namespaces to retrieve if you do not want all of them', [])
  .action(async (options) => {
    const translations = await fetchLatest(options.apiKey, options.confirmed, options.namespaces);
    const { library } = await getProject(options.apiKey);
    await saveLocales(translations, library, options.path, options.clear)
  });

program.command('import').alias('i')
  .description('Add and update base strings to your i18nexus project from a local JSON file.')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project', process.env.I18NEXUS_API_KEY)
  .requiredOption('-t, --token <token>', 'A personal access token generated for your account in i18nexus.', process.env.I18NEXUS_API_BEARER)
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus')
  .requiredOption('-l, --language <language>', 'Language of locale file to import to i18nexus')
  .action(async (options) => {
    const { namespace, language, apiKey, token } = options;
    const localData = await processLocalData(options.file);
    await importStrings(namespace, language, localData, apiKey, token);
  });

program.command('remove-unused').alias('d')
  .description('Delete a string and it\'s translations from your i18nexus project')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project', process.env.I18NEXUS_API_KEY)
  .requiredOption('-t, --token <token>', 'A personal access token generated for your account in i18nexus.', process.env.I18NEXUS_API_BEARER)
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus')
  .requiredOption('-l, --language <language>', 'Base language of project to compare keys against')
  .action(async (options) => {
    const { namespace, language, apiKey, token } = options;
    const localKeys = await processLocalKeys(options.file);
    await removeUnusedKeys(namespace, localKeys.keys, language, apiKey, token);

  });

program
  .command('update-string').alias('u')
  .description('Update a single base string key, value or details')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project',
    process.env.I18NEXUS_API_KEY)
  .requiredOption('-t, --token <token>', 'A personal access token generated for your account in i18nexus.',
    process.env.I18NEXUS_API_BEARER)
  .requiredOption('-ns, --namespace <namespace>', 'Namespace in i18nexus')
  .requiredOption('-o, --oldKey <oldKey>', 'The OLD/current key of the string')
  .option('-n, --newKey <newKey>', 'The NEW key of the string')
  .option('-v, --value <stringValue>', 'The new value of the string')
  .option('-d, --details <stringDetails>', 'The new details of the string')
  .option('-r, --reset', 'Reset confirmed translations of this string with machine translations.', false)
  .action(async (options) => {
    const { apiKey, token, namespace, oldKey, newKey, value, details, reset } = options;

    if (!(newKey || value || details)) {
      console.error(colors.red('Nothing to update. Please provide a new value, key or details for the string.'));
      process.exit(1);
    }
    const stringToUpdate = {
      id: {
        namespace: namespace,
        key: oldKey
      },
      key: newKey,
      value: value,
      namespace: namespace,
      description: details,
      reset_confirmed: reset
    };
    await updateString(stringToUpdate, apiKey, token);
  });

program.parse(process.argv);

