import { useRef, useState } from "react";
import { useGameEffect } from "../../hooks/useGameEffect";
import { GAME_STATES } from "../../libs/game";
import type { AnsweredIntervalType } from "../../libs/types";
import { useGameContext } from "../../hooks/useGameContext";
import { intervals, buttons } from "../../utils/constants";
import ButtonPlay from "../../components/game/ButtonPlay";
import { Scrollbar } from "../../components/ui/Scrollbar";

export default function GameSummary() {
 const { game } = useGameContext();
 const [answeredIntervals, setAnsweredIntervals] = useState<AnsweredIntervalType[]>([]);

 const containerRef = useRef<HTMLDivElement>(null);
 const elementRef = useRef<HTMLDivElement>(null);

 useGameEffect({
  onEnter: {
   [GAME_STATES.ENDED]: () => {
    setAnsweredIntervals(Array.from(game.answeredIntervals.values()));
   },
  },
 });

 return (
  <div className='rounded-3 overflow-hidden border-solid flex flex-col border-theme-light w-full border-.2'>
   <div className='w-full bg-theme-light/10 p-block-2'>
    <p className='p-2 text-align-start'>Vos réponses</p>
   </div>

   <div ref={containerRef} className='flex w-full h-1 flex-grow position-relative overflow-hidden p-ie-3 mt-2 mb-2'>
    <Scrollbar containerRef={containerRef} elementRef={elementRef}></Scrollbar>
    <div ref={elementRef} className='flex position-relative flex-col gap-2 px-2 w-full'>
     {answeredIntervals
      .map((item) => {
       const answer = intervals.indexOf(item.answer) == -1 ? "Non répondu" : buttons[intervals.indexOf(item.answer)];

       return {
        expected: buttons[intervals.indexOf(item.expected)],
        answer: answer,
        interval: item.interval,
        correct: item.correct,
       };
      })
      .map((item, i) => {
       const border = item.correct ? "border-theme-correct" : "border-theme-wrong";
       const bg = item.correct ? "bg-theme-correct/20" : "bg-theme-wrong/20";
       const text = item.correct
        ? `Bien joué ! Vous avez trouvé l'intervalle.`
        : `Dommage&nbsp;! ${item.answer == "Non répondu" ? "Vous n'avez pas répondu." : ` Vous avez répondu ${item.answer}`}`;

       return (
        <div
         key={item.interval.id}
         className={`flex flex-col flex-items-start gap-2 p-3 rounded-3 w-full ${bg} border-solid ${border} border-.2`}>
         <p className='font-bold text-align-start'>
          Intervalle {i + 1}&nbsp;:{" "}
          <span className='font-500' dangerouslySetInnerHTML={{ __html: buttons[item.interval.length] }}></span>
         </p>
         <div className='flex w-full gap-3 flex-items-center'>
          <ButtonPlay size='small' interval={item.interval} stateFollowsGame={false} enabledOnInit={true} />
          <p className='text-align-start' dangerouslySetInnerHTML={{ __html: text }} />
         </div>
        </div>
       );
      })}
    </div>
   </div>
  </div>
 );
}
