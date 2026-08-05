import Image from "next/image"

type GorillaDecor = {
  src: string
  wrap: string
  img: string
  anim: string
}

const DESKTOP_GORILLAS: GorillaDecor[] = [
  {
    src: "/decor/gorilla-side.png",
    wrap: "absolute top-[50%] left-0 w-[min(24rem,40vw)] -translate-x-[52%] -translate-y-1/2",
    img: "opacity-[0.12] mix-blend-multiply",
    anim: "mascot-bg-drift-a",
  },
  {
    src: "/decor/gorilla-roar.png",
    wrap: "absolute top-[42%] right-0 w-[min(28rem,44vw)] translate-x-[50%] -translate-y-1/2",
    img: "scale-x-[-1] opacity-[0.13] mix-blend-multiply",
    anim: "mascot-bg-drift-b",
  },
  {
    src: "/decor/gorilla-outdoor.png",
    wrap: "absolute bottom-0 left-1/2 w-[min(32rem,55vw)] -translate-x-1/2 translate-y-[42%]",
    img: "opacity-[0.11] mix-blend-multiply",
    anim: "mascot-bg-drift-c",
  },
]

const MOBILE_GORILLAS: GorillaDecor[] = [
  {
    src: "/decor/gorilla-side.png",
    wrap: "absolute top-[18%] left-0 w-[min(7rem,26vw)] -translate-x-[48%]",
    img: "opacity-[0.07] mix-blend-multiply",
    anim: "mascot-bg-drift-a",
  },
  {
    src: "/decor/gorilla-roar.png",
    wrap: "absolute top-[32%] right-0 w-[min(8rem,28vw)] translate-x-[46%]",
    img: "scale-x-[-1] opacity-[0.075] mix-blend-multiply",
    anim: "mascot-bg-drift-b",
  },
  {
    src: "/decor/gorilla-outdoor.png",
    wrap: "absolute bottom-[8%] left-1/2 w-[min(9rem,32vw)] -translate-x-1/2 translate-y-[35%]",
    img: "opacity-[0.065] mix-blend-multiply",
    anim: "mascot-bg-drift-c",
  },
]

const ORBS = [
  "absolute -top-24 left-[12%] h-72 w-72 rounded-full bg-purple-400/20 blur-3xl mascot-orb-a",
  "absolute top-[55%] right-[8%] h-56 w-56 rounded-full bg-violet-300/15 blur-3xl mascot-orb-b",
  "absolute bottom-[18%] left-[6%] h-48 w-48 rounded-full bg-fuchsia-300/12 blur-3xl mascot-orb-c",
] as const

function GorillaLayer({ items, visibility }: { items: GorillaDecor[]; visibility: string }) {
  return (
    <>
      {items.map((item) => (
        <div key={`${visibility}-${item.src}`} className={`${visibility} ${item.wrap}`}>
          <div className={item.anim}>
            <Image
              src={item.src}
              alt=""
              width={680}
              height={680}
              unoptimized
              className={`h-auto w-full max-w-none select-none ${item.img}`}
            />
          </div>
        </div>
      ))}
    </>
  )
}

export function MascotBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f4ff] via-[#fffeff] to-[#f3ebff]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(147,51,234,0.09),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_100%_80%,rgba(168,85,247,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_0%_60%,rgba(192,132,252,0.05),transparent_45%)]" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(147,51,234,0.55) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {ORBS.map((className, i) => (
        <div key={i} className={className} />
      ))}

      <GorillaLayer items={DESKTOP_GORILLAS} visibility="hidden md:block" />
      <GorillaLayer items={MOBILE_GORILLAS} visibility="md:hidden" />
    </div>
  )
}
