import { scormWrapper } from "../../libs/scormWrapper";
import Card from "../../components/ui/Card";
import EqualIcon from "../../assets/images/equal.svg?react";
import MoreIcon from "../../assets/images/more.svg?react";
import LessIcon from "../../assets/images/less.svg?react";

export default function LatestGames({ className = [] }: { className?: string[] }) {
    const data = scormWrapper.getLastTenScores().map((d) => ({
        score: d.score,
        id: d.id,
        date: new Date(d.date).toLocaleDateString(),
    }));

    return (
        <Card title='Vos 10 dernières parties' className={className}>
            <div className='flex position-relative flex-col gap-2 px-2 w-full'>
                {data.length > 0
                    ? data.map((v, i) => {
                          let evolution = "same";

                          if (i != data.length - 1) {
                              evolution =
                                  v.score == data[i + 1].score ? "same" : v.score < data[i + 1].score ? "less" : "more";
                          }

                          const EvolutionIncon =
                              evolution == "same" ? (
                                  <EqualIcon className='ml-auto'></EqualIcon>
                              ) : evolution == "less" ? (
                                  <LessIcon className='ml-auto text-theme-wrong'></LessIcon>
                              ) : (
                                  <MoreIcon className='ml-auto text-theme-correct' />
                              );

                          return (
                              <div key={v.id} className='bg-white/10 border-.2 border-solid border-white p-3 rounded-3'>
                                  <div className='flex w-full items-center'>
                                      <p>
                                          Partie jouée le {v.date} : {v.score} point(s)
                                      </p>

                                      {i != data.length - 1 && EvolutionIncon}
                                  </div>
                              </div>
                          );
                      })
                    : "Vous n'avez pas encore de partie enregistrée"}
            </div>
        </Card>
    );
}
