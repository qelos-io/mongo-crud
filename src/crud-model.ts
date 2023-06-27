import {ObjectId} from 'mongodb';
import {getCollection} from './db';
import {createCrud, ResponseError} from '@qelos/plugin-play';
import {ICrudOptions} from '@qelos/plugin-play/src/crud.types';

export interface ResourceProperty<T = any> {
  public?: boolean;
  hideInList?: boolean;
  type?: String | Number | Boolean | Object | null | Array<T>;
  schema?: ResourceSchema | ResourceProperty<T>;
  validate?: (value: any) => boolean | Promise<boolean>;
  options?: Array<any>;
  ref?: string;
}

// @ts-ignore
export type ResourceSchema = Record<string, ResourceProperty>;

export enum CrudScreen {
  LIST = 'list',
  EDIT = 'edit',
  ADD = 'add',
  VIEW = 'view',
}

export enum PreDesignedTemplate {
  ROWS_LIST = 'rows-list',
  BASIC_FORM = 'basic-form',
}

export function getPlural(word: string) {
  const lastChar = word[word.length - 1].toLowerCase();
  if (['x', 'h', 's'].includes(lastChar)) {
    return word + 'es';
  }
  if (lastChar === 'y') {
    return word.substring(0, word.length - 1) + 'ies';
  }
  return word + 's';
}

export class CrudModel {
  private _crudOptions: any;
  private _indexes: { fields: Record<string, 1>, unique?: boolean }[] = [];

  collection = getCollection(getPlural(this.entityName.toLowerCase()));

  constructor(private entityName: string) {
    this._crudOptions = {
      display: {
        name: entityName,
      },
      screens: {} as any,
      verify: async (req) => {
        if (!req.user) {
          throw new ResponseError('please register');
        }
      },
    }
  }

  schema(input: ResourceSchema) {
    this._crudOptions.schema = input;
  }

  index(keys: string[], {unique}: { unique?: boolean } = {}) {
    const fields = keys.reduce((obj, field) => {
      obj[field] = 1;
      return obj;
    }, {})
    this._indexes.push({fields, unique});
  }

  screen(forScreen: CrudScreen, use: PreDesignedTemplate | false, structure?: string) {
    this._crudOptions.screens[forScreen] = use && {
      use,
      structure: typeof structure === 'string' ? structure.trim() : structure,
    }
  }

  async execute() {
    createCrud({
      ...this._crudOptions,
      readOne: (_id, {user, tenantPayload}) => this.collection.findOne({
        _id: new ObjectId(_id),
        user: tenantPayload.sub + '.' + user?._id
      }),
      createOne: async (body, {user, tenantPayload}) => {
        const data: any = {...body, user: tenantPayload.sub + '.' + user?._id};
        const res = await this.collection.insertOne(data);
        data._id = res.insertedId;
        return data;
      },
      readMany: (query, {user, tenantPayload}) => this.collection.find({
        user: tenantPayload.sub + '.' + user?._id,
        title: new RegExp(query.q as string, 'i')
      }).toArray(),
      updateOne: async (_id, body, {user, tenantPayload}) => {
        const query = {_id: new ObjectId(_id), user: tenantPayload.sub + '.' + user?._id};
        await this.collection.updateOne(query, {$set: body});
        return this.collection.findOne(query);
      },
      deleteOne: async (_id, {user, tenantPayload}) => {
        await this.collection.deleteOne({_id: new ObjectId(_id), user: tenantPayload.sub + '.' + user?._id});
        return {_id};
      }
    })
    await this.collection.createIndex({user: 1});
    await Promise.all(
      this._indexes.map(
        ({fields, unique}) =>
          this.collection.createIndex(fields, unique ? {unique: true} : undefined)
      )
    )
  }
}