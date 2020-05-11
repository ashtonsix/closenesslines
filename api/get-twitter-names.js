import Twitter from 'twitter-lite'

const client = new Twitter({bearer_token: process.env.TWITTER_BEARER})

export default async (req, res) => {
  const twitterResponse = await client.post('users/lookup', {
    user_id: req.body.ids.join(','),
  })
  const users = {}
  twitterResponse.forEach((u) => {
    users[u.id] = u.name
  })
  res.json(users)
}
