/// <reference path="../schema.d.ts" />

import { createWriteStream } from 'fs';
import mkdirp from 'mkdirp';
import shortid from 'shortid';

import { TestRun } from '../models/testrun';
import { TestCase } from '../models/testcase';

const UPLOAD_DIR = './uploads';

// Ensure upload directory exists.
mkdirp.sync(UPLOAD_DIR);

const storeFS = ({ stream, filename }: any): Promise<any> => {
  const id = shortid.generate();
  const path = `${UPLOAD_DIR}/${id}-${filename}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject)
  );
};

const storeDB = (file: any) => {
  return TestRun.query().insertAndFetch(file);
};

const processUpload = async (upload: any) => {
  console.log(upload);
  const { stream, filename, mimetype, encoding } = await upload;
  const { id, path } = (await storeFS({ stream, filename })) as any;
  return storeDB({ id, filename, mimetype, encoding, path });
};

export const Mutation = {
  async createTestRun(_: any, args: any) {
    const { filename, product, meta, type } = (await args.testrun) as TestRun;
    return storeDB({
      filename,
      product,
      meta,
      type
    });
  },

  async uploadFile(_: any, args: TestmonApi.IUploadFileOnMutationArguments) {
    return processUpload(args.file);
  },

  async multipleUpload(
    _: any,
    args: TestmonApi.IMultipleUploadOnMutationArguments
  ) {
    const files = await args.files;
    return Promise.all(files.map(processUpload));
  },

  async createTestCase(_: any, args: any) {
    const {
      name,
      info,
      description,
      result
    } = (await args.testCase) as TestCase;
    const runid = args.runid;
    return TestCase.query().insertAndFetch({
      name,
      info,
      description,
      result,
      runid
    });
  },

  async removeTestCase(_: any, args: any) {
    const id = args.id;
    return (await TestCase.query().deleteById(id)) === 1;
  },

  async modifyTestCase(_: any, args: any) {
    const id = args.id;
    var model = args.testCase;

    // Sanitize my model of empty fields.
    Object.keys(model).forEach(key => model[key] == null && delete model[key]);

    return TestCase.query().updateAndFetchById(id, model);
  }
};