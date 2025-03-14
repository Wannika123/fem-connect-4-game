'use client'

import { useContext } from 'react';
import styles from './GameMain.module.css';
import Holder from './Holder';
import youIcon from '@/assets/images/you.svg';
import cpuIcon from '@/assets/images/cpu.svg';
import p1Icon from '@/assets/images/player-one.svg';
import p2Icon from '@/assets/images/player-two.svg';
import { GameContext } from '@/context/GameContext';
import Image from 'next/image';

type Props = {
    mode: 'player' | 'cpu'
}

export default function GameMain({ mode }: Props) {
    const { redWinCount, yellowWinCount, gameFinished } = useContext(GameContext);

    const redLabel = mode === 'cpu' ? 'YOU' : 'PLAYER 1';
    const redIcon= mode === 'cpu' ? youIcon : p1Icon;
    const yellowLabel = mode === 'cpu' ? 'CPU' : 'PLAYER 2';
    const yellowIcon = mode === 'cpu' ? cpuIcon : p2Icon;

    return (
        <div className={styles.container}>
            <div className={styles['grid-container']}>
                <div className={`${styles['red-player']} ${styles.player}`}>
                    <Image src={redIcon} alt='red player icon' />
                    <div className={styles['player-label']}>{redLabel}</div>
                    <div className={styles['win-count']}>{redWinCount}</div>
                </div>
                <div className={styles.holder}>
                    <Holder mode={mode} />
                </div>
                <div className={`${styles['yellow-player']} ${styles.player}`}>
                    <Image src={yellowIcon} alt='yellow player icon' />
                    <div className={styles['player-label']}>{yellowLabel}</div>
                    <div className={styles['win-count']}>{yellowWinCount}</div>
                </div>
            </div>
            
            <div className={styles['bg-decoration']} style={
                { backgroundColor: (!gameFinished.finished 
                    ? '#5c2dd5' 
                    : gameFinished.winner 
                        ? '#fd6687'
                        : '#ffce67' 
            )}}></div>
        </div>
    )
}