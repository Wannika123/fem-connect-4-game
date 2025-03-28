import { GameContext } from "@/context/GameContext";
import { useContext } from "react";
import styles from './Timer.module.css';
import { TimerContext } from "@/context/TimerContext";

type Props = {
    mode: 'player' | 'cpu'
}

export default function Timer({ mode }: Props) {
    const { isRedTurn, gameFinished, newGame } = useContext(GameContext);
    const { time } = useContext(TimerContext)


    let label = '';
    if (mode === 'cpu') {
        label = isRedTurn ? "your turn" : "cpu's turn";
    } else {
        label = isRedTurn ? "player 1's turn" : "player 2's turn";
    }

    let winner = '';
    if (gameFinished.winner !== null) {
        if (mode === 'cpu') {
            winner = gameFinished.winner ? "you" : "cpu";
        } else {
            winner = gameFinished.winner ? "player 1" : "player 2";
        }
    }

    return (
        <>
            { !gameFinished.finished &&
                <div className={isRedTurn ? styles['red-turn'] : styles['yellow-turn']}>
                    <p className={styles.label}>{label}</p>
                    <h1>{time}s</h1>
                </div>
            }
            { gameFinished.finished &&
                <div className={styles['finished-container']}>
                    <div className={styles.winner}>{winner}</div>
                    <h1>WINS</h1>
                    <button onClick={newGame}>play again</button>
                </div>
            }
        </>
    )
}