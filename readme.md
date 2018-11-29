# Zield <!-- omit in toc -->

[![Travis CI](https://img.shields.io/travis/iguntur/zield.svg?style=flat-square)](https://travis-ci.org/iguntur/zield)
[![node](https://img.shields.io/node/v/zield.svg?style=flat-square)]()
[![npm](https://img.shields.io/npm/v/zield.svg?style=flat-square)](https://www.npmjs.org/package/zield)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()

> CLI utility for my scripts

## Contents <!-- omit in toc -->

- [Install](#install)
- [API](#api)
    - [zield](#zield)
        - [.setup(`fn`)](#setupfn)
        - [.task([`name,`] [`description,`] `fn`)](#taskname-description-fn)
    - [Program Implementation](#program-implementation)
        - [p.argv(`input`)](#pargvinput)
        - [p.flags(`input`)](#pflagsinput)
        - [p.use(`[...fnHandler]`)](#pusefnhandler)
        - [p.run(`[...fnHandler]`)](#prunfnhandler)
    - [Process Handler](#process-handler)
        - [proc.`<method|property>`](#procmethodproperty)
            - [proc[`'--'`]](#proc--)
            - [proc.argv](#procargv)
            - [proc.get(`flag`)](#procgetflag)
            - [proc.log(`input`)](#procloginput)
            - [proc.fatal(`input`)](#procfatalinput)
            - [proc.stdout](#procstdout)
            - [proc.stderr](#procstderr)
        - [next()](#next)
    - [Argv Instance](#argv-instance)
        - [.describe(`input`)](#describeinput)
    - [Flag Instance](#flag-instance)
        - [.as(`[...aliases]`)](#asaliases)
        - [.string(`value`)](#stringvalue)
        - [.number(`value`)](#numbervalue)
        - [.boolean(`value`)](#booleanvalue)
        - [.describe(`input`)](#describeinput-1)

## Install

- Via NPM

```console
$ npm install zield
```

- Via Yarn

```console
$ yarn add zield
```

## API

### zield

Create a file: (e.g) `cli.js`

```js
#!/usr/bin/env node
const zield = require('zield');

zield.setup(p => {
    // Setup global flags
    p.flags('--env').as('-e').string('development').describe('Set [NODE_ENV] value');
    p.flags('--verbose').as('-v').describe('Verbose the output console');
});

// Add default task
zield.task(p => {
    p.run(proc => {
        console.log('running default task...');
        console.log('--verbose: %s', proc.get('--verbose'));
        console.log('--env: %s', proc.get('--env'));
    });
});

// Add task
zield.task('build', 'Build app', p => {
    p.argv('[source]').describe('Source directory');
    p.flags('--out-dir').as('-D').string('dist').describe('Set the output directory');
    p.run(proc => {
        console.log('running build task...');
        console.log('argv: %O', proc.argv);
        console.log('flags: %O', proc.get(['--out-dir', '--env']));
    });
});
```

#### Running Task <!-- omit in toc -->

```console
$ node cli.js --verbose --env test -- --foo --bar baz
running default task
...

$ node cli.js build src --env production --out-dir release --verbose
running build task
...
```

#### Help message <!-- omit in toc -->

> By default it will show the help messages if default task is not override.

```console
$ node cli.js --help
...

$ node cli.js build --help
...
```

#### .setup(`fn`)

Setup global flags.

- Types:
    - **.setup(`fn: Function`)**
- Params:
    - `fn`: `<Function>` _(required)_ - A function with `p` [(program)](#program-implementation) object.
- Returns: `void`
- Example:
    ```js
    zield.setup(p => {
        p.flags('--env').as('-e').string('development').describe('Set [NODE_ENV] value');
        p.flags('--verbose').as('-V').describe('Verbose the output console');
    });
    ```

#### .task([`name,`] [`description,`] `fn`)

Add a new command task.

- Types:
    - **.task(`name: string`, `description: string`, `fn: Function`)**
    - **.task(`name: string`, `fn: Function`)**
    - **.task(`fn: Function`)**
- Params:
    - `name`: `<string>` _(optional)_ - The task name.
    - `description`: `<string>` _(optional)_ - Task description will show in CLI.
    - `fn`: `<Function>` _(required)_ - A function with `p` [(program)](#program-implementation) object to handle the task.
- Returns: `void`
- Example:
    ```js
    zield.task(p => {
        // Task without name and description [default]
    });
    zield.task('foo-task', p => {
        // Task without description
    });
    zield.task('bar-task', 'Task description', p => {
        // Task with name and description
    });
    ```

---

### Program Implementation

Define `argv` and `flags` attribute.

#### p.argv(`input`)

- Types:
    - **p.argv(`input: string`)**
- Params:
    - `input`: `<string>` _(required)_
- Returns: [`<ArgvAttribute>`](#argv-instance) instance.

#### p.flags(`input`)

- Types:
    - **p.flags(`input: string`)**
- Params:
    - `input`: `<string>` _(required)_
- Returns: [`<FlagAttribute>`](#flag-instance) instance.

#### p.use(`[...fnHandler]`)

- Types:
    - **p.use(`...fnHandler: Function[]`)**
- Params:
    - `...fnHandler`: `<Function[]>` _(required)_ - Functions [process](#process-handler) handler.

#### p.run(`[...fnHandler]`)

- Types:
    - **p.run(`...fnHandler: Function[]`)**
- Params:
    - `...fnHandler`: `<Function[]>` _(required)_ - Functions [process](#process-handler) handler.

### Process Handler

```js
p.use((proc, next) => { /* ... */ });
p.run((proc, next) => { /* ... */ });
```

#### proc.`<method|property>`

##### proc[`'--'`]

- Property:
    - Value: `<string[]>` - All arguments after the end.

##### proc.argv

- Property:
    - Value: `<string[]>` - All input arguments.

##### proc.get(`flag`)

- Types:
    - **proc.get(`flag: string | string[]`)**
- Params:
    - `flag`: `<string | string[]>` _(required)_ - Get a value of flag.
- Returns: `<any | any[]>`
- Example:
    ```js
    p.run(proc => {
        console.log(proc.get('--verbose'));
        // Get multiple values
        const [outDir, isProduction, isVerbose] = proc.get(['--out-dir', '--production', '--verbose']);
        console.log('outDir: %s', outDir);
        console.log('isProduction: %o', isProduction);
        console.log('isVerbose: %o', isVerbose);
    });
    ```

##### proc.log(`input`)

- Types:
    - **proc.log(`str: string | Buffer, ...input: any[]`)**
- Params:
    - `str`: `<string | Error | Buffer>` _(required)_ - Get value of flag.
    - `input`: `<any[]>` _(optional)_ - Get value of flag.
- Returns: `void`
- Example:
    ```js
    p.run(proc => {
        proc.log('%s', '🍰');
    });

##### proc.fatal(`input`)

- Types:
    - **proc.fatal(`str: string | Error | Buffer, ...input: any[]`)**
- Params:
    - `str`: `<string | Error | Buffer>` _(required)_ - Get a value of flag.
    - `input`: `<any[]>` _(optional)_ - Get a value of flag.
- Returns: `void`
- Example:
    ```js
    p.run(proc => {
        proc.fatal(new Error('💀'));
    });
    ```

##### proc.stdout
##### proc.stderr
- Type: `NodeJS.WritableStream`.
- Example:
    ```js
    const cp = require('child_process');

    p.run(proc => {
        const docker = cp.spawn('docker', ['logs', '-f', 'nginx'], {stdio: 'pipe'});
        docker.stdout.pipe(proc.stdout);
        docker.stderr.pipe(proc.stderr);
    });
    ```


#### next()

- Returns: `void`
- Example:
    ```js
    function runProcess(name, ms) {
        const ms = (min = 1000, max = 5000) => Math.floor(Math.random() * ((max + 1) - min) + min);
        return (proc, next) => {
            console.log('[start] %s', name);
            setTimeout(() => {
                console.log('[end]   %s', name);
                next();
            }, ms() /* 1000..5000 */ );
        };
    }
    p.use((proc, next) => {
       console.log('process start');
       next();
    });
    p.use(runProcess('process - 1'));
    p.use(runProcess('process - 2'));
    p.use(runProcess('process - 3'), runProcess('process - 4'));
    p.run((proc, next) => {
       console.log('process done');
    });
    ```

###  Argv Instance

```js
p.argv('[source]').describe('...');
```

#### .describe(`input`)

- Params:
    - `input`: `<string>` _(required)_ - Set arguments description.
- Returns: [`<ArgvAttribute>`](#argv-instance) instance.


###  Flag Instance

```js
p.flags('--out-dir').as('-D').string('path/to/dist').describe('...');
p.flags('--production').as('-p').boolean().describe('...');
p.flags('--concurrency').number(4).describe('...');
```

#### .as(`[...aliases]`)

- Params:
    - `aliases`: `<string | string[]>` _(required)_ - An aliases of flag.
- Returns: [`<FlagAttribute>`](#flag-instance) instance.

#### .string(`value`)

- Params:
    - `value`: `<string>` _(optional)_ - Set the default value as type `string`.
        - Default: `undefined`
- Returns: [`<FlagAttribute>`](#flag-instance) instance.

#### .number(`value`)

- Params:
    - `value`: `<number>` _(optional)_ - Set the default value as type `number`.
        - Default: `undefined`
- Returns: [`<FlagAttribute>`](#flag-instance) instance.

#### .boolean(`value`)

- Params:
    - `value`: `<boolean>` _(optional)_ - Set the default value as type `boolean`.
        - Default: `false`
- Returns: [`<FlagAttribute>`](#flag-instance) instance.

#### .describe(`input`)

- Params:
    - `input`: `<string>` _(required)_ - Set flag description.
- Returns: [`<FlagAttribute>`](#flag-instance) instance.


---

## License <!-- omit in toc -->

MIT © [Guntur Poetra](http://github.com/iguntur)
