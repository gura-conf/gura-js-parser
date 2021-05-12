import { getFileContentParsed } from '../utils'

const parentFolder = 'arrays'

const expected = {
  colors: ['red', 'yellow', 'green'],
  integers: [1, 2, 3],
  integers_with_new_line: [1, 2, 3],
  nested_arrays_of_ints: [[1, 2], [3, 4, 5]],
  nested_mixed_array: [[1, 2], ['a', 'b', 'c']],
  numbers: [0.1, 0.2, 0.5, 1, 2, 5],
  tango_singers: [{
    user1: {
      name: 'Carlos',
      surname: 'Gardel',
      testing_nested: {
        nested_1: 1,
        nested_2: 2
      },
      year_of_birth: 1890
    }
  }, {
    user2: {
      name: 'Aníbal',
      surname: 'Troilo',
      year_of_birth: 1914
    }
  }],
  mixed_with_object: [
    1,
    { test: { genaro: 'Camele' } },
    2,
    [4, 5, 6],
    3
  ]
}

/** Tests all kind of arrays. */
test('array_normal', () => {
  const parsedData = getFileContentParsed(parentFolder, 'normal.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests all kind of arrays with comments between elements. */
test('array_normal_with_comments', () => {
  const parsedData = getFileContentParsed(parentFolder, 'with_comments.ura')
  expect(parsedData).toEqual(expected)
})
