# LangLoom CLI

*"Weaving the threads of language together"*

LangLoom CLI is a tool designed to manage localization keys and values for i18nexus projects efficiently. It offers functionalities to import base strings from local JSON files into i18nexus projects and remove unused local keys from i18nexus projects as well as download the latest project translations and update individual keys.

It is designed for developer oriented workflow that treats the local base language-file as a working copy that you then use to keep your remote project up to date with. You pull the latest translations, modify the local file as needed and sync it with the remote i18nexus project. 

An example of a suggested workflow can be found at the end of this document.

## Environment Variables
The commands below require the inclusion of an api-key and most also need a personal access token. These can be set with environment variables in your project. This package will load the .env file in the current working directory to check for i18nexus variables of this format:
```
I18NEXUS_API_KEY=[YOUR_KEY]
I18NEXUS_API_BEARER=[YOUR_TOKEN]
```

**OBS:** 
If you do not wish to load your .env file, you can run export `I18NEXUS_NO_ENV=true`.

### Personal Access Tokens
Some of the commands require a Personal Access Token as they write data to your i18nexus project. You can create one and set the limitations of it in your i18nexus account dashboard.

REMEMBER: Keep these tokens a secret and do NOT publish them to any public code repositories such as Github. They should never be client facing. Treat each token as if it is your i18nexus password.

## Installation

To use Nexus Bridge CLI, you can install it globally via npm:

```bash
npm install -g langloom
```

## Commands

### Downloading Latest Translations

To overwrite local locale files with the latest project translations from i18nexus, use the `pull-latest` command:

```bash
langloom pull-latest -k <apiKey> [-c] [--clear] [-p <path>] [-ns [namespaces...]]
```

#### Options:

- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `[-c, --confirmed]` (Optional): Only download confirmed translations. (Default: false)
- `[--clear]` (Optional): Removes and rebuilds the destination folder before download. (Default: false)
- `[-p, --path <path>]` (Optional): Path to the destination folder where to place downloaded translations if other than framework defaults (see below).
-   `-ns, --namespaces [namespaces...]` (Optional): Name/names of namespaces to retrieve if you do not want all of them. (Pulls all by default).

#### Example

```bash
langloom pull-latest -k YOUR_API_KEY -c --clear -p ./src/custom/path -ns common home
```

#### Default download paths
The default path used depends on your project setting in i18nexus. If you wish to download your files to a custom directory, you can specify a path using the `--path` option.

#### i18next:

```
.
└── public
    └── locales
        ├── en
        |   └── common.json
        └── de
            └── common.json
```

#### i18next + Next.js with App Router:

```
.
└── locales
    ├── en
    |   └── common.json
    └── de
        └── common.json
```

#### next-intl:

```
.
└── messages
    └── en.json
    └── de.json
```

#### react-intl:

```
.
└── messages
    └── locales
        ├── en
        |   └── common.json
        └── de
            └── common.json
```

---

### Importing Base Strings

To add and update base strings to your i18nexus project from a local JSON file, use the `import` command:

```bash
langloom import -k <apiKey> -t <token> -f <path> -ns <name> -l <language>
```

#### Options:

- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `-t, --token <token>`: A personal access token generated for your account in i18nexus.
- `-f, --file <path>`: Path to the local JSON locale file for your base language.
- `-ns, --namespace <name>`: Namespace in i18nexus.
- `-l, --language <language>`: Language of locale file to import to i18nexus.

#### Example

```bash
langloom import -k YOUR_API_KEY -t YOUR_TOKEN -f ./path/to/your/locale.json -ns common -l en
```

---


### Removing Unused Keys

To delete a string and its translations from your i18nexus project, use the `remove-unused` command:

```bash
langloom remove-unused -k <apiKey> -t <token> -f <path> -ns <name> -l <language>
```

#### Options:

- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `-t, --token <token>`: A personal access token generated for your account in i18nexus.
- `-f, --file <path>`: Path to the local JSON locale file for your base language.
- `-ns, --namespace <name>`: Namespace in i18nexus.
- `-l, --language <language>`: Base language of project to compare keys against.

#### Example

```bash
langloom remove-unused -k YOUR_API_KEY -t YOUR_TOKEN -f ./path/to/your/locale.json -ns common -l en
```

---

### Updating a Single Base String

To update a single base string key, value, or details in your i18nexus project, use the `update-string` command:

```bash
nexus-bridge update-string -k <apiKey> -t <token> -ns <namespace> -o <oldKey> [-n <newKey>] [-v <stringValue>] [-d <stringDetails>] [-r]
```

#### Options:

Required
- `-k, --api-key <apiKey>`: The API key for your i18nexus project.
- `-t, --token <token>`: A personal access token generated for your account in i18nexus.
- `-ns, --namespace <namespace>`: Namespace in i18nexus.
- `-o, --oldKey <oldKey>`: The OLD/current key of the string.

Optional
- `-n, --newKey <newKey>`: The NEW key of the string.
- `-v, --value <stringValue>`: The new value of the string.
- `-d, --details <stringDetails>`: The new details of the string.
- `-r, --reset`: Reset confirmed translations of this string with machine translations.

*Note that even if they are optional you will need to supply either a new key, a new value or details.*

#### Example:

```bash
nexus-bridge update-string -k YOUR_API_KEY -t YOUR_TOKEN -ns common -o old-key -n new-key -v "New value" -d "New details" -r
```

## Example Workflow

- Pull latest confirmed translations into codebase with and remove old files `langloom pull-latest --confirmed --clear`.
- Extract keys into your locale file using your typical method.
- Remove keys from the base file that are no longer in use.
- Update values and key names of keys that exist in the project. 

OBS. For each string that you change the _**key name**_ of you need to run `langloom update-string` _**before**_ you run the import script.
- When you are done with the session sync your changes to the remote using the `langloom import` and `langloom remove-unused` commands. 

### When updating the name of a key

If you are updating the name of an existing key in your language file this will not update the remote key with the import command. It will be treated as a new key and the old key will be removed along with any previous confirmed translations etc. If you wan't to keep any transaltions connected to that string you will need to update the name of the key using `langloom update-string`.

## License

This project is licensed under the MIT License.
