import binarySearch from './binarySearch'

const fastNormal = (x) => {
  return Math.exp(-Math.pow(x, 2))
}

const normal = (x, mean, variance) => {
  var m = Math.sqrt(variance) * Math.sqrt(2 * Math.PI)
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance))
  return e / m
}

const reduceBetween = (f, values, start, end, startValue) => {
  let pv = startValue
  const startIndex = binarySearch(values, start)
  const endIndex = binarySearch(values, end)
  for (let i = startIndex; i <= endIndex; i++) {
    pv = f(pv, values[i], i)
  }
  return pv
}

const histogram = (input, nBuckets, [first, last]) => {
  const interval = (last - first) / nBuckets
  const timestamps = []
  const values = []
  let j = 0
  let time = first
  for (let i = 0; i < nBuckets; i++) {
    time += interval
    let value = 0
    while (j < input.length && input[j].t < time) {
      if (input[j].t >= first) value += input[j].v
      j++
    }
    if (value) {
      timestamps.push(time - interval / 2)
      values.push(value)
    }
  }
  return [timestamps, values]
}

const KDE = (timestamps, samples, bandwidth, optimisation) => {
  const [hTimestamps, hValues] = histogram(
    timestamps,
    samples.length * optimisation.histogramResolution,
    [samples[0], samples.slice(-1)[0]]
  )
  return samples.map((sample, i) => {
    return [
      sample,
      reduceBetween(
        (avg, timestamp, i) => {
          const value = fastNormal((sample - timestamp) / bandwidth)
          return avg + value * (hValues[i] || 1)
        },
        hTimestamps,
        sample - bandwidth * optimisation.normalBandwidth,
        sample + bandwidth * optimisation.normalBandwidth,
        0
      ) || 0,
    ]
  })
}

const timeInterval = (start, end, numTicks) => {
  const ticks = []
  const interval = Math.ceil((end - start) / (numTicks - 1))
  for (let i = 0; i < numTicks; i++) {
    ticks.push(start + interval * i)
  }
  return ticks
}

const mixLines = (lines, weights) => {
  const mix = lines[0].map(([t], i) => {
    const value = weights.reduce((value, _, j) => {
      const v = lines[j][i][1]
      const w = weights[j]
      return value + v * w
    }, 0)
    return [t, value]
  })
  return mix
}

const mapY = (line, f) => line.map(([x, y], i) => [x, f(y, i)])

const logSequence = (baseValue, count) => {
  const sequence = []
  for (let i = 0; i < count; i++) {
    sequence.push(baseValue)
    baseValue /= 2
  }
  return sequence
}

const centerCrop = (lineA, lineB, padding = 0) => {
  const both = [].concat(lineA, lineB).map((v) => v[1])
  let min = Math.min(...both)
  let max = Math.max(...both)
  if (min > 1 - max) {
    min = 1 - max
  } else {
    max = 1 - min
  }
  const p = padding
  lineA = mapY(lineA, (v) => ((v - min) / (max - min)) * (1 - p * 2) + p)
  lineB = mapY(lineB, (v) => ((v - min) / (max - min)) * (1 - p * 2) + p)
  return [lineA, lineB]
}

