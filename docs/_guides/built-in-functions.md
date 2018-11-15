---
layout: documentation
title: Built-in functions
sub_headers: ["ref()", "dependencies()", "self()", "pre()", "post()", "assert()", "type()", "where()"]
---

# Built-in functions

Build in functions are made available within the context of `.sql` files.
They can be used with the following syntax:

```js
${functionName(...)}
```

## `ref()`

References another materialization in the project, and adds that materialization as a [dependencies](#dependency) of the current materialization, operation, or test.

Arguments: `model-name`

Returns: full table reference

For example, the following query:

```js
select * from ${ref("sourcetable")}
```

Gets compiled to something (depending on the warehouse type) like:

```js
select * from "schema"."sourcetable"
```
And has the side affect of adding the `sourcetable` materialization as a dependency.

## `dependencies()`

Specifies one or more materializations, operations or assertions that this node depends on.
Supports wildcard matches with `"*"`.

```js
${dependencies("sourcetable")}
```

Multiple tables can be provided in a single call:

```js
${dependencies(["sourcetable", "othertable"])}
```

## `self()`

Returns a full table reference to the current materialization output table. Useful for incremental table builds.

```js
${type("incremental")}
${where(`ts > (select max(ts) from ${self})`)}
select now() as ts
```

## `preOps()`

Allows you to specify queries that should be executed before the main materialization statement.

## `postOps()`

Allows you to specify queries that should be executed after the main materialization statement.

## `type()`

Changes the type of the materialization. See [materializations](/materializations) for more details.

## `protected()`

Marks this table as protected, used for incremental tables. When set, the `--full-refresh` option cannot be used for this table.

## `where()`

Specifies the where clause used for incremental. See [incremental tables](/materializations#incremental-tables) for more details.

## `partitionBy()`

Specifies and expression or field name to use as the partition clause in BigQuery.