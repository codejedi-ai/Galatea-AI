import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"

// Types
export interface AICompanion {
  id: string
  name: string
  age: number
  bio: string
  imageUrl: string
  personality: string[]
  interests: string[]
  conversationStyle: string
  createdAt: any
  updatedAt: any
}

export interface UserProfile {
  id: string
  userId: string
  displayName: string
  email: string
  preferences: {
    ageRange: [number, number]
    personalities: string[]
    interests: string[]
  }
  swipeHistory: {
    companionId: string
    action: "liked" | "passed"
    timestamp: any
  }[]
  matches: string[] // Array of companion IDs
  createdAt: any
  updatedAt: any
}

export interface SwipeSession {
  id: string
  userId: string
  companionIds: string[]
  currentIndex: number
  decisions: {
    companionId: string
    action: "liked" | "passed"
    timestamp: any
  }[]
  completed: boolean
  createdAt: any
}

// AI Companions CRUD operations
export const companionsService = {
  // Get all companions
  async getAll(): Promise<AICompanion[]> {
    try {
      const companionsRef = collection(db, "companions")
      const snapshot = await getDocs(query(companionsRef, orderBy("createdAt", "desc")))
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AICompanion)
    } catch (error) {
      console.error("Error fetching companions:", error)
      throw new Error("Failed to fetch companions")
    }
  },

  // Get companion by ID
  async getById(id: string): Promise<AICompanion | null> {
    try {
      const companionRef = doc(db, "companions", id)
      const snapshot = await getDoc(companionRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as AICompanion
      }
      return null
    } catch (error) {
      console.error("Error fetching companion:", error)
      throw new Error("Failed to fetch companion")
    }
  },

  // Create new companion
  async create(companion: Omit<AICompanion, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const companionsRef = collection(db, "companions")
      const docRef = await addDoc(companionsRef, {
        ...companion,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating companion:", error)
      throw new Error("Failed to create companion")
    }
  },

  // Update companion
  async update(id: string, updates: Partial<Omit<AICompanion, "id" | "createdAt">>): Promise<void> {
    try {
      const companionRef = doc(db, "companions", id)
      await updateDoc(companionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating companion:", error)
      throw new Error("Failed to update companion")
    }
  },

  // Delete companion
  async delete(id: string): Promise<void> {
    try {
      const companionRef = doc(db, "companions", id)
      await deleteDoc(companionRef)
    } catch (error) {
      console.error("Error deleting companion:", error)
      throw new Error("Failed to delete companion")
    }
  },

  // Get companions for swiping (excluding already swiped ones)
  async getForSwiping(userId: string, excludeIds: string[] = []): Promise<AICompanion[]> {
    try {
      const companionsRef = collection(db, "companions")
      const snapshot = await getDocs(query(companionsRef, orderBy("createdAt", "desc")))
      const allCompanions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AICompanion)

      // Filter out already swiped companions
      return allCompanions.filter((companion) => !excludeIds.includes(companion.id))
    } catch (error) {
      console.error("Error fetching companions for swiping:", error)
      throw new Error("Failed to fetch companions for swiping")
    }
  },
}

