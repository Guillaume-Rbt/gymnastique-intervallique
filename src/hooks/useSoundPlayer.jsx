import SoundPlayer from '../libs/SoundPlayer'
import notes from '../assets/sounds/notes.wav'
import { useMemo } from 'react'

const soundPlayer = new SoundPlayer(notes)

export default function useSoundPlayer() {
    const player = useMemo(() => soundPlayer, [soundPlayer])

    return player
}
