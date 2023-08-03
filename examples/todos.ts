import { provideMongo, CrudModel, CrudScreen, PreDesignedTemplate } from '@qloes/mongo-crud;

provideMongo(process.env.MONGODB_URL || 'mongodb://localhost/db');

const todo = new CrudModel('todo')
const group = new CrudModel('group')

const HTML_TODOS_STRUCTURE = `
<h1>{{ row.title }}</h1>
<p>{{ row.content }}</p>
<p>{{ row.isDone ? 'Done!' : 'Not done' }}</p>
<actions>
  <ql-button for="edit">Edit</ql-button>
  <ql-button for="remove">Edit</ql-button>
</actions>
`

todo.schema({
  title: {
    type: String,
    public: true,
  },
  content: {
    type: String,
    public: true,
  },
  isDone: {
    type: Boolean,
    public: true,
  },
  group: {
    type: String,
    ref: 'group',
    public: true,
  }
})
todo.screen(
  CrudScreen.LIST,
  PreDesignedTemplate.ROWS_LIST,
  HTML_TODOS_STRUCTURE
)

todo.screen(CrudScreen.EDIT, PreDesignedTemplate.BASIC_FORM, `
<h1>edit this data</h1>
<FormInput v-model="row.title" title="Title" />
<ForeignSelector v-model="row.group" title="Group" :from="schema.group.ref" />
`)

todo.execute();

group.schema({
  title: {
    type: String,
    public: true,
  },
  description: {
    type: String,
    public: true,
  }
})
group.execute();