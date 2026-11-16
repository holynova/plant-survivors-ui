import type {PropsWithChildren,Ref} from 'react';
// Let the phone browser own touch scrolling and inertia. No simulated device/keyboard.
export function GameScroll({children,className='',ref}:PropsWithChildren<{className?:string,ref?:Ref<HTMLElement>}>){return <section ref={ref} className={`game-scroll ${className}`}><div className="game-scroll-content">{children}</div></section>}
