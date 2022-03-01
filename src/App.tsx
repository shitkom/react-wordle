import { useState, useEffect } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import {
  WIN_MESSAGES,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
} from './constants/strings'
import {
  MAX_WORD_LENGTH,
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  findFirstUnusedReveal,
  unicodeLength,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './lib/localStorage'
import { default as GraphemeSplitter } from 'grapheme-splitter'

import './App.css'
import { AlertContainer } from './components/alerts/AlertContainer'
import { useAlert } from './context/AlertContext'

function App() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')

  const [isRevealing, setIsRevealing] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.solution !== solution) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(solution.toUpperCase())

    if (gameWasWon) {
      setIsGameWon(true)
      setIsInfoModalOpen(true)
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setGuesses([])
      setCurrentGuess('')
    }
    return loaded.guesses
  })

  const [stats, setStats] = useState(() => loadStats())

  const isHardMode = localStorage.getItem('gameMode')
    ? localStorage.getItem('gameMode') === 'hard'
    : false
  const isDarkMode = localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : prefersDarkMode
    ? true
    : false

  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage()) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    document.documentElement.classList.remove('high-contrast')
  }, [isDarkMode])

  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  useEffect(() => {
    saveGameStateToLocalStorage({ guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH

      showSuccessAlert(winMessage, {
        delayMs,
      })
    }
  }, [isGameWon, showSuccessAlert])

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    )
  }

  const onEnter = () => {
    if (isGameWon) {
      return
    }

    if (!(unicodeLength(currentGuess) === MAX_WORD_LENGTH)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    if (!isWordInWordList(currentGuess)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    // enforce hard mode - all guesses must contain all previously revealed letters
    if (isHardMode) {
      const firstMissingReveal = findFirstUnusedReveal(currentGuess, guesses)
      if (firstMissingReveal) {
        setCurrentRowClass('jiggle')
        return showErrorAlert(firstMissingReveal, {
          onClose: clearCurrentRowClass,
        })
      }
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH)

    const winningWord = isWinningWord(currentGuess.toLowerCase())
    console.log(winningWord)

    if (
      unicodeLength(currentGuess) === MAX_WORD_LENGTH &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setIsInfoModalOpen(true)
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setGuesses([])
        setCurrentGuess('')
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: true,
          delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1,
        })
      }
    }
  }

  return (
    <div className="h-screen pt-2 px-1 pb-8 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
      <h1 className="text-5xl text-gray-500 dark:text-gray-300 w-full flex justify-center my-20">
        Hemmelig hem
      </h1>
      <div className="pb-6 grow">
        <Grid
          guesses={guesses}
          currentGuess={currentGuess}
          isRevealing={isRevealing}
          currentRowClassName={currentRowClass}
        />
      </div>
      <Keyboard
        onChar={onChar}
        onDelete={onDelete}
        onEnter={onEnter}
        guesses={guesses}
        isRevealing={isRevealing}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        gameWon={isGameWon}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <AlertContainer />
    </div>
  )
}

export default App
