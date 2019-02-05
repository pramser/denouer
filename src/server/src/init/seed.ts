import { File } from '../models/file';
import { Result } from '../models/result';
import { ResultType, FileStatus, ResultStatus } from '../models/enum';

export async function init() {
  let files = await File.query().where('file_name', 'unit_2018_12_01_1.xml');
  if (files.length < 1) {
    files = await File.query().insert([
      {
        file_name: 'unit_2018_12_01_1.xml',
        mime_type: 'text/xml',
        encoding: 'utc-8',

        product: 'schedule',
        meta: 'unit',

        file_status: FileStatus.Pending,
        result_type: ResultType.JUnit
      },
      {
        file_name: 'int_2018_12_01_1.xml',
        mime_type: 'text/xml',
        encoding: 'utc-8',

        product: 'schedule',
        meta: 'int',

        file_status: FileStatus.Pending,
        result_type: ResultType.JUnit
      },
      {
        file_name: 'perf_2018_12_01_1.xml',
        mime_type: 'text/xml',
        encoding: 'utc-8',

        product: 'engage',
        meta: 'perf',

        file_status: FileStatus.Pending,
        result_type: ResultType.JUnit
      }
    ]);
  }

  let results = await Result.query().where('name', 'test_success');
  if (results.length < 1) {
    results = await Result.query().insert([
      {
        name: 'test_success',
        description: 'Verifies the test can be imported successfully',
        assignee: 'pramser',
        result_status: ResultStatus.Pass
      },
      {
        name: 'test_failure',
        description: 'Verifies the test can be imported failingly',
        assignee: 'pramser',
        result_status: ResultStatus.Fail
      },
      {
        name: 'test_none',
        description: 'Verifies the test can be imported noningly',
        assignee: 'pramser',
        result_status: ResultStatus.None
      }
    ]);
  }

  const [{ id: resultId }] = results;
}
