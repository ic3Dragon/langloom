const { processLocalData, processLocalKeys } = require('./file');
const { importKeys, removeUnusedKeys } = require('./api');
const { Command } = require('commander');
const program = new Command();

program.name('LocaleBridge')
  .description('CLI for managig localization keys and values for i18nexus')
  .version('1.0');

program.command('importLocal').alias('i')
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus')
  .requiredOption('-l, --language <language>', 'Language of locale file to import to i18nexus')
  .option('-d, --delete', 'Delete keys in i18nexus that do not exist in the local file')
  .action(async (options) => {
    const localData = await processLocalData(options.file);
    await importKeys(options.namespace, options.language, localData);
  });

program.command('removeUnused').alias('D')
  .requiredOption('-f, --file <path>', 'Path to the local JSON locale file for your base language')
  .requiredOption('-ns, --namespace <name>', 'Namespace in i18nexus')
  .requiredOption('-l, --language <language>', 'Language of locale file to import to i18nexus')
  .action(async (options) => {
    const localKeys = await processLocalKeys(options.file);
    const result = await removeUnusedKeys(options.namespace, localKeys.keys, options.language);
    console.log(result);
  });

program.parse(process.argv);

