export type Mode = 'relative' | 'absolute'

export interface Range {
  mode: Mode
  min: number
  max: number
  coverageFactor: number
  replicateSamplesMin: number
  controlSamplesMin: number
}

export interface Reference {
  value: number
  uncertainty: number
  controlSamples: number[]
}

export interface Input {
  replicateSamples: number[][]
  references: Reference[]
  ranges: Range[]
}

export interface Result {
  range: Range
  uRw?: number
  ub?: number
  uncertainty?: number
  expandedUncertainty?: number
  errors?: string[]
}
