'use client'

import React, { createContext, useRef, useState } from "react";
import type { Holder } from "@/lib/holder";
import { emptyHolder } from "@/lib/holder";

type GameFinishedType = {
    finished: boolean
    connect4Indexes: null | [number, number][]
    winner: null | boolean
}

const initGameFinished: GameFinishedType = {
    finished: false,
    connect4Indexes: null,
    winner: null
}

const GameContext = createContext({
    isRedTurn: true,
    disksInHolder: emptyHolder,
    addDisk: (colIndex: number) => { console.log(colIndex) },
    checkGameFinish: (colIndex: number) => { console.log(colIndex) },
    redWinCount: 0,
    yellowWinCount: 0,
    newGame: () => {},
    restart: () => {},
    cpuMove: (): number => { return 1 },
    availableCols: (holder: Holder) => { return [1] },
    gameFinished: initGameFinished
})

const GameProvider = ({ children }: {
    children: React.ReactNode
}) => {
    // 'true' represents red. 'false' represents yellow.
    const [isRedTurn, setIsRedTurn] = useState(true);
    const [disksInHolder, setDisksInHolder] = useState<Holder>(emptyHolder);

    const [redWinCount, setRedWinCount] = useState(0);
    const [yellowWinCount, setYellowWinCount] = useState(0);
    const [gameFinished, setGameFinished] = useState<GameFinishedType>(initGameFinished);

    const redFirst = useRef(isRedTurn);

    function findPlayer(holder: Holder) {
        // If red, return 'true', else return 'false'
        const diskCount = holder.reduce((sum, col) => {
            return sum + col.filter(row => row !== null).length
        }, 0)
        if (redFirst.current) {
            return diskCount % 2 === 0
        } else {
            return diskCount % 2 === 1
        }
    }

    function play(colIndex: number, holder: Holder, isRed?: boolean): Holder {
        const result = []
        for (let i = 0; i < holder.length; i++) {
            const col = [...holder[i]]
            result.push(col)
        }
        const disk = (isRed != undefined) ? isRed : findPlayer(holder)

        const nextRowIndex = result[colIndex].findIndex(disk => disk === null)
        result[colIndex][nextRowIndex] = disk
        return result as Holder
    }

    function addDisk(colIndex: number) {
        if (disksInHolder[colIndex][5] != null) return

        const newState = play(colIndex, disksInHolder, isRedTurn)
        if (newState) {
            setDisksInHolder(newState)
        }
    }

    // 'col index' of the last-added disk 
    function checkConnect4(colIn: number, holder: Holder) {   
        const rowIn = holder[colIn].findLastIndex(disk => typeof disk === 'boolean')   
        const disk = holder[colIn][rowIn]
        
        const directions = [
            [-1, 1],    // diagonal
            [-1, 0],    // horizontal
            [-1, -1],   // diagonal
            [0, -1]     // vertical
        ]
        const countDisks = (colStep: number, rowStep: number) => {
            const indexesArr: [number, number][] = [[colIn, rowIn]];

            let nextColIndex = colIn + colStep;
            let nextRowIndex = rowIn + rowStep;
            while (
                nextColIndex >= 0 &&
                nextColIndex < 7 &&
                holder[nextColIndex][nextRowIndex] === disk
            ) {
                indexesArr.push([nextColIndex, nextRowIndex]);
                nextColIndex = nextColIndex + colStep;
                nextRowIndex = nextRowIndex + rowStep
            }

            // check the opposite direction
            nextColIndex = colIn - colStep;
            nextRowIndex = rowIn - rowStep;
            while (
                nextColIndex >= 0 &&
                nextColIndex < 7 &&
                holder[nextColIndex][nextRowIndex] === disk
            ) {
                indexesArr.push([nextColIndex, nextRowIndex]);
                nextColIndex = nextColIndex - colStep;
                nextRowIndex = nextRowIndex - rowStep
            }
            if (indexesArr.length >= 4) {  
                // Has connect 4! Return the indexes of connect 4. 
                return indexesArr
            }
        }

        for (let i = 0; i < directions.length; i++) {
            const indexesArr = countDisks(directions[i][0], directions[i][1]);
            if (indexesArr) {
                return { 
                    finished: true, 
                    connect4Indexes: indexesArr,
                    winner: disk
                }
            }
        }

        if (holder.every(col => col[5] !== null)) {
            return { 
                finished: true,
                winner: null
            } 
        } else {
            return { finished: false }
        }
    }

    function checkGameFinish(colIndex: number) {
        const checkResult = checkConnect4(colIndex, disksInHolder)

        if (checkResult.finished && checkResult.winner != null) {
            setGameFinished(checkResult)
            if (checkResult.winner) {
                // red win           
                setRedWinCount(prev => prev + 1);
            } else {
                // yellow win
                setYellowWinCount(prev => prev + 1);
            }
        } else if (checkResult.finished) {
            // No winner

            // need te set this state to trigger the computer's turn when the computer go first in the new game
            setGameFinished(prev => {
                return { ...prev, finished: true }
            })
            newGame(); 
        } else {
            // The game goes on
            setIsRedTurn(prevState => !prevState);
        }
    }

    function availableCols(holder: Holder) {
        const result = []

        // Loop through all 7 columns
        for (let i = 0; i <= 6; i++) {
            if (holder[i][5] === null) {
                result.push(i)
            }
        }
        return result
    }

    function evalHolder(holder: Holder) {
        let score = 0

        const canBreathe = (colIn: number, rowIn: number) => {
            if (holder[colIn][rowIn + 1] === null) {
                return true
            }
            let sideCol = colIn - 1
            if (sideCol >= 0) {
                for (let i = -1; i <= 1; i++) {
                    if (holder[sideCol][rowIn + i] === null) {
                        return true
                    }
                }
            }          
            sideCol = colIn + 1   // other side
            if (sideCol <= 6) {
                for (let i = -1; i <= 1; i++) {
                    if (holder[sideCol][rowIn + i] === null) {
                        return true
                    }
                }
            }           
            return false
        }

        const directions = [[0, -1], [1, -1], [1, 0], [1, 1]]

        for (let col = 0; col <= 6; col++) {
            // row index of the top disk
            let row = holder[col].findLastIndex(disk => typeof disk === 'boolean')

            while (row >= 0 && canBreathe(col, row)) {
                const disk = holder[col][row] 
                let sub_score = 0
                
                for (let di of directions) {
                    let connect = 1

                    let opCol = col - di[0]   // col in the opposite direction
                    let opRow = row - di[1]   // row in the opposite direction

                    // Check if this alignment is not already checked in previous column
                    if (holder[opCol] !== undefined && holder[opCol][opRow] === disk) {
                        if (canBreathe(opCol, opRow)) {
                            // checked in previous column
                            continue
                        } 
                        opCol -= di[0]
                        opRow -= di[1] 
                        // sub_score += Math.pow(3, connect)
                        connect++
                        if (holder[opCol] !== undefined && holder[opCol][opRow] === disk) {
                            if (canBreathe(opCol, opRow)) {
                                // already checked in 2 previous column
                                continue
                            }
                            opCol -= di[0]
                            opRow -= di[1] 
                            // sub_score += Math.pow(3, connect)
                            connect++
                        }
                        // It's ugly, I know ... 
                        // (because of 'continue' keyword, I can't wrap these inside 'for' loop)
                    }

                    let emptyFound = false
                    for (let x = 1; x <= 6; x++) {  // Likely to be stopped before it complete all loops
                        const currCol = (di[0] * x) + col
                        if (currCol > 6) {
                            break
                        }
                        const currRow = (di[1] * x) + row
                        const checkDisk = holder[currCol][currRow]

                        if (checkDisk === disk) {
                            // sub_score += Math.pow(3, connect)
                            connect++
                            continue
                        } else if (
                            checkDisk === null && 
                            !emptyFound && 
                            holder[currCol + di[0]] !== undefined &&
                            holder[currCol + di[0]][currRow + di[1]] === disk  // check next slot if it's the same disk (if it's not the same and continue the loop, the col-row index will be off)
                        ) {
                            // Empty slot, but still has potential
                            emptyFound = true
                            continue
                        }

                        sub_score += Math.pow(3, connect)
                        // Loop will break soon ...

                        // undefined (edge) or opponent disk or empty slot
                        if (connect > 1) {
                            // if the alignment is surrounded by blank, the score is incresed even more
                            if (holder[opCol] !== undefined && holder[opCol][opRow] === null) {
                                sub_score += Math.pow(2, connect)
                            }
                            if (holder[currCol] !== undefined && holder[currCol][currRow] === null) {
                                sub_score += Math.pow(2, connect)
                            }
                        }
                        break;
                    }
                }
                score = disk ? (score + sub_score) : (score - sub_score)
                row--
            }
        }
        return score
    }

    function minimax(colIndex: number, holder: Holder, stepAhead=0) {
        const checkResult = checkConnect4(colIndex, holder)
        
        if (checkResult.finished) {
            if (checkResult.winner === null) {
                // tie
                return 0
            } else if (checkResult.winner === true) {
                // red (max player) win
                return 10000 
            } else {
                // yellow (min player) win
                // Also force CPU to pick the move that will let it win the fastest
                return -10000 - (5 - stepAhead)
            }
        }

        if (findPlayer(holder)) {
            // red (max player) turn
            let v = -Infinity

            if (stepAhead >= 5) {
                // When it's already 5 steps ahead, 'evaluate' the game state instead.
                for (let col of availableCols(holder)) {
                    const nextHolder = play(col, holder, true)
                    v = Math.max(v, evalHolder(nextHolder))
                }
                return v
            } else {
                for (let col of availableCols(holder)) {
                    const nextHolder = play(col, holder, true)                  
                    v = Math.max(v, minimax(col, nextHolder, stepAhead + 1))

                    if (v === 10000) break
                }
                return v
            }
        } else {
            // yellow (min player) turn
            let v = Infinity
    
            if (stepAhead >= 5) {
                for (let col of availableCols(holder)) {
                    const nextHolder = play(col, holder, false)
                    v = Math.min(v, evalHolder(nextHolder))
                }
                return v
            } else {
                for (let col of availableCols(holder)) {
                    const nextHolder = play(col, holder, false)
                    v = Math.min(v, minimax(col, nextHolder, stepAhead + 1))

                    if (v === -10000) break
                }
                return v
            }
            
        }
    }

    function cpuMove() {
        let moves = []
        
        const possibleCols = availableCols(disksInHolder)
        for (let col of possibleCols) {
            const nextHolder = play(col, disksInHolder)
            const move = {
                col: col,
                score: minimax(col, nextHolder)
            }
            moves.push(move)
        }
        console.log('all', moves)
        
        const minScore = Math.min(...moves.map(m => m.score))
        moves = moves.filter(m => m.score === minScore)
        
        console.log('better moves', moves)
        return moves[Math.floor(Math.random() * moves.length)].col
    }

    function newGame() {
        const newRedFirst = !redFirst.current 
        setIsRedTurn(newRedFirst);
        redFirst.current = newRedFirst;

        setDisksInHolder(emptyHolder);
        setGameFinished(initGameFinished);
    }

    function restart() {
        setIsRedTurn(true)
        setDisksInHolder(emptyHolder);
        setRedWinCount(0);
        setYellowWinCount(0);
        setGameFinished(initGameFinished);
        redFirst.current = true;
    }

    return (
        <GameContext.Provider value={{ 
            isRedTurn,
            disksInHolder, 
            addDisk, 
            checkGameFinish,
            redWinCount, 
            yellowWinCount, 
            newGame, 
            restart, 
            cpuMove,
            availableCols,
            gameFinished
        }}>
            {children}
        </GameContext.Provider>
    )
}

export { GameContext, GameProvider }