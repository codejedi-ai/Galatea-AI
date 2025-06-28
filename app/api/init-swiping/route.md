import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

type AIProfile = {
  uuid: string
  id: number
  name: string
  age: number
  bio: string
  imageUrl: string
}

const goddesses = [
  { name: "Mekkana", bio: "Goddess of modernity, progress and intellect!" },
  { name: "Athena", bio: "Goddess of wisdom and strategic warfare. Let's have some intellectual battles!" },
  { name: "Hera", bio: "Queen of the gods. Looking for someone who can keep up with divine drama." },
  { name: "Aphrodite", bio: "Goddess of love and beauty. Swipe right for an unforgettable romance!" },
  { name: "Artemis", bio: "Goddess of the hunt and moon. Seeking an adventurous spirit!" },
  { name: "Demeter", bio: "Goddess of agriculture. Let's grow something beautiful together." },
  { name: "Persephone", bio: "Queen of the underworld. Dark and mysterious, with a sweet side." },
  { name: "Hecate", bio: "Goddess of magic and crossroads. Let's cast a spell together!" },
  { name: "Iris", bio: "Goddess of the rainbow. Bringing color to your life!" },
  { name: "Nike", bio: "Goddess of victory. Always up for a challenge!" }
]

function generateProfiles(): AIProfile[] {
  const profiles: AIProfile[] = []
  for (let i = 0; i < 40; i++) {
    const goddessIndex = i % goddesses.length
    profiles.push({
      uuid: uuidv4(),
      id: i,
      name: goddesses[goddessIndex].name,
      age: Math.floor(Math.random() * (35 - 20) + 20),
      bio: goddesses[goddessIndex].bio,
      imageUrl: `/girl-profiles/a${i % 21}.png`
    })
  }
  return profiles
}

export async function GET() {
  const profiles = generateProfiles()
  return NextResponse.json(profiles)
}
