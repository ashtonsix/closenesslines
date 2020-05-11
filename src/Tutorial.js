/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import tutorialExplainer from './images/tutorial_explainer.png'
import tutorialControls from './images/tutorial_controls.png'
import ChatUploader from './ChatUploader'
import facebook0 from './images/facebook_0.png'
import facebook1 from './images/facebook_1.png'
import twitter from './images/twitter.png'
import whatsapp0 from './images/whatsapp_0.png'
import whatsapp1 from './images/whatsapp_1.png'
import whatsapp2 from './images/whatsapp_2.png'
import whatsapp3 from './images/whatsapp_3.png'
import whatsapp4 from './images/whatsapp_4.png'
import happySun from './images/happy_sun.png'
import eyebrowPeople from './images/eyebrow_people.png'

const linkStyle = css`
  color: blue;
  text-decoration: underline;
  cursor: pointer;
`

const Tutorial = ({onUploadChats, navigate}) => {
  return (
    <div>
      <img
        css={css`
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem 0rem;
        `}
        src={tutorialExplainer}
        alt=""
      />
      <p>Above is a conversation between me (blue) and my friend (orange):</p>
      <ol>
        <li>I reach out to say ‘Hello! How’s it going?’</li>
        <li>He replies to tell me about his week</li>
        <li>We talk back and forth for a bit</li>
      </ol>
      <ChatUploader onUpload={onUploadChats} />
      <h2>
        <strong>How does it work?</strong>
      </h2>
      <p style={{marginBottom: '2rem'}}>
        By counting messages sent across{' '}
        <span css={linkStyle} onClick={() => navigate('tutorial_facebook')}>
          <strong>Facebook Messenger</strong>
        </span>
        ,{' '}
        <span css={linkStyle} onClick={() => navigate('tutorial_twitter')}>
          <strong>Twitter DMs</strong>
        </span>{' '}
        or{' '}
        <span css={linkStyle} onClick={() => navigate('tutorial_whatsapp')}>
          <strong>WhatsApp</strong>
        </span>
        . (click for export instructions)
      </p>
      <h2>
        <strong>Why did you make it?</strong>
      </h2>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        I was inspired by{' '}
        <a href="https://www.instagram.com/drawingolive/" target="_blank">
          Olivia de Recat
        </a>
        ’s artwork,{' '}
        <a
          href="https://www.oliviaderecat.com/shop/closeness-lines-print"
          target="_blank"
        >
          <em>Closeness Lines Over Time</em>
        </a>
        , and want to give people the impetus to reconnect with those they
        haven’t spoken to in a long time. Looking at the lines which represent
        my own relationships made me feel like an astronaut looking at Earth
        from space, the lines gave me a new perspective. It helped me realise
        just how important my friends and family are and showed me that each
        relationship is unique and valuable and ever-changing.
      </p>
      <h2>What are the controls for?</h2>
      <img
        src={tutorialControls}
        css={css`
          max-width: 100%;
          margin: 0 auto;
          padding: 0rem 0rem 1rem;
        `}
        alt=""
      />
      <p
        css={css`
          max-width: 700px;
        `}
      >
        Data by itself cannot teach us anything. Because truth is subjective.
        Pulling <em>Bandwidth Variance</em> to the right tells one story; And
        pulling it to the left tells another story. The interplay between
        statistics and perception and storytelling is fascinating, and imposing
        some default settings upon your story would be an injustice to memory.
      </p>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        As you pull the controls this way and that you should try finding the
        closest representation that captures the relationship as you remember
        it. I can’t articulate what each control does. But if you experiment and{' '}
        <em>play</em> they’ll soon make sense.
      </p>
      <h2>What about my privacy?</h2>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        Conversation intoxicates, plucks heartstrings, transcends. It’d be
        immoral for me to track or pry or peruse such intimate data without
        consent. This tool does not store any information. You can turn your
        internet connection off, right now, and it’ll still work.
      </p>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        In the interest of full disclosure, when you export your{' '}
        <strong>Twitter DMs</strong> they replace each contact’s name with a
        number like ‘28018’, and, upon your behalf, this tool sends those
        numbers back to Twitter to get the original names, like ‘Jessica’.
        Besides that, no data will leave your computer.
      </p>
      <h2>Who are you?</h2>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        Ashton Six, a software engineer who loves humanity.
      </p>
      <p
        css={css`
          max-width: 700px;
        `}
      >
        You can contact me for any reason whatsoever, from seeking my advice to
        telling me about your experience with this tool. I have a{' '}
        <a href="https://ashtonsix.com" target="_blank">
          website
        </a>
        ,{' '}
        <a href="https://ashtonsix.com/resume" target="_blank">
          resume
        </a>
        ,{' '}
        <a href="https://twitter.com/AshtonSix" target="_blank">
          Twitter
        </a>{' '}
        and{' '}
        <a href="mailto:me@ashtonsix.com" target="_blank">
          email address
        </a>
        .
      </p>
      <h2>Who else contributed?</h2>
      <p>
        My tutor,{' '}
        <a href="https://www.linkedin.com/in/periwynkle/" target="_blank">
          Dr Yin Yin Lu
        </a>
        , and my therapist,{' '}
        <a href="https://www.jongee.co.uk/" target="_blank">
          Jon Gee
        </a>
        . Thank you both 😊
      </p>
    </div>
  )
}

