'use client'

import logo from '@/assets/images/logo.svg';
import Image from 'next/image';
import { useContext, useState, useRef, useEffect } from "react";
import { GameContext } from "@/context/GameContext";
import styles from './GameHeader.module.css'
import Link from 'next/link';
import { TimerContext } from '@/context/TimerContext';

export default function GameHeader() {
    const { restart } = useContext(GameContext);
    const { pauseTimer, resumeTimer, startTimer } = useContext(TimerContext)

    const [menuOpen, setMenuOpen] = useState(false);

    const dialogRef = useRef<HTMLDialogElement>(null)
    
    useEffect(() => {  
        if (menuOpen) {
            dialogRef.current?.showModal();
            pauseTimer();
        } else {
            dialogRef.current?.close();
            resumeTimer();
        }       
    }, [menuOpen])

    return (
        <>
            <div className={styles['header-container']}>
                <button onClick={() => setMenuOpen(true)}>menu</button>
                <Image src={logo} alt='logo icon' />
                <button onClick={() => { restart(); startTimer(); }}>restart</button>
            </div>
            <dialog ref={dialogRef} className={styles.modal} id='menu-modal'>
                <h1>PAUSE</h1>
                <div className={styles['btns-container']}>
                    <button className='btn white-bg' onClick={() => setMenuOpen(false)}>continue game</button>
                    <button className='btn white-bg' onClick={() => { 
                        restart(); 
                        setMenuOpen(false);
                        startTimer();
                    }}>restart</button>
                    <Link className='btn red-bg' href='/'>quit game</Link>
                </div>
            </dialog>
        </>
    )
}