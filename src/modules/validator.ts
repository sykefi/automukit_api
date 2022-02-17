import { Range } from '../types'

export default class Validator {
  static validateInputFormat(input: any): string[] {
    const errors = []
    if (!Array.isArray(input.replicateSamples)) {
      errors.push('"replicateSamples" is not an array')
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
        if (!Array.isArray(ref.controlSamples)) {
          errors.push('"controlSamples" is not an array in reference')
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
        if (this.isMissing(range.replicateSamplesMin)) {
          errors.push('"replicateSamplesMin" is missing from range')
        }
        if (this.isMissing(range.controlSamplesMin)) {
          errors.push('"controlSamplesMin" is missing from range')
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
    if (isNaN(range.coverageFactor) || range.coverageFactor <= 0) {
      errors.push('Range "coverageFactor" is not a number > 0')
    }
    if (isNaN(range.replicateSamplesMin) || range.replicateSamplesMin <= 0) {
      errors.push('Range "replicateSamplesMin" is not a number > 0')
    }
    if (isNaN(range.controlSamplesMin) || range.controlSamplesMin <= 0) {
      errors.push('Range "controlSamplesMin" is not a number > 0')
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