const TutorialFacebook = ({goBack, onUploadChats}) => {
  return (
    <div>
      <button onClick={goBack}>Go Back</button>
      <br />
      <br />
      <h2>Exporting your data from Facebook Messenger</h2>
      <img
        src={facebook0}
        alt=""
        css={css`
          border: 1px solid #999;
          width: 900px;
          height: 437px;
        `}
      />
      <div
        css={css`
          display: flex;
          align-items: center;
          width: 900px;
          img {
            margin: 0 auto;
          }
        `}
      >
        <ol>
          <li>
            Go:
            <br />
            <em
              css={css`
                display: inline-block;
                padding-left: 5px;
              `}
            >
              <a href="https://facebook.com/" target="_blank">
                Facebook.com
              </a>{' '}
              ⇒<br />
              Top-Right, Arrow thing ⇒<br />
              Settings & privacy ⇒<br />
              Settings ⇒<br />
              Left, Your Facebook information ⇒<br />
              Download your information
            </em>
          </li>
          <li>Keep going...</li>
        </ol>
        <img src={eyebrowPeople} alt="" />
      </div>
      <img
        src={facebook1}
        alt=""
        css={css`
          border: 1px solid #999;
          width: 900px;
          height: 412px;
        `}
      />
      <div
        css={css`
          display: flex;
          align-items: center;
          width: 900px;
        `}
      >
        <ol start={3}>
          <li>
            <em>Deselect all</em>
          </li>
          <li>
            <em>Select Messages (might have to scroll down)</em>
          </li>
          <li>
            <em>Pick JSON format</em>
          </li>
          <li>
            <em>Pick low quality media</em>
          </li>
          <li>
            <em>Create File</em>
          </li>
          <li>Check your email in, like, an hour...</li>
        </ol>
        <ChatUploader onUpload={onUploadChats}>
          <strong>Put the ZIP here</strong>
        </ChatUploader>
      </div>
    </div>
  )
}

const TutorialTwitter = ({goBack, onUploadChats}) => {
  return (
    <div>
      <button onClick={goBack}>Go Back</button>
      <br />
      <br />
      <h2>Exporting your data from Twitter DMs</h2>
      <img
        src={twitter}
        alt=""
        css={css`
          border: 1px solid #999;
          width: 950px;
          height: 481px;
        `}
      />
      <div
        css={css`
          display: flex;
          align-items: center;
          width: 952px;
        `}
      >
        <ol>
          <li>
            Go to{' '}
            <a href="https://twitter.com/" target="_blank">
              Twitter.com
            </a>
          </li>
          <li>
            Go:
            <br />
            <em
              css={css`
                display: inline-block;
                padding-left: 5px;
              `}
            >
              More ⇒<br />
              Settings and privacy ⇒<br />
              Data usage ⇒<br />
              Your Twitter data ⇒<br />
              Download archive
            </em>
          </li>
          <li>Wait, like, 24 hours</li>
          <li>Check your email</li>
        </ol>
        <ChatUploader onUpload={onUploadChats}>
          <strong>Put the ZIP here</strong>
        </ChatUploader>
      </div>
    </div>
  )
}
const TutorialWhatsapp = ({goBack, onUploadChats}) => {
  return (
    <div>
      <button onClick={goBack}>Go Back</button>
      <br />
      <br />
      <h2>Exporting your data from WhatsApp</h2>
      <div
        css={css`
          max-width: 970px;
          & > * {
            margin: 10px;
            border: 1px solid #999;
            width: 300px;
            height: 617px;
          }
        `}
      >
        <div
          css={css`
            display: inline-block;
            vertical-align: top;
          `}
        >
          <div
            css={css`
              padding-left: 20px;
              padding-right: 20px;
              ol {
                padding-left: 17px;
              }
              li {
                padding-bottom: 8px;
              }
            `}
          >
            <ol>
              <li>Get your phone</li>
              <li>Open a conversation</li>
              <li>
                Go:
                <br />
                <em
                  css={css`
                    display: inline-block;
                    padding-left: 5px;
                  `}
                >
                  Dots ⇒<br />
                  More ⇒<br />
                  Export chat ⇒<br />
                  Without media
                </em>
              </li>
              <li>Email the file to yourself</li>
            </ol>
            <ChatUploader onUpload={onUploadChats}>
              <strong>Put it here</strong>
            </ChatUploader>
            <img
              css={css`
                display: block;
                margin: 0 auto;
                padding-top: 25px;
                opacity: 0.75;
              `}
              src={happySun}
              alt=""
            />
          </div>
        </div>
        <img src={whatsapp0} alt="" />
        <img src={whatsapp1} alt="" />
        <img src={whatsapp2} alt="" />
        <img src={whatsapp3} alt="" />
        <img src={whatsapp4} alt="" />
      </div>
    </div>
  )
}

export {TutorialFacebook, TutorialTwitter, TutorialWhatsapp}
export default Tutorial
