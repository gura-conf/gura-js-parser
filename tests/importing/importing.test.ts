import { DuplicatedImportError, DuplicatedKeyError, DuplicatedVariableError, FileNotFoundError, parse } from '../../src/index'
import { getFileContentParsed } from '../utils'
import temp from 'temp'

// Automatically track and cleanup files at exit
temp.track()

const parentFolder = 'importing'

const expected = {
  from_file_one: 1,
  from_file_two: {
    name: 'Aníbal',
    surname: 'Troilo',
    year_of_birth: 1914
  },
  from_original_1: [1, 2, 5],
  from_original_2: false,
  from_file_three: true
}

/** Tests importing from several files. */
test('importing_normal', () => {
  const parsedData = getFileContentParsed(parentFolder, 'normal.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests importing from several files with a variable in import sentences. */
test('importing_with_variables', () => {
  const parsedData = getFileContentParsed(parentFolder, 'with_variable.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests errors importing a non existing file. */
test('importing_not_found_error', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'invalid_file.ura')
  }).toThrow(FileNotFoundError)
})

/** Tests errors when redefines a key. */
test('importing_duplicated_key_error', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'duplicated_key.ura')
  }).toThrow(DuplicatedKeyError)
})

/** Tests errors when redefines a variable. */
test('importing_duplicated_variable_error', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'duplicated_variable.ura')
  }).toThrow(DuplicatedVariableError)
})

/** Tests errors when imports more than once a file. */
test('importing_duplicated_imports', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'duplicated_imports_simple.ura')
  }).toThrow(DuplicatedImportError)
})

/** Tests that absolute paths works as expected. */
test('importing_with_absolute_paths', () => {
  const tmp = temp.createWriteStream()
  tmp.write('from_temp: true')
  const parsedData = parse(`import "${temp.name}"\nfrom_original: false`)

  tmp.end()
  expect(parsedData).toEqual({
    from_temp: true,
    from_original: false
  })
})
