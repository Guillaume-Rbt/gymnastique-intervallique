import { useLayoutEffect, useRef } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import { useGameContext } from "../../hooks/useGameContext";
import Button from "../../components/ui/Button";
import useBoolean from "../../hooks/useBoolean";
import TrophyIcon from "../../assets/images/trophy.svg?react";
import { scormWrapper } from "../../libs/scormWrapper";
import { createScope, createTimeline, Scope, utils, stagger } from "animejs";
import GameSummary from "./GameSummary";
import Volume from "../../components/ui/Volume";

export function End() {
 const root = useRef<HTMLDivElement | null>(null);
 const scope = useRef<Scope | null>(null);

 const { game, animManager } = useGameContext();

 const itemsRef = useRef(new Map<string, HTMLElement>());

 const setItemRef = (id: string) => (el: HTMLElement | null) => {
  if (el) itemsRef.current.set(id, el);
  else itemsRef.current.delete(id); // element unmounted -> cleanup
 };
 const [visible, setVisibleTrue, setVisibleFalse] = useBoolean(false);
 const [resultsShown, showResult, hideResult] = useBoolean(false);

 useLayoutEffect(() => {
  if (!root.current) return;
  if (scope.current) return;

  scope.current = createScope({ root: root.current }).add((_) => {
   if (!root.current) return;

   function endEnterInit() {
    utils.set(root.current!, { opacity: 0 });

    utils.set([...itemsRef.current.values()], { opacity: 0, translateY: -20 });
   }

   function endEnterPlay() {
    const timeline = createTimeline({
     defaults: { ease: "outQuad" },
     onBegin: () => {
      return {
       name: "end-enter",
       callback: () => {
        setVisibleTrue();
       },
      };
     },
    });

    timeline
     .add(root.current!, {
      opacity: [0, 1],
      duration: 400,
     })
     .add(
      [...itemsRef.current.values()],
      {
       opacity: [0, 1],
       translateY: [-20, 0],
       duration: 400,
       delay: stagger(100),
      },
      "+=200",
     );

    return timeline;
   }

   function endExitInit() {
    utils.set(root.current!, { opacity: 1 });
   }

   function endExitPlay() {
    const timeline = createTimeline({
     defaults: { ease: "outQuad" },
     onComplete: () => {
      return {
       name: "end-exit-end",
       callback: () => {
        animManager.getAnimationById("end-enter")?.reset();
        animManager.getAnimationById("end-exit")?.reset();
        setVisibleFalse();
        game.launchSession();
       },
      };
     },
    });
    timeline.add(root.current!, {
     opacity: [1, 0],
     duration: 400,
    });
    return timeline;
   }

   animManager.register({
    name: "end-enter",
    initializer: endEnterInit,
    executor: endEnterPlay,
   });

   animManager.register({
    name: "end-exit",
    initOnLaunch: true,
    initializer: endExitInit,
    executor: endExitPlay,
   });
  });

  return () => {
   scope.current?.revert();
   scope.current = null;
   animManager.unregister("end-enter");
   animManager.unregister("end-exit");
  };
 }, []);

 useGameEffect({
  onEnter: {
   [GAME_STATES.ENDED]: () => {
    scormWrapper.saveNewScore(game.score);
    if (game.score > scormWrapper.getScore()) scormWrapper.saveScore(game.score);
    animManager.launch("end-enter");
   },
  },

  onExit: {
   [GAME_STATES.ENDED]: () => {
    animManager.launch("end-exit");
   },
  },
 });

 return (
  <div
   ref={root}
   className={`bg-[image:inherit] bg-center bg-fixed bg-cover bg-no-repeat text-theme-light position-fixed w-full h-full bg-theme-blue z-999 transition-opacity duration-200 ${visible ? "" : "pointer-events-none"}`}>
   <div className='flex flex-col flex-items-center justify-center h-full w-full bg-theme-blue/80 backdrop-blur-3xl gap-10 p-block-6 text-center'>
    {" "}
    <div className='flex flex-col flex-items-center gap-7 h-full w-full'>
     <h1 ref={setItemRef("title")} className='text-4xl font-bold'>
      Gymnastique Intervallique
     </h1>

     <div className='flex flex-col gap-2 flex-items-center'>
      <div
       ref={setItemRef("result")}
       className='flex flex-col gap-2 text-10 border-1 border-solid border-theme-light p-5 rounded-3 bg-theme-light/10'>
       <p className='text-4'>Vous avez obtenu&nbsp;:</p>
       <p>
        {game.score} point{game.score > 1 ? "s" : ""}
       </p>
      </div>
      {scormWrapper.getScore() > 0 && (
       <p className='flex flex-items-center gap-3'>
        <TrophyIcon className='text-7 color-theme-light'></TrophyIcon>
        <span>
         Meilleur score : {scormWrapper.getScore()} point
         {scormWrapper.getScore() > 1 ? "s" : ""}
        </span>
       </p>
      )}
     </div>

     <div className='grid h-1 grid-cols-2 flex-grow w-full px-10'>
      <GameSummary></GameSummary>
     </div>

     <div className='flex w-full gap-3 px-10'>
      <Volume></Volume>
      <div ref={setItemRef("button-new-game")} className='m-inline-auto'>
       <Button onClick={() => game.reset()} classes={"btn-primary w-full m-inline-auto"} label='Nouvelle partie' />
      </div>
     </div>
    </div>
    {!resultsShown && <></>}
    {/*        <div className={`w-full h-full flex flex-col ${resultsShown ? "" : "hidden"} gap-6`}>
                    <div className='flex w-full p-inline-6'>
                        <Button
                            onClick={hideResult}
                            classes='text-5.5 color-theme-light px-2.25 py-1.25 flex flex-items-center flex-justify-center border-1 border-solid border-theme-light/40 bg-theme-light/5 rounded-2 hover:bg-white/20'>
                            <BackIcon />
                        </Button>
                    </div>

                    <div
                        ref={scrollableRef}
                        className='flex grow overflow-hidden scrollbar-hover flex-col position-relative flex-items-center p-is-2 pie-6'>
                        <Scrollbar containerRef={scrollableRef} elementRef={elementRef} />
                        <div ref={elementRef} className='flex flex-col position-relative flex-items-center'>
                            <h1 className='mb-8 text-8'>Vos réponses</h1>
                            <table className='table-auto text-left border-collapse'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th className='border border-solid border-theme-light/30 py-3 px-3'>
                                            Intervalle
                                        </th>
                                        <th className='border border-solid border-theme-light/30 py-3 px-3'>
                                            Votre réponse
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {answeredInterval
                                        .map((item) => {
                                            const answer =
                                                intervals.indexOf(item.answer) == -1
                                                    ? "Non répondu"
                                                    : buttons[intervals.indexOf(item.answer)];

                                            return {
                                                expected: buttons[intervals.indexOf(item.expected)],
                                                answer: answer,
                                                interval: item.interval,
                                                correct: item.correct,
                                            };
                                        })
                                        .map((item, i) => {
                                            const classes = item.correct ? "color-theme-correct" : "color-theme-wrong";

                                            return (
                                                <tr key={item.interval.id}>
                                                    <td className='text-center border border-solid border-theme-light/30 py-2 px-3 vertical-middle'>
                                                        {i + 1}
                                                    </td>
                                                    <td className='border border-solid border-theme-light/30 py-2 px-3 scroll-snap-start '>
                                                        {" "}
                                                        <ButtonPlay
                                                            size='small'
                                                            interval={item.interval}
                                                            stateFollowsGame={false}
                                                            enabledOnInit={true}
                                                        />
                                                    </td>

                                                    <td
                                                        className='vertical-middle border border-solid border-theme-light/30 px-3'
                                                        dangerouslySetInnerHTML={{ __html: item.expected }}></td>
                                                    <td
                                                        className={`${classes} border border-solid border-theme-light/30 px-3`}
                                                        dangerouslySetInnerHTML={{ __html: item.answer }}></td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div> */}
   </div>
  </div>
 );
}
