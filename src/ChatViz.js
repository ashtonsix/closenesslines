/** @jsx jsx */
import {jsx, css} from '@emotion/core'
import {useEffect, useRef, forwardRef, useImperativeHandle} from 'react'
import Plotly from 'plotly.js'
import {useDebouncedCallback} from 'use-debounce'
import getLines, {mixLines} from './getLines'

const plotify = ({data, title}) => ({
  x: data.map((d) => new Date(d[0])),
  y: data.map((d) => +d[1]),
  type: 'scatter',
  mode: 'lines',
  name: title,
  line: title
    ? {}
    : {
        color: 'grey',
        width: 0.25,
      },
  hoverinfo: 'none',
  showlegend: !!title,
})

let layout = {
  showlegend: true,
  margin: {
    l: 80,
    r: 80,
    b: 80,
    t: 100,
    pad: 0,
  },
  legend: {
    font: {
      size: 16,
    },
  },
  spikedistance: -1,
  xaxis: {
    rangeslider: {},
    tickfont: {
      size: 16,
    },
    showspikes: true,
    spikemode: 'across',
    spikecolor: 'grey',
    spikethickness: 1,
    spikedash: 'solid',
  },
  yaxis: {
    tickvals: [0.5],
    ticktext: ['50/50'],
    tickfont: {
      size: 16,
    },
    range: [0, 1],
    fixedrange: true,
  },
}

const adjustLayoutToDevice = () => {
  if (window.innerWidth > 1000) {
    layout.margin = {l: 80, r: 80, b: 80, t: 100, pad: 0}
    layout.yaxis.ticktext[0] = '50/50'
    layout.showlegend = true
  } else {
    layout.margin = {l: 20, r: 20, b: 80, t: 100, pad: 0}
    layout.yaxis.ticktext[0] = ''
    layout.showlegend = false
  }
}

adjustLayoutToDevice()

const slowDraw = {numSamples: 1500, histogramResolution: 5, normalBandwidth: 5}
const fastDraw = {numSamples: 750, histogramResolution: 5, normalBandwidth: 2}

const mixContourLines = ([lineA, lineB], fullContour) => {
  const countour50 = mixLines([lineA.data, lineB.data], [0.5, 0.5])

  if (!fullContour) {
    return [lineA, lineB, {data: countour50, title: 'Conversation Balance'}]
  }

  const countour10 = mixLines([lineA.data, lineB.data], [0.1, 0.9])
  const countour20 = mixLines([lineA.data, lineB.data], [0.2, 0.8])
  const countour30 = mixLines([lineA.data, lineB.data], [0.3, 0.7])
  const countour40 = mixLines([lineA.data, lineB.data], [0.4, 0.6])
  const countour43 = mixLines([lineA.data, lineB.data], [0.4333, 0.5667])
  const countour47 = mixLines([lineA.data, lineB.data], [0.4667, 0.5333])
  const countour53 = mixLines([lineA.data, lineB.data], [0.5333, 0.4667])
  const countour57 = mixLines([lineA.data, lineB.data], [0.5667, 0.4333])
  const countour60 = mixLines([lineA.data, lineB.data], [0.6, 0.4])
  const countour70 = mixLines([lineA.data, lineB.data], [0.7, 0.3])
  const countour80 = mixLines([lineA.data, lineB.data], [0.8, 0.2])
  const countour90 = mixLines([lineA.data, lineB.data], [0.9, 0.1])

  return [
    lineA,
    lineB,
    {data: countour10},
    {data: countour20},
    {data: countour30},
    {data: countour40},
    {data: countour43},
    {data: countour47},
    {data: countour50, title: 'Conversation Balance'},
    {data: countour53},
    {data: countour57},
    {data: countour60},
    {data: countour70},
    {data: countour80},
    {data: countour90},
  ]
}

const snakeCase = (str) => str.replace(/\s+/, '_').toLowerCase()

const ChatViz = forwardRef((props, handle) => {
  const {chat, settings, updateSettings, redrawNonce, onHoverDate} = props
  const {selectedRange} = settings
  const ref = useRef(null)
  const mouseEventRef = useRef({x: 0, y: 0})

  useImperativeHandle(handle, () => ({
    download: () =>
      Plotly.downloadImage(ref.current, {
        width: 1500,
        height: 800,
        format: 'png',
        filename: snakeCase(
          chat.participants[0].name + '+' + chat.participants[1].name
        ),
      }),
  }))

  useEffect(() => {
    window.addEventListener('resize', adjustLayoutToDevice)
    return () => window.removeEventListener('resize', adjustLayoutToDevice)
  }, [])

  useEffect(() => {
    if (!ref.current) return
    Plotly.react(ref.current, [], layout, {responsive: true})
    ref.current.on('plotly_relayout', (e) => {
      if (!e['xaxis.range[0]'] && !e['xaxis.range']?.[0]) {
        updateSettings({selectedRange: null}, 'linesSlow')
        return
      }
      updateSettings(
        {
          selectedRange: [
            +new Date(e['xaxis.range[0]'] || e['xaxis.range'][0]),
            +new Date(e['xaxis.range[1]'] || e['xaxis.range'][1]),
          ],
        },
        'linesSlow'
      )
    })
    ref.current.on('plotly_hover', (data) => {
      const date = data.xvals?.[0]
      if (!date) return

      // only trigger event on X-axis movement
      const deltaX = Math.abs(data.event.x - mouseEventRef.current.x)
      const deltaY = Math.abs(data.event.y - mouseEventRef.current.y) * 1.5
      mouseEventRef.current = data.event
      if (deltaY > deltaX) return

      onHoverDate(new Date(date))
    })
  }, [])

  const redrawLines = (speed, contour) => {
    let lines
    lines = getLines(chat, settings, speed, selectedRange)
    lines = mixContourLines(lines, contour)
    const x = lines.map((l) => l.data.map((v) => new Date(v[0])))
    const y = lines.map((l) => l.data.map((v) => v[1]))
    Plotly.restyle(ref.current, 'x', x)
    Plotly.restyle(ref.current, 'y', y)
  }

  const [redrawFast] = useDebouncedCallback(
    () => {
      redrawLines(fastDraw, false)
    },
    100,
    {maxWait: 250}
  )
  const [redrawSlow] = useDebouncedCallback(() => {
    redrawLines(slowDraw, settings.contour)
  }, 1000)

  useEffect(() => {
    if (!redrawNonce.linesFast) return
    redrawFast()
    redrawSlow()
  }, [redrawNonce.linesFast])

  useEffect(() => {
    if (!redrawNonce.linesSlow) return
    redrawSlow()
  }, [redrawNonce.linesSlow])

  useEffect(() => {
    if (!redrawNonce.full) return
    let lines
    lines = getLines(chat, settings, slowDraw, selectedRange)
    lines = mixContourLines(lines, settings.contour)
    const range = [lines[0].data[0][0], lines[0].data.slice(-1)[0][0]]
    if (!selectedRange) {
      // Plotly.js seems to have some weird bugs around resetting the range.
      // This hack zooms the user out upon switching chats but not otherwise.
      layout = {...layout, xaxis: {...layout.xaxis, range: range}}
    }
    Plotly.react(ref.current, lines.map(plotify), layout)
  }, [redrawNonce.full])

  return (
    <div
      ref={ref}
      css={css`
        display: inline-block;
        position: relative;
        height: 800px;
        max-height: 90vw;
        width: 112%;
        max-width: calc(100vw - 70px);
        @media (max-width: 1000px) {
          width: 100%;
          max-width: 100vw;
        }
      `}
    />
  )
})

export default ChatViz
