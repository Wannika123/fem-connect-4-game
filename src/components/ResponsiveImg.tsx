'use client'

import { useWindowSize } from "@/hooks/useWindowSize";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

type Props = {
    mobileSrc: StaticImport
    desktopSrc: StaticImport
    alt: string
    sizes?: string
    styleClassName?: string
    priority?: boolean
}

export default function ResponsiveImg({ 
    mobileSrc, 
    desktopSrc, 
    alt, 
    sizes,
    styleClassName, 
    priority
}: Props) {
    const { width } = useWindowSize();

    if (width === 0) {
        return null
    }

    let src: StaticImport;
    if (width < 690) {
        src = mobileSrc
    } else {
        src = desktopSrc
    }

    return (
        <Image 
            src={src} 
            alt={alt} 
            style={{
                width: '100%',
                height: 'auto',
            }}
            sizes={sizes}
            className={styleClassName}
            priority={priority ? true : false}
        />
    )
}