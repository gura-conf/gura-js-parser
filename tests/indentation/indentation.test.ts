import { InvalidIndentationError } from '../../src/gura-parser'
import { getFileContentParsed } from '../utils'

const parentFolder = 'indentation'

/** Tests raising an error when both whitespace and tabs are used at the time for indentation. */
test('wrong_indentation_char', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'different_chars.ura')
  }).toThrow(InvalidIndentationError)
})

/** Tests raising an error when indentation is not divisible by 2. */
test('indentation_not_divisible_by_2', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'not_divisible_by_2.ura')
  }).toThrow(InvalidIndentationError)
})
