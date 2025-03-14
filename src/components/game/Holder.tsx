import { GameContext } from "@/context/GameContext";
import { TimerContext } from "@/context/TimerContext";
import ResponsiveImg from "../ResponsiveImg";
import whiteBgSmall from '@/assets/images/board-layer-white-small.svg';
import whiteBgLarge from '@/assets/images/board-layer-white-large.svg';
import blackBgSmall from '@/assets/images/board-layer-black-small.svg';
import blackBgLarge from '@/assets/images/board-layer-black-large.svg';
import markerRed from '@/assets/images/marker-red.svg';
import markerYellow from '@/assets/images/marker-yellow.svg';
import Image from "next/image";
import styles from './Holder.module.css'
import { useContext, useEffect, useRef, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import Timer from "./Timer";

type Props = {
    mode: 'player' | 'cpu'
}

export default function Holder({ mode }: Props) {
    const { isRedTurn, disksInHolder, addDisk, checkConnectFour, gameFinished } = useContext(GameContext);
    const { done: timerDone, startTimer, pauseTimer } = useContext(TimerContext);

    const [animating, setAnimating] = useState(false);
    const [focusIndex, setFocusIndex] = useState<number>();

    // I hv no idea how to animate responsively, so there'll be the animation only in large tablet and desktop version
    const { width } = useWindowSize();

    const lastAddedCol = useRef<null | number>(null);
    const newlyAddedDisk = useRef<HTMLDivElement>(null);

    let ypos: number;
    let velo = 3;
    const gravity = 0.8;

    function insertDisk(colIndex: number) {
        if (animating) return;
        if (gameFinished.finished) return;
        if (mode === 'cpu' && !isRedTurn) return;  // cpu's turn
        addDisk(colIndex);
        lastAddedCol.current = colIndex;
    }

    function firstFrame(rowIndex: number) {
        if (!newlyAddedDisk.current) return

        ypos = -630 + (rowIndex * 88);

        setAnimating(true);
        newlyAddedDisk.current.style.transform = `translateY(${ypos}px)`;
        newlyAddedDisk.current.style.display = 'block';
        fallDown();
    }

    function fallDown() {
        if (!newlyAddedDisk.current) return
        
        ypos = Math.min(0, ypos + velo)
        newlyAddedDisk.current.style.transform = `translateY(${ypos}px)`;
        velo += gravity;

        if (ypos < 0) {
            requestAnimationFrame(fallDown);
        } else {
            setAnimating(false);
            velo = 3;
        }
    }

    useEffect(() => {
        if (width < 690) {
            if (lastAddedCol.current === null) return

            const rowIndex = disksInHolder[lastAddedCol.current].length - 1;
            checkConnectFour(lastAddedCol.current, rowIndex, isRedTurn);
            return
        }
        if (lastAddedCol.current === null) return

        // start the animation
        firstFrame(disksInHolder[lastAddedCol.current].length)
    }, [disksInHolder])

    useEffect(() => {
        if (animating) {
            pauseTimer()
        } else {
            if (lastAddedCol.current === null) return

            const rowIndex = disksInHolder[lastAddedCol.current].length - 1;
            checkConnectFour(lastAddedCol.current, rowIndex, isRedTurn)
        }
    }, [animating])

    useEffect(() => {
        startTimer();

        // cpu's turn  (This logic is simply adding the disk randomly)
        if (mode === 'cpu' && !isRedTurn) {
            let index = Math.floor(Math.random() * 7);
            if (disksInHolder[index].length >= 6) {
                const freeColumnIndexes = disksInHolder
                    .filter(col => col.length < 6)
                    .map((x, i) => i);

                index = freeColumnIndexes[Math.floor(Math.random() * freeColumnIndexes.length)];
            }
            setTimeout(() => {
                addDisk(index);
                lastAddedCol.current = index;
            }, 1500);
        }
    }, [isRedTurn])

    useEffect(() => {
        if (!timerDone) return

        // When the timer is done, add disk randomly
        let index = Math.floor(Math.random() * 7);
        if (disksInHolder[index].length >= 6) {
            const freeColumnIndexes = disksInHolder
                .filter(col => col.length < 6)
                .map((x, i) => i);

            index = freeColumnIndexes[Math.floor(Math.random() * freeColumnIndexes.length)];
        }
        addDisk(index);
        lastAddedCol.current = index;
    }, [timerDone])

    // accessibility
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            switch(e.code) {
                case "Enter":
                case "Space":
                    if (focusIndex !== undefined) {
                        insertDisk(focusIndex)
                    }
            }
        }
        document.addEventListener('keydown', handler);

        return () => document.removeEventListener('keydown', handler);
    }, [focusIndex, insertDisk, gameFinished])

    return (
        <div className={styles.container}>
            <ResponsiveImg 
                mobileSrc={blackBgSmall}
                desktopSrc={blackBgLarge}
                alt=""
                styleClassName={styles['black-bg']}
                priority
            />
            <ResponsiveImg 
                mobileSrc={whiteBgSmall}
                desktopSrc={whiteBgLarge}
                alt=""
                styleClassName={styles['white-bg']}
            />
            <div className={styles['disks-container']}>
                {disksInHolder.map((col, i) => (
                    <div 
                        key={`col-${i}`}
                        tabIndex={i + 1}
                        className={`${styles.column}`}
                        onFocus={() => setFocusIndex(i)}
                        onClick={() => insertDisk(i)}
                    >
                        {/* hover effect */}
                        { disksInHolder[i].length >= 6 
                            ? undefined 
                            : isRedTurn 
                                ? <Image className={styles['red-turn']} src={markerRed} alt="" /> 
                                : mode !== 'cpu' && <Image className={styles['yellow-turn']} src={markerYellow} alt="" />
                        }

                        {col.map((disk, j, arr) => (
                            <div 
                                key={j} 
                                className={disk ? styles['red-disk'] : styles['yellow-disk']}
                                ref={lastAddedCol.current === i && j === arr.length - 1 ? newlyAddedDisk : null}    
                                style={width < 690 ? {display: 'block'} : undefined}                           
                            >
                                {gameFinished.finished && gameFinished.connect4Indexes?.some(arr => arr[0] === i && arr[1] === j)
                                    ? <div className={styles['connect-four']}></div>
                                    : null
                                }
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <Timer mode={mode} />
        </div>
    )
}