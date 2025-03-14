import Image from "next/image";
import logoIcon from '@/assets/images/logo.svg';
import vsCpu from '@/assets/images/player-vs-cpu.svg'
import vsPlayer from '@/assets/images/player-vs-player.svg';
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.container}>

      <div>

        <Image src={logoIcon} alt="logo icon" className={styles.logo} />

        <div className={styles['links-container']}>
          <Link href='/game/cpu' className="red-bg btn">
            play vs cpu
            <div><Image src={vsCpu} alt="" /></div>
          </Link>
          <Link href='/game/player' className="yellow-bg btn">
            play vs player
            <div><Image src={vsPlayer} alt="" /></div>
          </Link>
          <Link href='/rules' className="white-bg btn">
            game rules
          </Link>
        </div>

      </div>

    </main>
  );
}
