import {useState} from 'react'

const defaultPage = 'tutorial'

const defaultSettings = {
  flipped: false,
  closenessDamping: 0.13,
  scaling: 0.51,
  logScaling: 30,
  bandwidthBias: -0.2,
  bandwidthVariance: 0.2,
  selectedRange: null,
  contour: false,
}

const settingsMinMax = {
  closenessDamping: [0, 0.65],
  scaling: [0.49, 0.6],
  logScaling: [1, 90],
  bandwidthBias: [-1.5, 1.5],
  bandwidthVariance: [0.001, 0.5],
}

const defaultNonce = {
  linesFast: 0,
  linesSlow: 0,
  full: 1,
}

const unique = (array, getKey) => {
  const hashmap = {}
  array.forEach((v) => {
    hashmap[getKey(v)] = v
  })
  return Object.values(hashmap)
}

const tidyChats = (chats) => {
  // Promote the participant who appears in the most unique chats to the first
  // position of the "participants" array, causing them to appear in a consisent
  // position when plotted. This person is probably whoever's uploading the chats
  // in the first place
  const pHashmap = {}
  chats.forEach((c) => {
    const p0 = c.participants[0].name
    const p1 = c.participants[1].name
    if (!pHashmap[p0]) pHashmap[p0] = 0
    if (!pHashmap[p1]) pHashmap[p1] = 0
    pHashmap[p0]++
    pHashmap[p1]++
  })
  const pSorted = Object.keys(pHashmap).sort((a, b) => {
    return pHashmap[b] - pHashmap[a]
  })
  chats = chats.map((c) => {
    const swap =
      pSorted.indexOf(c.participants[0].name) >
      pSorted.indexOf(c.participants[1].name)
    if (!swap) return c
    return {...c, participants: [c.participants[1], c.participants[0]]}
  })

  // Sort the chats by conversation volume
  chats = chats.slice().sort((a, b) => b.messages.length - a.messages.length)
  chats = chats.filter((c) => c.messages.length >= 10)

  return chats
}

const useModel = () => {
  const [page, setPage] = useState(defaultPage)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [redrawNonce, setRedrawNonce] = useState(defaultNonce)

  return {
    page,
    chats: tidyChats(chats),
    selectedChat,
    settings,
    redrawNonce,
    navigate: (page) => setPage(page),
    addChats: (newChats) => {
      setChats((oldChats) => {
        const combinedChats = unique(
          oldChats.concat(newChats),
          (chat) => chat.key
        )
        return combinedChats
      })
      setSettings((settings) => ({
        ...settings,
        selectedRange: null,
        flipped: false,
      }))
      setSelectedChat(newChats.length === 1 ? newChats[0] : null)
      setRedrawNonce((redrawNonce) => ({...redrawNonce, full: Date.now()}))
      setPage('chat')
    },
    selectChat: (chat) => {
      setSettings((settings) => ({...settings, selectedRange: null}))
      setRedrawNonce((redrawNonce) => ({...redrawNonce, full: Date.now()}))
      setSelectedChat(chat)
    },
    updateSettings: (update, redrawMode = 'full') => {
      setSettings((settings) => ({...settings, ...update}))
      setRedrawNonce((redrawNonce) => ({
        ...redrawNonce,
        [redrawMode]: Date.now(),
      }))
    },
  }
}

export {defaultSettings, settingsMinMax}
export default useModel
