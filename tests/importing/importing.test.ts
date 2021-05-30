import { DuplicatedImportError, DuplicatedKeyError, DuplicatedVariableError, FileNotFoundError, parse, ParseError } from '../../src/index'
import { getFileContentParsed } from '../utils'
import { writeFileSync } from 'fs'
import tmp from 'tmp'

/** Temp file structure. */
type TempFile = { name: string, fd: number, removeCallback: () => void }

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
    parse('import "invalid_file.ura"')
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
  // Creates temporary file and writes a key/value pair on it
  const stream: TempFile = tmp.fileSync()
  writeFileSync(stream.name, 'from_temp: true')
  const parsedData = parse(`import "${stream.name}"\nfrom_original: false`)
  stream.removeCallback()

  expect(parsedData).toEqual({
    from_temp: true,
    from_original: false
  })
})

/** Tests errors invalid importing sentence (there are blanks before import). */
test('parse_error_1', () => {
  expect(() => {
    parse('  import "another_file.ura"')
  }).toThrow(ParseError)
})

/** Tests errors invalid importing sentence (there are more than one whitespace between import and file name). */
test('parse_error_2', () => {
  expect(() => {
    parse('import   "another_file.ura"')
  }).toThrow(ParseError)
})
