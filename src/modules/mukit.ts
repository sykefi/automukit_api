import { std, mean, round, sqrt, abs } from 'mathjs'
import Validator from './validator'
import { Range, Input, Result, Reference, Mode } from '../types'

export default class MUKit {
  private readonly input: Input
  private readonly precision: number

  constructor(input: Input, precision: number) {
    this.input = input
    this.precision = precision
  }

  calculateResult(range: Range): Result {
    const errors = Validator.validateRange(range)
    // Do not try to go any further if the range is invalid -> causes exceptions
    if (errors.length > 0) {
      return { range, errors }
    }

    const replicateSamples = this.resolveReplicateSamples(range)
    const refs = this.resolveReferences(range)

    if (replicateSamples.length < range.replicateSamplesMin) {
      errors.push(`Not enough replicate samples: ${replicateSamples.length} / ${range.replicateSamplesMin}`)
    }

    if (refs.length === 0) {
      errors.push('Suitable reference groups not found')
    } else {
      const controlSamplesCnt = refs.reduce((sum, ref) => ref.controlSamples.length + sum, 0)
      if (controlSamplesCnt < range.controlSamplesMin) {
        errors.push(`Not enough control samples: ${controlSamplesCnt} / ${range.controlSamplesMin}`)
      }
    }

    // Cannot calculate anything without enough replicateSamples or controlSamples
    if (errors.length > 0) {
      return { range, errors }
    }

    const pooledStd = this.calculatePooledStd(replicateSamples, range.mode)
    const stdRefData = this.calculateStdRefData(refs, range.mode)
    const uRw = sqrt(pooledStd ** 2 + stdRefData ** 2)
    const ub = this.calculateUb(refs, stdRefData, range.mode)

    const mu = sqrt(uRw ** 2 + ub ** 2)

    return {
      range,
      uRw: round(uRw, this.precision),
      ub: round(ub, this.precision),
      uncertainty: round(mu, this.precision),
      expandedUncertainty: round(mu * range.coverageFactor, this.precision)
    }
  }

  private calculatePooledStd(data: number[][], mode: Mode): number {
    const stds = this.calculateStds(data, mode)
    let sum = 0
    for (let i = 0; i < data.length; i ++) {
      sum += (data[i].length - 1) * stds[i] ** 2
    }
    const sampleCnt = data.reduce((sum, d) => sum + d.length, 0)
    return sqrt(sum / (sampleCnt - data.length))
  }

  private calculateUb(refs: Reference[], stdRefData: number, mode: Mode): number {
    const bs = this.calculateBiases(refs, mode)
    if (refs.length === 1) {
      // Only one reference group
      const ref = refs[0]
      let refValUP
      switch(mode) {
      case 'absolute':
        refValUP = ref.uncertainty
        break
      case 'relative':
        refValUP = ref.value !== 0 ? ref.uncertainty / ref.value * 100 : 0
        break
      }
      return sqrt(bs[0] ** 2 + (stdRefData / sqrt(ref.controlSamples.length)) ** 2 + refValUP ** 2)
    }
    // Multiple reference groups
    const RMSbias = sqrt(bs.reduce((sum, b) => sum + b ** 2, 0) / bs.length)
    const ucref = mean(refs.map(ref => {
      switch(mode) {
      case 'absolute':
        return ref.uncertainty
      case 'relative':
        return ref.value !== 0 ? ref.uncertainty / ref.value * 100 : 0
      }
    }))
    return sqrt(RMSbias ** 2 + ucref ** 2)
  }

  private calculateStdRefData(refs: Reference[], mode: Mode): number {
    switch(mode) {
    case 'absolute':
      return std(refs[0].controlSamples)
    case 'relative':
      return std(refs[0].controlSamples) / mean(refs[0].controlSamples) * 100
    }
  }

  // First reference has most data values
  private resolveReferences(range: Range): Reference[] {
    return this.input.references.filter(ref =>
      ref.value >= range.min && ref.value <= range.max
    ).sort((a, b) =>
      b.controlSamples.length - a.controlSamples.length
    )
  }

  private resolveReplicateSamples(range: Range): number[][] {
    return this.input.replicateSamples.filter(values =>
      values.some(v => v >= range.min && v <= range.max)
    )
  }

  private calculateBiases(refs: Reference[], mode: Mode): number[] {
    switch(mode) {
    case 'absolute':
      return refs.map(ref => abs(mean(ref.controlSamples) - ref.value))
    case 'relative':
      return refs.map(ref => abs(100 * (mean(ref.controlSamples) - ref.value) / ref.value))
    }
  }

  private calculateStds(data: number[][], mode: Mode): number[] {
    switch(mode) {
    case 'absolute':
      return data.map(values => std(values))
    case 'relative':
      return data.map(values => std(values) / mean(values) * 100)
    }
  }
}
