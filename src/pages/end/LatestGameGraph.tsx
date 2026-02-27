import { useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { scormWrapper } from "../../libs/scormWrapper";
import Card from "../../components/ui/Card";

export default function LatestGameGraph({
    isAnimationActive = false,
    className = [],
}: {
    isAnimationActive?: boolean;
    className?: string[];
}) {
    const [data] = useState<{ name: string; score: number }[]>(() => {
        const scormData = scormWrapper.data["cmi.suspend_data"];

        return scormData.split("@").map((score, i) => {
            return { score: parseInt(score, 10), name: `Partie ${i + 1}` };
        });
    });

    return (
        <Card title='Vos 10 dernières parties' className={className}>
            <div className='graph-container h-full'>
                <LineChart
                    margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                    style={{ width: "100%", height: "100%" }}
                    responsive={true}
                    data={data}>
                    <XAxis
                        dataKey={(data) => {
                            return data.name.slice(-2).trim().padStart(2, "0");
                        }}
                    />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Line
                        type='monotone'
                        dataKey='score'
                        stroke='#ff375f'
                        activeDot={{ r: 8 }}
                        isAnimationActive={isAnimationActive}
                    />
                </LineChart>
            </div>
        </Card>
    );
}
