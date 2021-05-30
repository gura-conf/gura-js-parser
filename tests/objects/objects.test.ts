import { InvalidIndentationError, ParseError } from '../../src/index'
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

/** Tests all kind of objects. */
test('test_normal', () => {
  const parsedData = getFileContentParsed(parentFolder, 'normal.ura')
  expect(parsedData).toEqual(expected)
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
