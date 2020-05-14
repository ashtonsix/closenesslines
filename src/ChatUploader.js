/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import React, {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileUpload} from '@fortawesome/free-solid-svg-icons'
import JSZip from 'jszip'
import {parse as parseDate} from 'date-fns'
import axios from 'axios'

const getFileProvider = async (file) => {
  if (!file) throw new Error('Cannot see file')
  if (file.type === 'text/plain') {
    const text = await file.text()
    return [text, 'whatsapp']
  }
  if (file.type === 'application/zip') {
    const zip = await JSZip.loadAsync(file)
    if (!!zip.files['data/direct-messages.js']) return [zip, 'twitter']
    if (!!zip.files['messages/inbox/']) return [zip, 'facebook']
    throw new Error('Cannot understand zip file contents')
  }
  throw new Error('Cannot read this file type')
}

const parseFacebookChats = async (zip) => {
  const regex = /messages\/[a-z_]+\/[a-z0-9_]+\/[a-z0-9_]+\.json/g
  const files = Object.keys(zip.files).filter((f) => regex.test(f))
  const texts = await Promise.all(files.map((f) => zip.file(f).async('string')))
  const json = texts.map((t) => JSON.parse(t))
  const chats = json
    .filter((j) => j.thread_type === 'Regular' && j.messages.length >= 10)
    .map((j) =>
      j.messages.map((m) => ({
        sender: m.sender_name,
        datetime: new Date(m.timestamp_ms),
        message: m.content,
      }))
    )
  return chats
}

const parseTwitterChats = async (zip) => {
  let text
  text = await zip.file('data/direct-messages.js').async('string')
  text = text.slice(text.indexOf('['))
  const senderIdCounts = {}
  const json = JSON.parse(text)
  const chats = json.map((c) =>
    c.dmConversation.messages.map(({messageCreate: m}) => {
      if (!senderIdCounts[m.senderId]) senderIdCounts[m.senderId] = 0
      senderIdCounts[m.senderId] += 1
      return {
        sender: m.senderId,
        datetime: new Date(m.createdAt),
        message: m.text,
      }
    })
  )
  const senderIds = Object.keys(senderIdCounts)
    .sort((a, b) => {
      return senderIdCounts[b] - senderIdCounts[a]
    })
    .slice(0, 100)
  try {
    const response = await Promise.race([
      axios.post('/api/get-twitter-names', {ids: senderIds}),
      new Promise((resolve) => setTimeout(() => resolve({}), 5000)),
    ])
    const senderNameMap = response.data
    chats.forEach((messages) => {
      messages.forEach((m) => {
        m.sender = senderNameMap[m.sender]
      })
    })
  } catch (e) {}
  return chats
}

const parseWhatsappChats = async (text) => {
  const textMessage = text.split(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} - [\w ]+: /g)
  const textMeta = text.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} - [\w ]+: /g)
  textMessage.shift()

  const messages = []
  for (let i = 0; i < textMessage.length; i++) {
    const parts = textMeta[i].match(/^(.+) - ([\w ]+): /)
    if (!parts) continue
    const [, datetimeRaw, sender] = parts
    const datetime = parseDate(datetimeRaw, 'dd/LL/y, HH:mm', new Date())
    messages.push({datetime, sender, message: textMessage[i]})
  }
  const chats = [messages]
  return chats
}

const parsers = {
  facebook: parseFacebookChats,
  twitter: parseTwitterChats,
  whatsapp: parseWhatsappChats,
}

const processChat = (messages, provider) => {
  messages = messages.filter((m) => m.datetime && m.sender && m.message)
  // delete messages not sent by the two most prolific participants in a chat
  const senders = {}
  messages.forEach((m) => {
    if (!senders[m.sender]) senders[m.sender] = 0
    senders[m.sender]++
  })
  const [senderA, senderB] = Object.keys(senders).sort((a, b) => {
    return senders[b] - senders[a]
  })
  messages = messages.filter(
    (m) => m.sender === senderA || m.sender === senderB
  )

  messages.sort((a, b) => +a.datetime - +b.datetime)

  const participants = [{name: senderA}, {name: senderB}]
  const key = senderA + '-' + senderB + '-' + messages.length
  return {provider, participants, key, messages}
}

const readChats = async (file) => {
  const [content, provider] = await getFileProvider(file)
  let chatMessages = await parsers[provider](content)
  const chats = chatMessages.map((m) => processChat(m, provider))

  return chats
}

const ChatUploader = ({
  onUpload,
  children = (
    <React.Fragment>
      <strong>Choose a file</strong> or drag it here
    </React.Fragment>
  ),
}) => {
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (files) => {
    try {
      const chats = await Promise.all(
        Array.from(files).map((file) => readChats(file))
      )
      onUpload([].concat(...chats))
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div
      css={css`
        margin: 20px auto;
        width: 400px;
        max-width: 100%;
        text-align: center;
      `}
    >
      <div
        {...getRootProps()}
        css={css`
          height: 80px;
          border: 1px solid #999;
          display: flex;
          align-items: center;
          justify-content: center;
          ${isDragActive && 'box-shadow:   0 0 0 3px rgba(0, 123, 255, .5);'}
        `}
      >
        <input {...getInputProps()} />
        <span>
          <FontAwesomeIcon icon={faFileUpload} /> {children}
        </span>
      </div>
      {!!error && (
        <span
          css={css`
            color: red;
            padding-top: 8px;
            display: inline-block;
          `}
        >
          Sorry, but I couldn't read/understand that file
        </span>
      )}
    </div>
  )
}

export default ChatUploader
