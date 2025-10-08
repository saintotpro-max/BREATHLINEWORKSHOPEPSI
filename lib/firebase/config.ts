/**
 * Firebase Configuration
 * Centralized Firebase initialization and configuration
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getDatabase, Database } from "firebase/database"

// Firebase configuration from environment variables
const firebaseConfig = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Singleton instances
let app: FirebaseApp | null = null
let database: Database | null = null

/**
 * Initialize Firebase app (singleton pattern)
 */
export function initializeFirebase(): FirebaseApp {
  if (!app) {
    // Check if Firebase is already initialized
    const existingApps = getApps()
    if (existingApps.length > 0) {
      app = existingApps[0]
    } else {
      // Validate configuration
      if (!firebaseConfig.databaseURL || !firebaseConfig.projectId) {
        console.warn("[Firebase] Missing configuration. Multiplayer will not work.")
        throw new Error("Firebase configuration missing")
      }

      app = initializeApp(firebaseConfig)
      console.log("[Firebase] App initialized successfully")
    }
  }
  return app
}

/**
 * Get Firebase Realtime Database instance (singleton pattern)
 */
export function getFirebaseDatabase(): Database {
  if (!database) {
    const app = initializeFirebase()
    database = getDatabase(app)
    console.log("[Firebase] Database instance created")
  }
  return database
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

/**
 * Get Firebase configuration status for debugging
 */
export function getFirebaseStatus() {
  return {
    configured: isFirebaseConfigured(),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "NOT_SET",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NOT_SET",
  }
}
