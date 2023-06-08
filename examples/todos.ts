import { provideMongo, CrudModel } from '@qelos/mongo-crud';

provideMongo(process.env.MONGODB_URL || 'mongodb://localhost/db');

const todo = new CrudModel('todo')
const group = new CrudModel('group')

todo.schema({
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
todo.screen(
  'list',
  'rows-list',
  `### [{{ row.title }}](edit)
{{ row.content }}
{{ row.isDone ? 'Done!' : 'Not done' }}
:!:
<button for="edit">Edit</button>
<button for="remove">{{ $t('Remove') }}</button>`
)
todo.execute();

group.schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  }
})
group.execute();