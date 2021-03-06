import { InvalidIndentationError, ParseError, parse } from '../../src/index'
import { getFileContentParsed } from '../utils'

const parentFolder = 'objects'

const expected = {
  user1: {
    name: 'Carlos',
    surname: 'Gardel',
    testing_nested: {
      nested_1: 1,
      nested_2: 2
    },
    year_of_birth: 1890
  },
  user2: {
    name: 'Aníbal',
    surname: 'Troilo',
    year_of_birth: 1914
  }
}

const emptyObject = {
  empty_object: {}
}

/** Tests all kind of objects. */
test('test_normal', () => {
  const parsedData = getFileContentParsed(parentFolder, 'normal.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests empty object. */
test('empty', () => {
  const parsedData = parse('empty_object: empty')
  expect(parsedData).toEqual(emptyObject)
})

/** Tests empty object with several blanks. */
test('empty_2', () => {
  const parsedData = parse('empty_object:     empty    ')
  expect(parsedData).toEqual(emptyObject)
})

/** Tests empty object with comments and blank lines. */
test('empty_3', () => {
  const parsedData = getFileContentParsed(parentFolder, 'empty.ura')
  expect(parsedData).toEqual(emptyObject)
})

/** Tests all kind of objects with comments between elements. */
test('test_with_comments', () => {
  const parsedData = getFileContentParsed(parentFolder, 'with_comments.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests parsing error in invalid objects. */
test('test_invalid', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'invalid.ura')
  }).toThrow(ParseError)
})

/** Tests parsing error in invalid objects. */
test('test_invalid_2', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'invalid_2.ura')
  }).toThrow(InvalidIndentationError)
})

/** Tests parsing error in invalid objects. */
test('test_invalid_3', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'invalid_3.ura')
  }).toThrow(ParseError)
})
