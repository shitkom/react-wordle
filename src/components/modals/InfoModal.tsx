import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  gameWon: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose, gameWon }: Props) => {
  if (gameWon)
    return (
      <BaseModal
        title="Seniorkom endrer navn til BACKLOG!"
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <p className="my-2 text-sm text-gray-500 dark:text-gray-500">
          <span className="font-bold">Backlog:</span> A large stick of wood,
          forming the of a fire on the hearth.[U.S.]There was first a backlog,
          from fifteen to four and twenty inches indiameter and five feet long,
          imbedded in the ashes. S. G. Goodrich.
        </p>

        <p className="mb-5 text-gray-500 dark:text-gray-300">
          Komiteen har endret struktur og fått ny interne retningslinjer. For å
          fremheve disse endringene så endrer vi også navn til 'Backlog'
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSd_KNs1YSb_nAVNaiNzpaygziSd2UOCSdGAJotwjzcKA9vTow/viewform?usp=sf_link"
          className="text-gray-300 dark:text-gray-700 bg-bgblue dark:bg-gray-300 rounded px-4 py-2 font-bold"
        >
          Søk backlog!
        </a>
      </BaseModal>
    )

  return (
    <BaseModal title="How to play" isOpen={isOpen} handleClose={handleClose}>
      <p className="text-sm text-gray-500 dark:text-gray-300">
        Guess the word in 6 tries. After each guess, the color of the tiles will
        change to show how close your guess was to the word.
      </p>
    </BaseModal>
  )
}
