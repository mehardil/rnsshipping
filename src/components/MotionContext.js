import { createContext, useContext } from 'react'

export const MotionContext = createContext(true)
export const useMotionEnabled = () => useContext(MotionContext)
