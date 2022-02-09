import { Range } from '../types'

export default class Validator {
  static validateInputFormat(input: any): string[] {
    const errors = []
    if (!Array.isArray(input.data)) {
      errors.push('"data" is not an array')
    }
    if (!Array.isArray(input.references)) {
      errors.push('"references" is not an array')
    } else {
      for (const ref of input.references) {
        if (this.isMissing(ref.value)) {
          errors.push('"value" is missing from reference')
        }
        if (this.isMissing(ref.uncertainty)) {
          errors.push('"uncertainty" is missing from reference')
        }
        if (!Array.isArray(ref.data)) {
          errors.push('"data" is not an array in reference')
        }
      }
    }
    if (!Array.isArray(input.ranges)) {
      errors.push('"ranges" is not an array')
    } else {
      for (const range of input.ranges) {
        if (this.isMissing(range.mode)) {
          errors.push('"mode" is missing from range')
        }
        if (this.isMissing(range.min)) {
          errors.push('"min" is missing from range')
        }
        if (this.isMissing(range.max)) {
          errors.push('"max" is missing from range')
        }
        if (this.isMissing(range.coverageFactor)) {
          errors.push('"coverageFactor" is missing from range')
        }
      }
    }
    return errors
  }

  static validateRange(range: Range): string[] {
    const errors = []
    if (isNaN(range.min)) {
      errors.push('Range "min" is not a number')
    }
    if (isNaN(range.max)) {
      errors.push('Range "max" is not a number')
    }
    if (isNaN(range.coverageFactor)) {
      errors.push('Range "coverageFactor" is not a number')
    }
    if (!['absolute', 'relative'].includes(range.mode)) {
      errors.push('Range "mode" is invalid')
    }
    if (errors.length > 0) {
      return errors
    }
    if (range.max < range.min) {
      errors.push('Range max is lesser than min')
    }
    return errors
  }

  private static isMissing(value: unknown): boolean {
    return value === undefined || value === null || value === ''
  }
}