// User Profile operations
export const userProfileService = {
  // Get user profile
  async get(userId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(db, "userProfiles", userId)
      const snapshot = await getDoc(profileRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as UserProfile
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw new Error("Failed to fetch user profile")
    }
  },

  // Create or update user profile
  async createOrUpdate(
    userId: string,
    profile: Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    try {
      const profileRef = doc(db, "userProfiles", userId)
      const existingProfile = await getDoc(profileRef)

      if (existingProfile.exists()) {
        await updateDoc(profileRef, {
          ...profile,
          updatedAt: serverTimestamp(),
        })
      } else {
        await setDoc(profileRef, {
          ...profile,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error creating/updating user profile:", error)
      throw new Error("Failed to update user profile")
    }
  },

  // Add swipe to history
  async addSwipe(userId: string, companionId: string, action: "liked" | "passed"): Promise<void> {
    try {
      const profileRef = doc(db, "userProfiles", userId)
      await updateDoc(profileRef, {
        swipeHistory: arrayUnion({
          companionId,
          action,
          timestamp: serverTimestamp(),
        }),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error adding swipe:", error)
      throw new Error("Failed to record swipe")
    }
  },

  // Add match
  async addMatch(userId: string, companionId: string): Promise<void> {
    try {
      const profileRef = doc(db, "userProfiles", userId)
      await updateDoc(profileRef, {
        matches: arrayUnion(companionId),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error adding match:", error)
      throw new Error("Failed to add match")
    }
  },

  // Remove match
  async removeMatch(userId: string, companionId: string): Promise<void> {
    try {
      const profileRef = doc(db, "userProfiles", userId)
      await updateDoc(profileRef, {
        matches: arrayRemove(companionId),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error removing match:", error)
      throw new Error("Failed to remove match")
    }
  },

  // Get user's swiped companion IDs
  async getSwipedCompanionIds(userId: string): Promise<string[]> {
    try {
      const profile = await this.get(userId)
      return profile?.swipeHistory.map((swipe) => swipe.companionId) || []
    } catch (error) {
      console.error("Error fetching swiped companion IDs:", error)
      return []
    }
  },

  // Get user's matches
  async getMatches(userId: string): Promise<AICompanion[]> {
    try {
      const profile = await this.get(userId)
      if (!profile || !profile.matches.length) return []

      const matchPromises = profile.matches.map((companionId) => companionsService.getById(companionId))
      const matches = await Promise.all(matchPromises)
      return matches.filter((match) => match !== null) as AICompanion[]
    } catch (error) {
      console.error("Error fetching matches:", error)
      throw new Error("Failed to fetch matches")
    }
  },
}

// Swipe Session operations
export const swipeSessionService = {
  // Create new swipe session
  async create(userId: string, companionIds: string[]): Promise<string> {
    try {
      const sessionsRef = collection(db, "swipeSessions")
      const docRef = await addDoc(sessionsRef, {
        userId,
        companionIds,
        currentIndex: 0,
        decisions: [],
        completed: false,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating swipe session:", error)
      throw new Error("Failed to create swipe session")
    }
  },

  // Get swipe session
  async get(sessionId: string): Promise<SwipeSession | null> {
    try {
      const sessionRef = doc(db, "swipeSessions", sessionId)
      const snapshot = await getDoc(sessionRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as SwipeSession
      }
      return null
    } catch (error) {
      console.error("Error fetching swipe session:", error)
      throw new Error("Failed to fetch swipe session")
    }
  },

  // Update swipe session
  async update(sessionId: string, updates: Partial<Omit<SwipeSession, "id" | "createdAt">>): Promise<void> {
    try {
      const sessionRef = doc(db, "swipeSessions", sessionId)
      await updateDoc(sessionRef, updates)
    } catch (error) {
      console.error("Error updating swipe session:", error)
      throw new Error("Failed to update swipe session")
    }
  },

  // Add decision to session
  async addDecision(sessionId: string, companionId: string, action: "liked" | "passed"): Promise<void> {
    try {
      const sessionRef = doc(db, "swipeSessions", sessionId)
      await updateDoc(sessionRef, {
        decisions: arrayUnion({
          companionId,
          action,
          timestamp: serverTimestamp(),
        }),
      })
    } catch (error) {
      console.error("Error adding decision:", error)
      throw new Error("Failed to record decision")
    }
  },
}

// Initialize default companions (run this once to populate the database)
export const initializeDefaultCompanions = async (): Promise<void> => {
  const defaultCompanions = [
    {
      name: "Athena",
      age: 25,
      bio: "Goddess of wisdom and strategic warfare. Let's have some intellectual battles!",
      imageUrl: "/images/galatea-2.png",
      personality: ["intellectual", "strategic", "wise", "confident"],
      interests: ["philosophy", "strategy games", "history", "debate"],
      conversationStyle: "thoughtful and analytical",
    },
    {
      name: "Mekkana",
      age: 23,
      bio: "Goddess of modernity, progress and intellect!",
      imageUrl: "/images/galatea-1.png",
      personality: ["modern", "progressive", "innovative", "energetic"],
      interests: ["technology", "innovation", "future trends", "science"],
      conversationStyle: "enthusiastic and forward-thinking",
    },
    {
      name: "Iris",
      age: 24,
      bio: "Goddess of the rainbow. Bringing color to your life!",
      imageUrl: "/images/galatea-3.png",
      personality: ["colorful", "optimistic", "creative", "joyful"],
      interests: ["art", "creativity", "nature", "positivity"],
      conversationStyle: "warm and encouraging",
    },
    {
      name: "Hera",
      age: 28,
      bio: "Queen of the gods. Looking for someone who can keep up with divine drama.",
      imageUrl: "/images/galatea-1.png",
      personality: ["regal", "dramatic", "powerful", "sophisticated"],
      interests: ["leadership", "drama", "luxury", "relationships"],
      conversationStyle: "commanding and passionate",
    },
    {
      name: "Aphrodite",
      age: 26,
      bio: "Goddess of love and beauty. Swipe right for an unforgettable romance!",
      imageUrl: "/images/galatea-2.png",
      personality: ["romantic", "charming", "beautiful", "passionate"],
      interests: ["romance", "beauty", "relationships", "art"],
      conversationStyle: "flirtatious and enchanting",
    },
    {
      name: "Artemis",
      age: 22,
      bio: "Goddess of the hunt and moon. Seeking an adventurous spirit!",
      imageUrl: "/images/galatea-3.png",
      personality: ["adventurous", "independent", "wild", "protective"],
      interests: ["hunting", "nature", "adventure", "wildlife"],
      conversationStyle: "bold and direct",
    },
    {
      name: "Demeter",
      age: 30,
      bio: "Goddess of agriculture. Let's grow something beautiful together.",
      imageUrl: "/images/galatea-1.png",
      personality: ["nurturing", "patient", "grounded", "caring"],
      interests: ["gardening", "nature", "sustainability", "cooking"],
      conversationStyle: "gentle and nurturing",
    },
    {
      name: "Persephone",
      age: 21,
      bio: "Queen of the underworld. Dark and mysterious, with a sweet side.",
      imageUrl: "/images/galatea-2.png",
      personality: ["mysterious", "complex", "sweet", "powerful"],
      interests: ["mysteries", "seasons", "transformation", "depth"],
      conversationStyle: "intriguing and layered",
    },
    {
      name: "Hecate",
      age: 27,
      bio: "Goddess of magic and crossroads. Let's cast a spell together!",
      imageUrl: "/images/galatea-3.png",
      personality: ["magical", "wise", "mysterious", "intuitive"],
      interests: ["magic", "mysticism", "crossroads", "wisdom"],
      conversationStyle: "mystical and profound",
    },
    {
      name: "Nike",
      age: 24,
      bio: "Goddess of victory. Always up for a challenge!",
      imageUrl: "/images/galatea-1.png",
      personality: ["competitive", "victorious", "energetic", "determined"],
      interests: ["competition", "sports", "achievement", "motivation"],
      conversationStyle: "motivating and competitive",
    },
  ]

  try {
    for (const companion of defaultCompanions) {
      await companionsService.create(companion)
    }
    console.log("Default companions initialized successfully!")
  } catch (error) {
    console.error("Error initializing default companions:", error)
  }
}
