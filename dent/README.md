# Dent

Dent is a simple executable that performs a variety of actions.

## Install

Dent requires only the `allow-env` and `allow-run` permissions.

```
deno install --allow-env --allow-run --name dent https://raw.githubusercontent.com/nativecode-dev/dent/dent/run.ts
```

## Usage

```
dent <command> [options]
```

`<command>` can be one of:
- `tag-release`: tags the current with a semantic version and pushes tag to repo.
- `tag-next`: gets the next tag version.
