Certainly! Below is a README for your CLI/NPM module:
# Nexus Bridge CLI

Nexus Bridge CLI is a command line interface (CLI) designed to manage localization keys and values for i18nexus projects efficiently. It offers functionalities to import base strings from local JSON files into i18nexus projects and remove unused keys from i18nexus projects.
It is designed for a workflow that treats the local locale-file as a working copy that you then use to keep your remote project up to date with. 

The intended workflow is: 
- Pull latest translations into codebase with `nexus-bridge pull-latest` (command not yet implemented).
- Extract keys into your locale file. 
- Remove local keys that are no longer in use.
- Update values of keys that exist. 
- When you are done with the session sync your changes to the remote using the `nexus-bridge import` and `nexus-bridge remove-unused` commands. 

**OBS.** 
If you are updating the name of an existing key locally this will not update the remote key with the import command. If you wan't to keep any transaltions connected to that string you will need to update the name of the key using `nexus-bridge update` (command not yet implemented).

## Installation

To use Nexus Bridge CLI, you can install it globally via npm:

```bash
npm install -g nexus-bridge-cli
```

## Usage

### Importing Base Strings

To add and update base strings to your i18nexus project from a local JSON file, use the `import` command:

```bash
nexus-bridge import -k <apiKey> -t <token> -f <path> -ns <name> -l <language>
```

#### Options:

- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `-t, --token <token>`: A personal access token generated for your account in i18nexus.
- `-f, --file <path>`: Path to the local JSON locale file for your base language.
- `-ns, --namespace <name>`: Namespace in i18nexus.
- `-l, --language <language>`: Language of locale file to import to i18nexus.

### Removing Unused Keys

To delete a string and its translations from your i18nexus project, use the `remove-unused` command:

```bash
nexus-bridge remove-unused -k <apiKey> -t <token> -f <path> -ns <name> -l <language>
```

#### Options:

- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `-t, --token <token>`: A personal access token generated for your account in i18nexus.
- `-f, --file <path>`: Path to the local JSON locale file for your base language.
- `-ns, --namespace <name>`: Namespace in i18nexus.
- `-l, --language <language>`: Language of locale file to import to i18nexus.

## Examples

### Importing Base Strings

```bash
nexus-bridge import -k YOUR_API_KEY -t YOUR_TOKEN -f ./path/to/your/locale.json -ns common -l en
```

### Removing Unused Keys

```bash
nexus-bridge remove-unused -k YOUR_API_KEY -t YOUR_TOKEN -f ./path/to/your/locale.json -ns common -l en
```

## License

This project is licensed under the MIT License.