const getLines = (chat, settings = {}, optimisation = {}, sampleRange) => {
  const {
    flipped,
    closenessDamping,
    scaling,
    logScaling,
    bandwidthBias,
    bandwidthVariance,
  } = settings
  const messages = chat.messages
  const senderA = chat.participants[flipped ? 1 : 0].name
  const senderB = chat.participants[flipped ? 0 : 1].name

  const timestampsAll = messages.map((m) => +m.datetime)
  let timeStart = timestampsAll[0]
  let timeEnd = timestampsAll.slice(-1)[0]
  timeStart -= (timeEnd - timeStart) / 20
  timeEnd += (timeEnd - timeStart) / 20
  if (!sampleRange) sampleRange = [timeStart, timeEnd]

  const baseBandwidth = timeEnd - timeStart
  const bandwidthCount = 25
  const bandwidths = logSequence(baseBandwidth, bandwidthCount)
  const bandwidthMixture = new Array(bandwidthCount)
    .fill(undefined)
    .map((_, i) =>
      normal(
        (i / (bandwidthCount - 1)) * 2 - 1,
        bandwidthBias,
        bandwidthVariance
      )
    )

  const timestampsA = messages
    .filter((m) => m.sender === senderA)
    .map((m) => ({t: +m.datetime, v: m.message.length}))
  const timestampsB = messages
    .filter((m) => m.sender === senderB)
    .map((m) => ({t: +m.datetime, v: m.message.length}))

  let lineA, lineB
  lineA = mixLines(
    bandwidths.map((b) => {
      return KDE(
        timestampsA,
        timeInterval(sampleRange[0], sampleRange[1], optimisation.numSamples),
        b,
        optimisation
      )
    }),
    bandwidthMixture
  )
  lineB = mixLines(
    bandwidths.map((b) => {
      return KDE(
        timestampsB,
        timeInterval(sampleRange[0], sampleRange[1], optimisation.numSamples),
        b,
        optimisation
      )
    }),
    bandwidthMixture
  )

  let maxDensity, avgDensity
  maxDensity = Math.max(...[].concat(lineA, lineB).map((d) => d[1]))
  lineA = mapY(lineA, (y) => (y / maxDensity) * 0.85 + 0.15)
  lineB = mapY(lineB, (y) => (y / maxDensity) * 0.85 + 0.15)
  lineA = mapY(lineA, (y) => y ** (1 / Math.E ** logScaling))
  lineB = mapY(lineB, (y) => y ** (1 / Math.E ** logScaling))
  ;[lineA, lineB] = centerCrop(lineA, lineB)

  // scaling affects area rather than the max, which orthogonalises it from logScaling
  const ns = optimisation.numSamples * 2
  avgDensity = [].concat(lineA, lineB).reduce((pv, v) => pv + v[1], 0) / ns
  maxDensity = Math.max(...[].concat(lineA, lineB).map((d) => d[1]))
  lineA = mapY(lineA, (y) => (y / avgDensity) * (scaling / 2))
  lineB = mapY(lineB, (y) => (y / avgDensity) * (scaling / 2))

  // scaling only affects the max when the lines are especially "spiky" and would exceed 1 at points
  const densityCeiling = -(Math.E ** -scaling) / 2 + 1
  maxDensity = Math.max(...[].concat(lineA, lineB).map((d) => d[1]))
  if (maxDensity > densityCeiling) {
    lineA = mapY(lineA, (y) => (y / maxDensity) * densityCeiling)
    lineB = mapY(lineB, (y) => (y / maxDensity) * densityCeiling)
  }

  // flip lineB
  lineB = mapY(lineB, (y) => 1 - y)

  // add gap
  ;[lineA, lineB] = centerCrop(lineA, lineB)
  const closeness = lineA.map((_, i) => lineA[i][1] - lineB[i][1])
  lineA = mapY(lineA, (y, i) => {
    const cd = closenessDamping
    const c = closeness[i] + cd
    if (c < 0) return y
    const r = (1 - Math.E ** -(c / cd)) * cd
    const d = (c - r) / 2
    return y - d
  })
  lineB = mapY(lineB, (y, i) => {
    const cd = closenessDamping
    const c = closeness[i] + cd
    if (c < 0) return y
    const r = (1 - Math.E ** -(c / cd)) * cd
    const d = (c - r) / 2
    return y + d
  })

  // 0.01-0.99 looks best in Plotly
  ;[lineA, lineB] = centerCrop(lineA, lineB, 0.01)

  return [
    {data: lineA, title: senderA},
    {data: lineB, title: senderB},
  ]
}

const getLinesWithInsetRange = (
  chat,
  settings = {},
  optimisation = {},
  insetRange
) => {
  const [lineA, lineB] = getLines(chat, settings, optimisation)
  if (!insetRange) return [lineA, lineB]
  const [insetA, insetB] = getLines(chat, settings, optimisation, insetRange)
  let loA, hiA, loB, hiB
  // prettier-ignore
  loA = binarySearch(lineA.data.map(v => v[0]), insetRange[0]) - 1
  // prettier-ignore
  hiA = binarySearch(lineA.data.map(v => v[0]), insetRange[1]) + 2
  // prettier-ignore
  loB = binarySearch(lineB.data.map(v => v[0]), insetRange[0]) - 1
  // prettier-ignore
  hiB = binarySearch(lineB.data.map(v => v[0]), insetRange[1]) + 2
  loA = Math.max(loA, 0)
  loB = Math.max(loB, 0)
  hiA = Math.min(hiA, lineA.data.length)
  hiB = Math.min(hiB, lineB.data.length)
  if (insetA.data[0][1]) lineA.data.splice(loA, hiA - loA, ...insetA.data)
  if (insetB.data[0][1]) lineB.data.splice(loB, hiB - loB, ...insetB.data)
  return [lineA, lineB]
}

export {mixLines}
export default getLinesWithInsetRange
