/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import React, {useRef, useImperativeHandle, useEffect} from 'react'
import {format as formatDate, isSameDay} from 'date-fns'
import {useDebouncedCallback} from 'use-debounce/lib'
import binarySearch from './binarySearch'

const DateHeaderRow = ({datetime, fade}) => {
  return (
    '<tr data-datetime="' +
    datetime.toISOString() +
    '">' +
    '<td colspan="2" style="padding: 10px 0px;' +
    (fade ? ' opacity: 0.8; background-color: #999;' : '') +
    '">' +
    formatDate(datetime, 'dd MMMM yyyy') +
    '</td>' +
    '</tr>'
  )
}
const MessageRow = ({message, fade, bold}) => {
  return (
    '<tr style="vertical-align: top;' +
    (bold ? 'font-weight: bold;' : '') +
    (fade ? ' opacity: 0.8; background-color: #999;' : '') +
    '" data-datetime="' +
    message.datetime.toISOString() +
    '">' +
    '<td style="padding-right: 5px;">' +
    formatDate(message.datetime, '[HH:mm]:') +
    '</td>' +
    '<td>' +
    '<span style="display:inline-block; max-width: 650px;">' +
    message.message +
    '</span>' +
    '</td>' +
    '</tr>'
  )
}

const ChatTranscript = React.forwardRef(({chat, selectedRange}, handle) => {
  const ref = useRef(null)

  useImperativeHandle(handle, () => ({
    scrollToDate: (date) => {
      const rows = ref.current.querySelectorAll('tr')
      const rowDates = Array.from(rows).map(
        (r) => +new Date(r.dataset.datetime)
      )
      const row = rows[binarySearch(rowDates, date) + 1]
      if (!row) return
      ref.current.scrollTo({top: row.offsetTop})
    },
  }))

  const [redraw] = useDebouncedCallback(
    () => {
      let messages = ''
      chat.messages.forEach((m, i) => {
        const prev = chat.messages[i - 1]
        const newDay = !isSameDay(prev?.datetime, m.datetime)
        const bold = m.sender === chat.participants[0].name
        const as = +m.datetime > +new Date(selectedRange?.[1] || '2030')
        const bs = +m.datetime < +new Date(selectedRange?.[0] || 0)
        const fade = as || bs
        if (newDay) messages += DateHeaderRow({datetime: m.datetime, fade})
        messages += MessageRow({message: m, bold, fade})
      })
      ref.current.querySelector('tbody').innerHTML = messages
    },
    500,
    {leading: true, trailing: true}
  )

  useEffect(() => {
    redraw()
  }, [chat, selectedRange])

  return (
    <div>
      <h2>Transcript</h2>
      <div
        ref={ref}
        css={css`
          height: 600px;
          overflow-y: scroll;
        `}
      >
        <table
          css={css`
            width: 100%;
            border-spacing: 0;
          `}
        >
          <tbody></tbody>
        </table>
      </div>
    </div>
  )
})

export default ChatTranscript
