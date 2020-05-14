/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import {useRef} from 'react'
import useModel, {defaultSettings} from './useModel'
import Tutorial, {
  TutorialFacebook,
  TutorialTwitter,
  TutorialWhatsapp,
} from './Tutorial'
import ChatUploader from './ChatUploader'
import ChatSettingSliders from './ChatSettingSliders'
import ChatViz from './ChatViz'
import ChatTranscript from './ChatTranscript'

const ChatSelector = ({chats, onSelect}) => {
  return (
    <div>
      <ul>
        {chats.map((c, i) => {
          const providerName = {
            facebook: 'Facebook',
            twitter: 'Twitter',
            whatsapp: 'WhatsApp',
          }[c.provider]
          const p0 = c.participants[0].name
          const p1 = c.participants[1].name
          const title = p0 + ' & ' + p1 + ' (' + providerName + ')'
          return (
            <li key={i}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onSelect(c)
                }}
              >
                {title}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const App = () => {
  const vizRef = useRef(null)
  const logRef = useRef(null)
  const {
    page,
    chats,
    selectedChat,
    settings,
    redrawNonce,
    navigate,
    addChats,
    selectChat,
    updateSettings,
  } = useModel()

  const linkStyle = css`
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  `

  return (
    <div
      css={css`
        padding: 2rem;
        max-width: 1350px;
        @media (max-width: 750px) {
          padding: 1rem;
        }

        p,
        h2 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
      `}
    >
      <div
        css={css`
          text-align: center;
          margin-bottom: 2rem;
          & > * {
            margin: 0;
          }
        `}
      >
        <h1
          css={css`
            margin: 0;
            padding-bottom: 0.1em;
          `}
        >
          Closeness Lines
        </h1>
        <p>A tool to show how your relationships evolve and change over time</p>
        {!!chats.length && (
          <p>
            <span css={linkStyle} onClick={() => navigate('tutorial')}>
              Tutorial
            </span>{' '}
            •{' '}
            <span
              css={linkStyle}
              onClick={() => {
                selectChat(null)
                navigate('chat')
              }}
            >
              Conversations
            </span>
          </p>
        )}
      </div>
      {page === 'tutorial' && (
        <Tutorial
          onUploadChats={(chats) => {
            addChats(chats)
            navigate('chat')
          }}
          navigate={navigate}
        />
      )}
      {page === 'tutorial_facebook' && (
        <TutorialFacebook
          goBack={() => navigate('tutorial')}
          onUploadChats={(chats) => {
            addChats(chats)
            navigate('chat')
          }}
        />
      )}
      {page === 'tutorial_twitter' && (
        <TutorialTwitter
          goBack={() => navigate('tutorial')}
          onUploadChats={(chats) => {
            addChats(chats)
            navigate('chat')
          }}
        />
      )}
      {page === 'tutorial_whatsapp' && (
        <TutorialWhatsapp
          goBack={() => navigate('tutorial')}
          onUploadChats={(chats) => {
            addChats(chats)
            navigate('chat')
          }}
        />
      )}
      {page === 'chat' && <ChatUploader onUpload={addChats} />}
      {page === 'chat' && !selectedChat && (
        <ChatSelector chats={chats} onSelect={selectChat} />
      )}
      {page === 'chat' && selectedChat && (
        <div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <div
              css={css`
                button {
                  margin: 5px;
                }
              `}
            >
              <button
                type="button"
                onClick={() => {
                  vizRef.current.download()
                }}
              >
                <strong>Download</strong>
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings(defaultSettings, 'full')
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({flipped: !settings.flipped}, 'full')
                }}
              >
                Flip
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSettings({contour: !settings.contour}, 'full')
                }}
              >
                {settings.contour ? 'Hide' : 'Show'} Contours
              </button>
            </div>
            <ChatSettingSliders
              value={settings}
              onChange={(settings) => updateSettings(settings, 'linesFast')}
            />
          </div>
          <ChatViz
            ref={vizRef}
            chat={selectedChat}
            settings={settings}
            updateSettings={updateSettings}
            redrawNonce={redrawNonce}
            onHoverDate={(date) => {
              logRef.current.scrollToDate(date)
            }}
          />
          <ChatTranscript
            ref={logRef}
            chat={selectedChat}
            selectedRange={settings.selectedRange}
          />
        </div>
      )}
    </div>
  )
}

export default App
