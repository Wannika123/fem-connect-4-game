import Game from "@/components/game/Game";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ mode: string }>
}

export default async function GamePage({ params }: Props) {

    const currParams = await params;
    const playMode = currParams.mode;

    if (playMode !== 'player' && playMode !== 'cpu') {
        notFound();
    }
    
    return (
        <Game mode={playMode} />
    )
}