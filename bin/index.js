#!/usr/bin/env node

const colors = require('colors');
const { Command } = require('commander');
const pkg = require('../package.json');
const { I18NEXUS_API_KEY, I18NEXUS_API_BEARER } = require('../env');
const { processLocalData, processLocalKeys } = require('../src/file');
const { importKeys, removeUnusedKeys } = require('../src/api');

const program = new Command();

program.name('Nexus Bridge CLI')
  .description('A command line interface (CLI) for managig localization keys and values for i18nexus')
  .version(pkg.version)

program.command('import').alias('i')
  .description('Add and update base strings to your i18nexus project from a local JSON file.')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project',
    process.env.I18NEXUS_API_KEY || I18NEXUS_API_KEY)
  .requiredOption('-t, --token <token>', 'A personal access token generated for your account in i18nexus.',
    process.env.I18NEXUS_PERSONAL_ACCESS_TOKEN || I18NEXUS_API_BEARER)
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language', 'common.json')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus', 'common')
  .requiredOption('-l, --language <language>', 'Language of locale file to import to i18nexus', 'en')
  .action(async (options) => {
    const { namespace, language, apiKey, token } = options;
    const localData = await processLocalData(options.file);
    await importKeys(namespace, language, localData, apiKey, token);
  });

program.command('remove-unused').alias('d')
  .description('Delete a string and it\'s translations from your i18nexus project')
  .requiredOption('-k, --api-key <apiKey>', 'The API key for your project',
    process.env.I18NEXUS_API_KEY || I18NEXUS_API_KEY)
  .requiredOption('-t, --token <token>', 'A personal access token generated for your account in i18nexus.',
    process.env.I18NEXUS_PERSONAL_ACCESS_TOKEN || I18NEXUS_API_BEARER)
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language', 'common.json')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus', 'common')
  .requiredOption('-l, --language <language>', 'Language of locale file to import to i18nexus', 'en')
  .action(async (options) => {
    const { namespace, language, apiKey, token } = options;
    const localKeys = await processLocalKeys(options.file);
    const result = await removeUnusedKeys(namespace, localKeys.keys, language, apiKey, token);
    console.info(colors.green(`Removed: ${result.removed}\n`), colors.red(`Failed: ${result.failed}`));
  });

program.parse(process.argv);

