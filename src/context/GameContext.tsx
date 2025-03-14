'use client'

import React, { createContext, useEffect, useRef, useState } from "react";

type GameFinishedType = {
    finished: boolean
    connect4Indexes: null | [number, number][]
    winner: null | boolean
}

const initialDisksInHolder: boolean[][] = [[], [], [], [], [], [], []];
const initialGameFinished: GameFinishedType = {
    finished: false,
    connect4Indexes: null,
    winner: null
}

const GameContext = createContext({
    isRedTurn: true,
    disksInHolder: initialDisksInHolder,
    addDisk: (colIndex: number) => { console.log(colIndex) },
    checkConnectFour: (colIndex: number, rowIndex: number, disk: boolean) => { console.log(colIndex, rowIndex, disk) },
    redWinCount: 0,
    yellowWinCount: 0,
    newGame: () => {},
    restart: () => {},
    gameFinished: initialGameFinished
})

const GameProvider = ({ children }: {
    children: React.ReactNode
}) => {
    // 'true' represents red. 'false' represents yellow.
    const [isRedTurn, setIsRedTurn] = useState(true);
    const [disksInHolder, setDisksInHolder] = useState<boolean[][]>(initialDisksInHolder);

    const [redWinCount, setRedWinCount] = useState(0);
    const [yellowWinCount, setYellowWinCount] = useState(0);
    const [gameFinished, setGameFinished] = useState<GameFinishedType>(initialGameFinished);

    const wasRedFirst = useRef(isRedTurn);

    // When there's no argument, it's the case when the timer is done and the disk is added randomly.
    function addDisk(colIndex: number) {
        if (disksInHolder[colIndex].length >= 6) return

        const disk = isRedTurn ? true : false;

        const newState = [...disksInHolder];
        newState[colIndex] = [...newState[colIndex], disk];
        setDisksInHolder(newState);
    }

    function checkConnectFour(colIndex: number, rowIndex: number, disk: boolean) {
        const countDisks = (colStep: number, rowStep: number) => {
            const indexesArr: [number, number][] = [[colIndex, rowIndex]];

            let nextColIndex = colIndex + colStep;
            let nextRowIndex = rowIndex + rowStep;
            while (
                nextColIndex >= 0 &&
                nextColIndex < 7 &&
                nextRowIndex >= 0 &&
                nextRowIndex < 6 &&
                disksInHolder[nextColIndex][nextRowIndex] === disk
            ) {
                indexesArr.push([nextColIndex, nextRowIndex]);
                nextColIndex = nextColIndex + colStep;
                nextRowIndex = nextRowIndex + rowStep
            }

            // check the opposite direction
            const oppositeColStep = colStep * -1;
            const oppositeRowStep = rowStep * -1;
            nextColIndex = colIndex + oppositeColStep;
            nextRowIndex = rowIndex + oppositeRowStep;
            while (
                nextColIndex >= 0 &&
                nextColIndex < 7 &&
                nextRowIndex >= 0 &&
                nextRowIndex < 6 &&
                disksInHolder[nextColIndex][nextRowIndex] === disk
            ) {
                indexesArr.push([nextColIndex, nextRowIndex]);
                nextColIndex = nextColIndex + oppositeColStep;
                nextRowIndex = nextRowIndex + oppositeRowStep
            }
            if (indexesArr.length >= 4) {   
                return indexesArr
            }
        }

        const directions = [
            [-1, 1],    // diagonal
            [-1, 0],    // horizontal
            [-1, -1],   // diagonal
            [0, -1]     // vertical
        ]

        for (let i = 0; i < directions.length; i++) {
            const indexesArr = countDisks(directions[i][0], directions[i][1]);
            if (indexesArr) {
                setGameFinished({ 
                    finished: true, 
                    connect4Indexes: indexesArr,
                    winner: disk
                })
                console.log(indexesArr)
                if (disk) {
                    setRedWinCount(prev => prev + 1);
                } else {
                    setYellowWinCount(prev => prev + 1);
                }
                return
            }
        }
        setIsRedTurn(prevState => !prevState)
    }

    function newGame() {
        setDisksInHolder(initialDisksInHolder);
        setGameFinished(initialGameFinished);

        const isRedFirst = wasRedFirst.current ? false : true;
        setIsRedTurn(isRedFirst);
        wasRedFirst.current = isRedFirst;
    }

    function restart() {
        setIsRedTurn(true)
        setDisksInHolder(initialDisksInHolder);
        setRedWinCount(0);
        setYellowWinCount(0);
        setGameFinished(initialGameFinished);
        wasRedFirst.current = true;
    }

    useEffect(() => {
        if (disksInHolder.every(col => col.length >= 6)) {
            newGame();
        }
    }, [disksInHolder])

    return (
        <GameContext.Provider value={{ 
            isRedTurn,
            disksInHolder, 
            addDisk, 
            checkConnectFour,
            redWinCount, 
            yellowWinCount, 
            newGame, 
            restart, 
            gameFinished 
        }}>
            {children}
        </GameContext.Provider>
    )
}

export { GameContext, GameProvider }