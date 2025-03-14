import GameMain from "./GameMain";
import { GameProvider } from "@/context/GameContext";
import { TimerProvider } from "@/context/TimerContext";
import GameHeader from "./GameHeader";

type Props = {
    mode: 'player' | 'cpu'
}

export default function Game({ mode }: Props) {
    return (
        <main>
            <GameProvider>
                <TimerProvider>
                    <GameHeader />
                    <GameMain mode={mode} />
                </TimerProvider>
            </GameProvider>
        </main>
    )
}