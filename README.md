# @qelos/mongo-crud

Create a fully CRUD API and UI using MongoDB and QELOS Plugin-Play

### Installation

Create a boilerplate plugin project.
```shell
$ npm init play@latest
```

Then, on existing project - install both mongodb and this library
```shell
$ npm install @qelos/mongo-crud mongodb
```

### Basic Usage

Here's an example of tasks and groups:
```ts
import {provideMongo, CrudModel} from '@qelos/mongo-crud';

provideMongo(process.env.MONGODB_URL || 'mongodb://localhost/db');

const task = new CrudModel('task')
const group = new CrudModel('group')

task.schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  isDone: {
    type: Boolean,
  },
  group: {
    type: String,
    ref: 'group'
  }
})
task.screen(
  'list',
  'rows-list',
  `<h3>{{ row.title }}</h3>
{{ row.content }}
{{ row.isDone ? 'Done!' : 'Not done' }}
<actions>
  <ql-button for="edit">Edit</ql-button>
  <ql-button for="remove">Edit</ql-button>
</actions>`
)
task.execute();

group.schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  }
})
group.execute();
```

After running this server, and connect it to an existing plugin to a QELOS app, the app will include all CRUD screens, UI, operations, and more.